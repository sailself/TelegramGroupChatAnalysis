import os
import json
import ijson
from typing import Dict, List, Any, Optional, Generator, Tuple
import logging
from datetime import datetime
import re
from collections import defaultdict

from app.models.chat_models import ChatData, Message

logger = logging.getLogger(__name__)

class ChatParser:
    """Service for parsing Telegram chat export files."""
    
    def __init__(self, file_path: str):
        """Initialize with the path to the Telegram export JSON file."""
        self.file_path = file_path
        self.users_cache = {}  # Cache user info for faster lookups
        self._total_messages = None
    
    @property
    def total_messages(self) -> int:
        """Get total message count (calculates once and caches)."""
        if self._total_messages is None:
            self._count_messages()
        return self._total_messages
    
    def _count_messages(self) -> None:
        """Count messages in the JSON file."""
        try:
            count = 0
            with open(self.file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if '"type": "message"' in line:
                        count += 1
            self._total_messages = count
        except Exception as e:
            logger.error(f"Error counting messages: {e}")
            self._total_messages = 0
    
    def get_chat_info(self) -> Dict[str, Any]:
        """Extract basic chat information."""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                # Read only the chat info part at the beginning
                for prefix, event, value in ijson.parse(f):
                    if prefix == 'name' and event == 'string':
                        name = value
                    elif prefix == 'type' and event == 'string':
                        chat_type = value
                    elif prefix == 'id' and event == 'number':
                        chat_id = int(value)
                    
                    # Break once we reach the messages array
                    if prefix == 'messages' and event == 'start_array':
                        break
                
                return {
                    "name": name if 'name' in locals() else "Unknown Chat",
                    "type": chat_type if 'chat_type' in locals() else "Unknown Type",
                    "id": chat_id if 'chat_id' in locals() else 0,
                    "total_messages": self.total_messages
                }
                
        except Exception as e:
            logger.error(f"Error getting chat info: {e}")
            return {
                "name": "Error",
                "type": "Error",
                "id": 0,
                "total_messages": 0,
                "error": str(e)
            }
    
    def stream_messages(self, 
                        skip: int = 0, 
                        limit: Optional[int] = None,
                        user_filter: Optional[List[str]] = None,
                        date_from: Optional[str] = None,
                        date_to: Optional[str] = None,
                        message_types: Optional[List[str]] = None
                       ) -> Generator[Message, None, None]:
        """
        Stream messages from the JSON file with pagination and filtering.
        
        Args:
            skip: Number of messages to skip (for pagination)
            limit: Maximum number of messages to return
            user_filter: List of user IDs to filter by
            date_from: Filter messages from this date (ISO format)
            date_to: Filter messages up to this date (ISO format)
            message_types: Filter by message types
            
        Yields:
            Message objects that match the criteria
        """
        try:
            # Parse date filters if provided
            from_date = datetime.fromisoformat(date_from) if date_from else None
            to_date = datetime.fromisoformat(date_to) if date_to else None
            
            count = 0
            yielded = 0
            
            with open(self.file_path, 'r', encoding='utf-8') as f:
                for msg in ijson.items(f, 'messages.item'):
                    # Apply filters
                    if user_filter and msg.get('from_id') not in user_filter:
                        continue
                    
                    if message_types and msg.get('type') not in message_types:
                        continue
                    
                    # Apply date filter
                    if from_date or to_date:
                        try:
                            msg_date = datetime.fromisoformat(msg.get('date'))
                            if from_date and msg_date < from_date:
                                continue
                            if to_date and msg_date > to_date:
                                continue
                        except (ValueError, TypeError):
                            # Skip messages with invalid dates
                            continue
                    
                    # Skip messages for pagination
                    if count < skip:
                        count += 1
                        continue
                    
                    # Create Message object and yield
                    try:
                        # Handle "from" field alias
                        if 'from' in msg:
                            msg['from_name'] = msg.pop('from')
                        
                        message = Message(**msg)
                        yield message
                        
                        yielded += 1
                        if limit and yielded >= limit:
                            break
                    except Exception as e:
                        logger.error(f"Error parsing message {msg.get('id')}: {e}")
                        continue
                    
                    count += 1
                    
        except Exception as e:
            logger.error(f"Error streaming messages: {e}")
            yield None
    
    def get_user_ids(self) -> List[Dict[str, Any]]:
        """Get a list of all users in the chat."""
        users = {}
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                for msg in ijson.items(f, 'messages.item'):
                    if 'from_id' in msg and 'from' in msg:
                        user_id = msg['from_id']
                        if user_id and user_id not in users:
                            users[user_id] = {
                                'id': user_id,
                                'name': msg.get('from', 'Unknown'),
                                'message_count': 0
                            }
                        if user_id:
                            users[user_id]['message_count'] += 1
            
            return list(users.values())
        except Exception as e:
            logger.error(f"Error getting user IDs: {e}")
            return []
            
    def search_messages(self, query: str, 
                        user_ids: Optional[List[str]] = None,
                        date_from: Optional[str] = None,
                        date_to: Optional[str] = None,
                        message_types: Optional[List[str]] = None,
                        skip: int = 0,
                        limit: int = 100) -> Tuple[List[Message], int]:
        """
        Search for messages matching the query.
        
        Returns:
            Tuple of (messages, total_count)
        """
        results = []
        total_count = 0
        
        try:
            # Create regex pattern for the search query
            pattern = re.compile(query, re.IGNORECASE)
            
            # Stream messages with filters
            for msg in self.stream_messages(
                skip=0,  # We'll handle pagination manually to count total matches
                user_filter=user_ids,
                date_from=date_from,
                date_to=date_to,
                message_types=message_types
            ):
                # Check if message text matches the query
                if isinstance(msg.text, str) and pattern.search(msg.text):
                    total_count += 1
                    
                    # Apply pagination
                    if total_count > skip and len(results) < limit:
                        results.append(msg)
                elif isinstance(msg.text, list):
                    # Handle complex text structure (list of objects)
                    text_content = ""
                    for item in msg.text:
                        if isinstance(item, str):
                            text_content += item
                        elif isinstance(item, dict) and 'text' in item:
                            text_content += item['text']
                    
                    if pattern.search(text_content):
                        total_count += 1
                        
                        # Apply pagination
                        if total_count > skip and len(results) < limit:
                            results.append(msg)
            
            return results, total_count
            
        except Exception as e:
            logger.error(f"Error searching messages: {e}")
            return [], 0 