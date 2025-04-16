from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional

from app.services.chat_parser import ChatParser
from app.services.user_analyzer import UserAnalyzer
from app.services.nlp_service import NLPProcessor
from app.routers.chat_data import get_chat_parser

# Configure the router
router = APIRouter()

# Global services
_user_analyzer = None
_nlp_processor = None

def get_nlp_processor():
    """Get or initialize the NLP processor."""
    global _nlp_processor
    if _nlp_processor is None:
        _nlp_processor = NLPProcessor()
    return _nlp_processor

def get_user_analyzer(parser: ChatParser = Depends(get_chat_parser),
                     nlp_processor: NLPProcessor = Depends(get_nlp_processor)):
    """Get or initialize the user analyzer."""
    global _user_analyzer
    if _user_analyzer is None:
        _user_analyzer = UserAnalyzer(parser, nlp_processor)
    return _user_analyzer

@router.get("")
async def get_users(analyzer: UserAnalyzer = Depends(get_user_analyzer)):
    """Get a list of all users in the chat."""
    try:
        users = analyzer.get_user_list()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")

@router.get("/{user_id}")
async def get_user_profile(
    user_id: str,
    analyzer: UserAnalyzer = Depends(get_user_analyzer)
):
    """Get detailed profile for a specific user."""
    try:
        profile = analyzer.get_user_profile(user_id)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user profile: {str(e)}")

@router.get("/{user_id}/messages")
async def get_user_messages(
    user_id: str,
    skip: int = Query(0, description="Number of messages to skip"),
    limit: int = Query(100, description="Maximum number of messages to return"),
    parser: ChatParser = Depends(get_chat_parser)
):
    """Get messages from a specific user."""
    try:
        messages = list(parser.stream_messages(
            skip=skip,
            limit=limit,
            user_filter=[user_id]
        ))
        
        return {
            "user_id": user_id,
            "messages": messages,
            "offset": skip,
            "limit": limit,
            "count": len(messages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user messages: {str(e)}") 