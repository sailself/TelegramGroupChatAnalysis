from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional

from app.services.chat_parser import ChatParser
from app.services.analytics_service import AnalyticsService
from app.services.nlp_service import NLPProcessor
from app.routers.chat_data import get_chat_parser
from app.routers.users import get_nlp_processor

# Configure the router
router = APIRouter()

# Global service instances
_analytics_service = None

def get_analytics_service(
    parser: ChatParser = Depends(get_chat_parser),
    nlp_processor: NLPProcessor = Depends(get_nlp_processor)
):
    """Get or initialize the analytics service."""
    global _analytics_service
    if _analytics_service is None:
        _analytics_service = AnalyticsService(parser, nlp_processor)
    return _analytics_service

@router.get("/analytics/overview")
async def get_chat_analytics(
    sample_size: int = Query(10000, description="Number of messages to sample for analysis"),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Get comprehensive analytics for the entire chat."""
    try:
        analytics = analytics_service.generate_chat_analytics(sample_size=sample_size)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chat analytics: {str(e)}")

@router.get("/analytics/activity")
async def get_activity_patterns(
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Get detailed activity patterns for the chat."""
    try:
        # Generate the analytics with a smaller sample size
        analytics = analytics_service.generate_chat_analytics(sample_size=5000)
        
        # Extract and format the activity data
        return {
            "peak_hours": analytics.peak_hours,
            "peak_days": analytics.peak_days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving activity patterns: {str(e)}")

@router.get("/analytics/topics")
async def get_chat_topics(
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Get the main topics discussed in the chat."""
    try:
        # Generate the analytics with a smaller sample size
        analytics = analytics_service.generate_chat_analytics(sample_size=5000)
        
        # Return the topics
        return {
            "topics": analytics.top_topics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat topics: {str(e)}")

@router.get("/analytics/user-rankings")
async def get_user_rankings(
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Get rankings of users based on various metrics."""
    try:
        # Generate the analytics
        analytics = analytics_service.generate_chat_analytics(sample_size=10000)
        
        # Return the user rankings
        return {
            "most_active": analytics.most_active_users,
            "emoji_users": analytics.emoji_users,
            "media_users": analytics.media_users,
            "long_message_users": analytics.long_message_users,
            "forwarding_users": analytics.forwarding_users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user rankings: {str(e)}") 