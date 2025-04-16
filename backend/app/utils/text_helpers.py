import re
from typing import List, Dict, Any, Tuple, Union
import emoji

# Regex patterns
URL_PATTERN = re.compile(r'https?://\S+|www\.\S+')
EMOJI_PATTERN = re.compile(r':[a-zA-Z0-9_]+:')

def extract_text_content(text_obj: Union[str, List, Dict]) -> str:
    """
    Extract plain text content from complex text structures.
    
    Args:
        text_obj: Text object from a message, which can be a string, list, or dictionary
        
    Returns:
        Plain text content
    """
    if isinstance(text_obj, str):
        return text_obj
    
    if isinstance(text_obj, list):
        result = ""
        for item in text_obj:
            if isinstance(item, str):
                result += item
            elif isinstance(item, dict) and 'text' in item:
                result += item['text']
        return result
    
    if isinstance(text_obj, dict) and 'text' in text_obj:
        return text_obj['text']
    
    return ""

def count_emojis(text: Union[str, List, Dict]) -> int:
    """
    Count emojis in text.
    
    Args:
        text: Text to analyze
        
    Returns:
        Number of emojis
    """
    content = extract_text_content(text)
    return len([c for c in content if c in emoji.EMOJI_DATA])

def count_urls(text: Union[str, List, Dict]) -> int:
    """
    Count URLs in text.
    
    Args:
        text: Text to analyze
        
    Returns:
        Number of URLs
    """
    content = extract_text_content(text)
    return len(URL_PATTERN.findall(content))

def truncate_text(text: str, max_length: int = 100) -> str:
    """
    Truncate text to a maximum length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length] + "..." 