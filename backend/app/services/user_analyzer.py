import re
import logging
from typing import Dict, List, Any, Optional, Set
from collections import Counter, defaultdict
from datetime import datetime
import emoji
import os
import time
import json

# Import custom modules
from app.models.chat_models import UserProfile, Message
from app.services.chat_parser import ChatParser
from app.services.nlp_service import NLPProcessor

logger = logging.getLogger(__name__)

class UserAnalyzer:
    """Service for analyzing user profiles from chat data."""
    
    def __init__(self, chat_parser: ChatParser, nlp_processor=None):
        """
        Initialize with a chat parser and optional NLP processor.
        
        Args:
            chat_parser: Instance of ChatParser to access message data
            nlp_processor: Optional NLP processor for topic extraction and sentiment analysis
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
                
    def _get_cache_path(self, key):
        """Get the cache file path for a given key."""
        return os.path.join(self.cache_dir, f"{key}.json")
    
    def _cache_is_valid(self, cache_path):
        """Check if cache exists and is not expired."""
        if not os.path.exists(cache_path):
            return False
        
        # Check if cache file is newer than TTL
        file_age = time.time() - os.path.getmtime(cache_path)
        return file_age < self.cache_ttl
    
    def _read_from_cache(self, key):
        """Try to read data from cache."""
        cache_path = self._get_cache_path(key)
        
        if self._cache_is_valid(cache_path):
            try:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    logger.info(f"Loading user profile from cache: {cache_path}")
                    data = json.load(f)
                    
                    # Handle different cache types
                    if key == "user_list":
                        return data  # Return list directly
                    else:
                        # Convert the JSON data back to UserProfile object
                        return UserProfile(**data)
            except Exception as e:
                logger.error(f"Error reading from cache: {e}")
                
        return None
    
    def _write_to_cache(self, key, data):
        """Write data to cache."""
        cache_path = self._get_cache_path(key)
        
        try:
            # Ensure data is serializable by converting to dict
            if isinstance(data, UserProfile):
                data_dict = data.dict()
            else:
                data_dict = data
                
            with open(cache_path, 'w', encoding='utf-8') as f:
                logger.info(f"Writing user profile to cache: {cache_path}")
                json.dump(data_dict, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error writing to cache: {e}")
    
    def get_user_list(self) -> List[Dict[str, Any]]:
        """Get a list of all users in the chat with basic info."""
        # Try to get from cache
        cache_key = "user_list"
        cached_data = self._read_from_cache(cache_key)
        if cached_data:
            return cached_data
            
        user_list = self.chat_parser.get_user_ids()
        
        # Cache the result
        self._write_to_cache(cache_key, user_list)
        
        return user_list
    
    def get_user_profile(self, user_id: str) -> UserProfile:
        """
        Generate a comprehensive profile for a specific user.
        
        Args:
            user_id: User ID to analyze
            
        Returns:
            UserProfile object with detailed analytics
        """
        try:
            # Try to get from cache first
            cache_key = f"user_profile_{user_id}"
            cached_profile = self._read_from_cache(cache_key)
            if cached_profile:
                return cached_profile
            
            messages = list(self.chat_parser.stream_messages(user_filter=[user_id], limit=None))
            
            if not messages:
                return UserProfile(
                    user_id=user_id,
                    name="Unknown User",
                    message_count=0
                )
            
            # Basic user info
            name = messages[0].from_name if messages else "Unknown User"
            
            # Message dates
            dates = [datetime.fromisoformat(msg.date) for msg in messages if hasattr(msg, 'date')]
            first_date = min(dates).isoformat() if dates else None
            last_date = max(dates).isoformat() if dates else None
            
            # Count active days
            active_days = len(set(d.date() for d in dates))
            
            # Activity patterns by hour and weekday
            hours_count = Counter(d.hour for d in dates)
            weekdays_count = Counter(d.weekday() for d in dates)
            
            # Media counts
            media_count = defaultdict(int)
            for msg in messages:
                if hasattr(msg, 'media_type') and msg.media_type:
                    media_count[msg.media_type] += 1
                if hasattr(msg, 'photo') and msg.photo:
                    media_count['photo'] = media_count.get('photo', 0) + 1
            
            # Count emojis
            emoji_count = 0
            for msg in messages:
                if isinstance(msg.text, str):
                    emoji_count += len([c for c in msg.text if c in emoji.EMOJI_DATA])
                elif isinstance(msg.text, list):
                    for item in msg.text:
                        if isinstance(item, str):
                            emoji_count += len([c for c in item if c in emoji.EMOJI_DATA])
                        elif isinstance(item, dict) and 'text' in item:
                            emoji_count += len([c for c in item['text'] if c in emoji.EMOJI_DATA])
            
            # Count URL shares
            link_count = 0
            for msg in messages:
                if isinstance(msg.text, str):
                    link_count += len(self.url_pattern.findall(msg.text))
                elif isinstance(msg.text, list):
                    for item in msg.text:
                        if isinstance(item, str):
                            link_count += len(self.url_pattern.findall(item))
                        elif isinstance(item, dict) and 'text' in item:
                            link_count += len(self.url_pattern.findall(item['text']))
            
            # Count forwarded messages
            forwarded_count = sum(1 for msg in messages if hasattr(msg, 'forwarded_from') and msg.forwarded_from)
            
            # Calculate average message length
            text_lengths = []
            for msg in messages:
                if isinstance(msg.text, str):
                    text_lengths.append(len(msg.text))
                elif isinstance(msg.text, list):
                    text_content = ""
                    for item in msg.text:
                        if isinstance(item, str):
                            text_content += item
                        elif isinstance(item, dict) and 'text' in item:
                            text_content += item['text']
                    text_lengths.append(len(text_content))
            
            avg_length = sum(text_lengths) / len(text_lengths) if text_lengths else 0
            
            # Extract message content for NLP analysis
            all_text = []
            for msg in messages:
                if isinstance(msg.text, str):
                    all_text.append(msg.text)
                elif isinstance(msg.text, list):
                    text_content = ""
                    for item in msg.text:
                        if isinstance(item, str):
                            text_content += item
                        elif isinstance(item, dict) and 'text' in item:
                            text_content += item['text']
                    all_text.append(text_content)
            
            # Get sentiment analysis
            sentiment = {"positive": 0.0, "negative": 0.0, "neutral": 0.0}
            if self.nlp_processor and all_text:
                sentiment = self.nlp_processor.analyze_sentiment(" ".join(all_text[:100]))  # Limit to avoid overload
            
            # Get topic analysis
            topics = []
            if self.nlp_processor and all_text:
                topics = self.nlp_processor.extract_topics(" ".join(all_text[:200]))  # Limit to avoid overload
            
            # User interactions (replies)
            interactions = []
            # This is a placeholder - you'd need to analyze reply_to_message_id and match with other messages
            
            # Generate a summary
            summary = self._generate_user_summary(
                name, 
                len(messages), 
                active_days, 
                dict(hours_count), 
                dict(weekdays_count),
                avg_length,
                emoji_count,
                dict(media_count),
                link_count,
                forwarded_count,
                topics,
                sentiment
            )
            
            # Create and return the profile
            profile = UserProfile(
                user_id=user_id,
                name=name,
                message_count=len(messages),
                first_message_date=first_date,
                last_message_date=last_date,
                active_days=active_days,
                active_hours=dict(hours_count),
                active_weekdays=dict(weekdays_count),
                topics=[{"topic": t[0], "weight": t[1]} for t in topics],
                interaction_users=interactions,
                avg_message_length=avg_length,
                emoji_count=emoji_count,
                media_count=dict(media_count),
                link_count=link_count,
                forwarded_count=forwarded_count,
                sentiment=sentiment,
                summary=summary
            )
            
            # Cache the profile
            self._write_to_cache(cache_key, profile)
            
            return profile
            
        except Exception as e:
            logger.error(f"Error generating user profile for {user_id}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return UserProfile(
                user_id=user_id,
                name="Error",
                message_count=0,
                summary=f"Error generating profile: {str(e)}"
            )
    
    def _generate_user_summary(self, 
                               name: str,
                               message_count: int,
                               active_days: int,
                               hours: Dict[int, int],
                               weekdays: Dict[int, int],
                               avg_length: float,
                               emoji_count: int,
                               media: Dict[str, int],
                               links: int,
                               forwards: int,
                               topics: List,
                               sentiment: Dict[str, float]) -> str:
        """Generate a human-readable summary of the user's behavior."""
        
        # Determine the most active time periods
        most_active_hour = max(hours.items(), key=lambda x: x[1])[0] if hours else None
        most_active_day = max(weekdays.items(), key=lambda x: x[1])[0] if weekdays else None
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        # Determine message style
        if avg_length < 20:
            style = "short, concise messages"
        elif avg_length < 100:
            style = "moderate-length messages"
        else:
            style = "lengthy, detailed messages"
        
        # Determine media usage
        total_media = sum(media.values())
        media_pct = (total_media / message_count) * 100 if message_count > 0 else 0
        
        if media_pct > 30:
            media_style = "frequently shares media"
        elif media_pct > 10:
            media_style = "occasionally shares media"
        else:
            media_style = "rarely shares media"
        
        # Format topics
        top_topics = [t[0] for t in topics[:3]] if topics else []
        topics_text = ", ".join(top_topics) if top_topics else "various topics"
        
        # Determine sentiment
        max_sentiment = max(sentiment.items(), key=lambda x: x[1])
        sentiment_text = f"generally {max_sentiment[0]}" if max_sentiment[1] > 0.5 else "shows mixed sentiment"
        
        # Build the summary
        summary = f"{name} has sent {message_count} messages over {active_days} days. "
        
        if most_active_hour is not None and most_active_day is not None:
            summary += f"Most active on {day_names[most_active_day]} around {most_active_hour}:00. "
        
        summary += f"Typically writes {style} and {media_style}. "
        
        if emoji_count > 0:
            emoji_rate = emoji_count / message_count if message_count > 0 else 0
            if emoji_rate > 0.5:
                summary += "Uses emojis very frequently. "
            elif emoji_rate > 0.2:
                summary += "Uses emojis regularly. "
        
        if links > 0:
            summary += f"Has shared {links} links. "
        
        if forwards > 0:
            summary += f"Has forwarded {forwards} messages. "
        
        summary += f"Primarily discusses {topics_text} and {sentiment_text}."
        
        return summary 