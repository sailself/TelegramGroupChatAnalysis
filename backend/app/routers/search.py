from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional

from app.services.chat_parser import ChatParser
from app.routers.chat_data import get_chat_parser
from app.models.chat_models import SearchQuery, SearchResult

# Configure the router
router = APIRouter()

@router.get("")
async def search_messages(
    query: str = Query(..., description="Search query text"),
    skip: int = Query(0, description="Number of results to skip"),
    limit: int = Query(50, description="Maximum number of results to return"),
    user_id: Optional[List[str]] = Query(None, description="Filter by user ID"),
    date_from: Optional[str] = Query(None, description="Filter from date (ISO format)"),
    date_to: Optional[str] = Query(None, description="Filter to date (ISO format)"),
    message_type: Optional[List[str]] = Query(None, description="Filter by message type"),
    parser: ChatParser = Depends(get_chat_parser)
):
    """Search for messages containing the query text."""
    try:
        # Perform the search
        messages, total_count = parser.search_messages(
            query=query,
            user_ids=user_id,
            date_from=date_from,
            date_to=date_to,
            message_types=message_type,
            skip=skip,
            limit=limit
        )
        
        return {
            "query": query,
            "messages": messages,
            "total_count": total_count,
            "offset": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing search: {str(e)}")

@router.post("")
async def advanced_search(
    search_query: SearchQuery,
    skip: int = Query(0, description="Number of results to skip"),
    limit: int = Query(50, description="Maximum number of results to return"),
    parser: ChatParser = Depends(get_chat_parser)
):
    """Advanced search with more complex criteria."""
    try:
        # Perform the search using the search query model
        messages, total_count = parser.search_messages(
            query=search_query.query,
            user_ids=search_query.user_ids,
            date_from=search_query.date_from,
            date_to=search_query.date_to,
            message_types=search_query.message_types,
            skip=skip,
            limit=limit
        )
        
        return SearchResult(
            messages=messages,
            total_count=total_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing search: {str(e)}") 