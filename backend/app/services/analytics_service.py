import logging
from typing import Dict, List, Any, Optional, Union
from collections import Counter, defaultdict
from datetime import datetime
import re

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
        
    def generate_chat_analytics(self, sample_size: int = 10000) -> GroupChatAnalytics:
        """
        Generate comprehensive analytics for the entire chat.
        
        Args:
            sample_size: Number of messages to sample for analysis (to avoid processing the entire chat)
            
        Returns:
            GroupChatAnalytics object with detailed metrics
        """
        try:
            # Get chat info
            chat_info = self.chat_parser.get_chat_info()
            total_messages = chat_info['total_messages']
            
            # Initialize counters and data structures
            user_message_counts = Counter()
            hour_counts = Counter()
            day_counts = Counter()
            weekday_counts = Counter()
            emoji_user_counts = defaultdict(int)
            media_user_counts = defaultdict(int)
            long_message_users = defaultdict(int)
            forwarding_users = defaultdict(int)
            
            # Aggregate text for topic analysis
            all_text = []
            
            # Sample messages for analysis
            messages = list(self.chat_parser.stream_messages(limit=sample_size))
            
            # Process each message
            for msg in messages:
                # Skip service messages
                if msg.type == 'service':
                    continue
                
                # Count messages per user
                if msg.from_id:
                    user_message_counts[msg.from_id] += 1
                
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
            
            # Extract topics from collected text
            combined_text = " ".join(all_text[:1000])  # Limit to avoid overload
            topics = self.nlp_processor.extract_topics(combined_text, num_topics=10)
            
            # Calculate peak activity
            peak_hours = dict(hour_counts.most_common(24))
            peak_days = dict(sorted(day_counts.most_common(30), key=lambda x: x[0]))
            
            # Get user rankings
            most_active_users = [{"user_id": uid, "count": count} 
                                for uid, count in user_message_counts.most_common(20)]
            
            emoji_users = [{"user_id": uid, "count": count} 
                          for uid, count in emoji_user_counts.most_common(20)]
            
            media_users = [{"user_id": uid, "count": count} 
                          for uid, count in media_user_counts.most_common(20)]
            
            long_msg_users = [{"user_id": uid, "count": count} 
                             for uid, count in long_message_users.most_common(20)]
            
            fwd_users = [{"user_id": uid, "count": count} 
                        for uid, count in forwarding_users.most_common(20)]
            
            # Create and return the analytics object
            return GroupChatAnalytics(
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