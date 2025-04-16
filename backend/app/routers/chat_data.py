from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
import os

from app.services.chat_parser import ChatParser

# Configure the router
router = APIRouter()

# Global chat parser instance
_chat_parser = None

def get_chat_parser():
    """Get or initialize the chat parser."""
    global _chat_parser
    if _chat_parser is None:
        # Get the path to the chat export file
        file_path = os.environ.get("CHAT_FILE_PATH", "result.json")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Chat export file not found")
        
        _chat_parser = ChatParser(file_path)
    
    return _chat_parser

@router.get("/chat/info")
async def get_chat_info(parser: ChatParser = Depends(get_chat_parser)):
    """Get basic information about the chat."""
    try:
        info = parser.get_chat_info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat info: {str(e)}")

@router.get("/chat/messages")
async def get_messages(
    skip: int = Query(0, description="Number of messages to skip"),
    limit: int = Query(100, description="Maximum number of messages to return"),
    user_id: Optional[List[str]] = Query(None, description="Filter by user ID"),
    date_from: Optional[str] = Query(None, description="Filter from date (ISO format)"),
    date_to: Optional[str] = Query(None, description="Filter to date (ISO format)"),
    message_type: Optional[List[str]] = Query(None, description="Filter by message type"),
    parser: ChatParser = Depends(get_chat_parser)
):
    """Get messages with pagination and filtering."""
    try:
        messages = list(parser.stream_messages(
            skip=skip,
            limit=limit,
            user_filter=user_id,
            date_from=date_from,
            date_to=date_to,
            message_types=message_type
        ))
        
        return {
            "messages": messages,
            "total": parser.total_messages,  # This is approximate
            "offset": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving messages: {str(e)}") 