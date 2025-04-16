import logging
from typing import Dict, List, Any, Optional, Union
from collections import Counter, defaultdict
from datetime import datetime
import re
import os
import time
import json
from functools import lru_cache

from app.services.chat_parser import ChatParser
from app.services.nlp_service import NLPProcessor
from app.models.chat_models import GroupChatAnalytics

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Service for generating group chat analytics."""
    
    def __init__(self, chat_parser: ChatParser, nlp_processor: Optional[NLPProcessor] = None):
        """
        Initialize the analytics service.
        
        Args:
            chat_parser: Instance of ChatParser
            nlp_processor: Optional NLP processor for text analysis
        """
        self.chat_parser = chat_parser
        self.nlp_processor = nlp_processor or NLPProcessor()
        self.url_pattern = re.compile(r'https?://\S+|www\.\S+')
        self.emoji_pattern = re.compile(r':[a-zA-Z0-9_]+:')
        self.cache_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "cache")
        self._ensure_cache_dir()
        self.cache_ttl = 3600  # Cache validity in seconds (1 hour)
        
    def _ensure_cache_dir(self):
        """Create cache directory if it doesn't exist."""
        if not os.path.exists(self.cache_dir):
            try:
                os.makedirs(self.cache_dir)
                logger.info(f"Created cache directory at {self.cache_dir}")
            except Exception as e:
                logger.error(f"Failed to create cache directory: {e}")
                
    def _get_cache_path(self, key, sample_size=None):
        """Get the cache file path for a given key."""
        sample_suffix = f"_sample_{sample_size}" if sample_size else ""
        return os.path.join(self.cache_dir, f"{key}{sample_suffix}.json")
    
    def _cache_is_valid(self, cache_path):
        """Check if cache exists and is not expired."""
        if not os.path.exists(cache_path):
            return False
        
        # Check if cache file is newer than TTL
        file_age = time.time() - os.path.getmtime(cache_path)
        return file_age < self.cache_ttl
    
    def _read_from_cache(self, key, sample_size=None):
        """Try to read data from cache."""
        cache_path = self._get_cache_path(key, sample_size)
        
        if self._cache_is_valid(cache_path):
            try:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    logger.info(f"Loading analytics from cache: {cache_path}")
                    data = json.load(f)
                    
                    # Convert the JSON data back to GroupChatAnalytics object
                    return GroupChatAnalytics(**data)
            except Exception as e:
                logger.error(f"Error reading from cache: {e}")
                
        return None
    
    def _write_to_cache(self, key, data, sample_size=None):
        """Write data to cache."""
        cache_path = self._get_cache_path(key, sample_size)
        
        try:
            # Ensure data is serializable by converting to dict
            if isinstance(data, GroupChatAnalytics):
                data_dict = data.dict()
            else:
                data_dict = data
                
            with open(cache_path, 'w', encoding='utf-8') as f:
                logger.info(f"Writing analytics to cache: {cache_path}")
                json.dump(data_dict, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error writing to cache: {e}")
            
    def get_mock_analytics(self) -> GroupChatAnalytics:
        """Generate mock analytics data for development and testing."""
        logger.info("Generating mock analytics data")
        
        return GroupChatAnalytics(
            total_messages=5,
            active_users=3,
            peak_hours={9: 2, 10: 3},
            peak_days={"2023-01-01": 3, "2023-01-02": 2},
            top_topics=[{"topic": "greetings", "weight": 0.8}],
            most_active_users=[
                {"user_id": "user1", "count": 2},
                {"user_id": "user2", "count": 2},
                {"user_id": "user3", "count": 1}
            ],
            emoji_users=[],
            media_users=[],
            long_message_users=[],
            forwarding_users=[]
        )
        
    def generate_chat_analytics(self, sample_size: int = None) -> GroupChatAnalytics:
        """
        Generate comprehensive analytics for the entire chat.
        
        Args:
            sample_size: Number of messages to sample for analysis (None means process all messages)
            
        Returns:
            GroupChatAnalytics object with detailed metrics
        """
        try:
            # Check if file exists or if it's a mock file
            if not os.path.exists(self.chat_parser.file_path) or self.chat_parser.file_path.endswith("mock_data.json"):
                logger.info("Using mock analytics data")
                return self.get_mock_analytics()
            
            # Try to get from cache first
            cached_data = self._read_from_cache("chat_analytics", sample_size)
            if cached_data:
                return cached_data
                
            # Get chat info
            chat_info = self.chat_parser.get_chat_info()
            total_messages = chat_info['total_messages']
            
            # For user rankings, process all messages to get accurate counts
            logger.info("Counting user message activity...")
            user_message_counts = Counter()
            emoji_user_counts = defaultdict(int)
            media_user_counts = defaultdict(int)
            long_message_users = defaultdict(int)
            forwarding_users = defaultdict(int)
            
            # First pass: get accurate user activity counts without limiting
            for msg in self.chat_parser.stream_messages(limit=None):
                if msg.type == 'service':
                    continue
                
                # Count messages per user
                if msg.from_id:
                    user_message_counts[msg.from_id] += 1
                
                # Count emoji usage
                if hasattr(msg, 'text'):
                    emoji_count = 0
                    if isinstance(msg.text, str):
                        emoji_count = len(self.emoji_pattern.findall(msg.text))
                    elif isinstance(msg.text, list):
                        for item in msg.text:
                            if isinstance(item, str):
                                emoji_count += len(self.emoji_pattern.findall(item))
                            elif isinstance(item, dict) and 'text' in item:
                                emoji_count += len(self.emoji_pattern.findall(item['text']))
                    
                    if emoji_count > 0 and msg.from_id:
                        emoji_user_counts[msg.from_id] += emoji_count
                
                # Count media sharing
                if (hasattr(msg, 'media_type') and msg.media_type) or (hasattr(msg, 'photo') and msg.photo):
                    if msg.from_id:
                        media_user_counts[msg.from_id] += 1
                
                # Count long messages (> 200 chars)
                if hasattr(msg, 'text'):
                    text_length = 0
                    if isinstance(msg.text, str):
                        text_length = len(msg.text)
                    elif isinstance(msg.text, list):
                        for item in msg.text:
                            if isinstance(item, str):
                                text_length += len(item)
                            elif isinstance(item, dict) and 'text' in item:
                                text_length += len(item['text'])
                    
                    if text_length > 200 and msg.from_id:
                        long_message_users[msg.from_id] += 1
                
                # Count forwarded messages
                if hasattr(msg, 'forwarded_from') and msg.forwarded_from and msg.from_id:
                    forwarding_users[msg.from_id] += 1
            
            # Now do detailed analysis on a sample of messages for topics, etc.
            logger.info("Processing message sample for detailed analysis...")
            hour_counts = Counter()
            day_counts = Counter()
            weekday_counts = Counter()
            
            # Aggregate text for topic analysis
            all_text = []
            
            # Sample messages for pattern analysis
            actual_sample_size = min(sample_size or 10000, total_messages)
            sample_messages = list(self.chat_parser.stream_messages(limit=actual_sample_size))
            
            # Process each message in the sample
            for msg in sample_messages:
                # Skip service messages
                if msg.type == 'service':
                    continue
                
                # Analyze message date/time patterns
                if msg.date:
                    try:
                        date = datetime.fromisoformat(msg.date)
                        hour_counts[date.hour] += 1
                        day_counts[date.strftime('%Y-%m-%d')] += 1
                        weekday_counts[date.weekday()] += 1
                    except (ValueError, TypeError):
                        pass
                
                # Collect text for topic analysis
                if isinstance(msg.text, str) and msg.text:
                    all_text.append(msg.text)
                elif isinstance(msg.text, list):
                    text_content = ""
                    for item in msg.text:
                        if isinstance(item, str):
                            text_content += item
                        elif isinstance(item, dict) and 'text' in item:
                            text_content += item['text']
                    if text_content:
                        all_text.append(text_content)
            
            # Extract topics from collected text
            combined_text = " ".join(all_text[:1000])  # Limit to avoid overload
            topics = self.nlp_processor.extract_topics(combined_text, num_topics=10)
            
            # Calculate peak activity
            peak_hours = dict(hour_counts.most_common(24))
            peak_days = dict(sorted(day_counts.most_common(30), key=lambda x: x[0]))
            
            # Convert defaultdicts to Counters for most_common() method
            emoji_counter = Counter(emoji_user_counts)
            media_counter = Counter(media_user_counts)
            long_msg_counter = Counter(long_message_users)
            fwd_counter = Counter(forwarding_users)
            
            # Get user rankings
            most_active_users = [{"user_id": uid, "count": count} 
                                for uid, count in user_message_counts.most_common(20)]
            
            emoji_users = [{"user_id": uid, "count": count} 
                          for uid, count in emoji_counter.most_common(20)]
            
            media_users = [{"user_id": uid, "count": count} 
                          for uid, count in media_counter.most_common(20)]
            
            long_msg_users = [{"user_id": uid, "count": count} 
                             for uid, count in long_msg_counter.most_common(20)]
            
            fwd_users = [{"user_id": uid, "count": count} 
                        for uid, count in fwd_counter.most_common(20)]
            
            # Create the analytics object
            analytics = GroupChatAnalytics(
                total_messages=total_messages,
                active_users=len(user_message_counts),
                peak_hours=peak_hours,
                peak_days=peak_days,
                top_topics=[{"topic": t[0], "weight": t[1]} for t in topics],
                most_active_users=most_active_users,
                emoji_users=emoji_users,
                media_users=media_users,
                long_message_users=long_msg_users,
                forwarding_users=fwd_users,
                interaction_clusters=[]  # Placeholder for future implementation
            )
            
            # Cache the results
            self._write_to_cache("chat_analytics", analytics, sample_size)
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating chat analytics: {e}")
            import traceback
            logger.error(traceback.format_exc())
            
            # Return empty analytics with error indicator
            return GroupChatAnalytics(
                total_messages=0,
                active_users=0,
                peak_hours={},
                peak_days={},
                top_topics=[],
                most_active_users=[],
                emoji_users=[],
                media_users=[],
                long_message_users=[],
                forwarding_users=[]
            ) 