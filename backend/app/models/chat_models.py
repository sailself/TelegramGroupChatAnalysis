from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime

class TextEntity(BaseModel):
    """Represents a text entity in a message."""
    type: str
    text: str

class Message(BaseModel):
    """Base model for a Telegram message."""
    id: int
    type: str
    date: str
    date_unixtime: str
    from_id: Optional[str] = None
    from_name: Optional[str] = Field(None, alias="from")
    text: Union[str, List[Any]] = ""
    text_entities: Optional[List[TextEntity]] = None
    
    # Optional fields for different message types
    photo: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    file: Optional[str] = None
    thumbnail: Optional[str] = None
    media_type: Optional[str] = None
    sticker_emoji: Optional[str] = None
    forwarded_from: Optional[str] = None
    reply_to_message_id: Optional[int] = None
    
    # For service messages
    action: Optional[str] = None
    actor: Optional[str] = None
    actor_id: Optional[str] = None
    
    # For edited messages
    edited: Optional[str] = None
    edited_unixtime: Optional[str] = None
    
    class Config:
        populate_by_name = True  # Handle field aliases

class ChatData(BaseModel):
    """Represents the entire chat export."""
    name: str
    type: str
    id: int
    messages: List[Message] = []

class UserProfile(BaseModel):
    """Represents a user profile with analytics."""
    user_id: str
    name: str
    message_count: int
    first_message_date: Optional[str] = None
    last_message_date: Optional[str] = None
    active_days: int = 0
    active_hours: Dict[int, int] = {}  # Hour -> count
    active_weekdays: Dict[int, int] = {}  # Day -> count
    topics: List[Dict[str, Any]] = []  # [{"topic": str, "weight": float}]
    interaction_users: List[Dict[str, Any]] = []  # [{"user_id": str, "count": int}]
    avg_message_length: float = 0
    emoji_count: int = 0
    media_count: Dict[str, int] = {}  # Media type -> count
    link_count: int = 0
    forwarded_count: int = 0
    sentiment: Dict[str, float] = {"positive": 0, "negative": 0, "neutral": 0}
    summary: str = ""
    
class GroupChatAnalytics(BaseModel):
    """Represents the overall group chat analytics."""
    total_messages: int
    active_users: int
    peak_hours: Dict[int, int]  # Hour -> count
    peak_days: Dict[str, int]  # Day -> count
    top_topics: List[Dict[str, Any]]  # [{"topic": str, "weight": float}]
    most_active_users: List[Dict[str, Any]]  # [{"user_id": str, "count": int}]
    emoji_users: List[Dict[str, Any]]  # [{"user_id": str, "count": int}]
    media_users: List[Dict[str, Any]]  # [{"user_id": str, "count": int}]
    long_message_users: List[Dict[str, Any]]  # [{"user_id": str, "count": int}]
    forwarding_users: List[Dict[str, Any]]  # [{"user_id": str, "count": int}]
    interaction_clusters: List[Dict[str, Any]] = []  # User interaction clusters

class SearchQuery(BaseModel):
    """Model for search queries."""
    query: str
    user_ids: Optional[List[str]] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    message_types: Optional[List[str]] = None
    
class SearchResult(BaseModel):
    """Model for search results."""
    messages: List[Message]
    total_count: int 