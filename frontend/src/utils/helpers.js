import { format, parseISO } from 'date-fns';

/**
 * Format a date string in ISO format to a readable format
 * @param {string} dateStr - ISO date string
 * @param {string} formatStr - Format string for date-fns
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, formatStr = 'PPP') => {
  if (!dateStr) return 'N/A';
  try {
    const date = parseISO(dateStr);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

/**
 * Format a time string in ISO format to a readable time
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted time string
 */
export const formatTime = (dateStr) => {
  return formatDate(dateStr, 'p');
};

/**
 * Format a number with comma separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return 'N/A';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Extract text content from Telegram message
 * @param {Object|string|Array} text - Message text object
 * @returns {string} Plain text content
 */
export const extractText = (text) => {
  if (!text) return '';
  
  if (typeof text === 'string') {
    return text;
  }
  
  if (Array.isArray(text)) {
    return text.map(item => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object' && item.text) {
        return item.text;
      }
      return '';
    }).join('');
  }
  
  if (text && typeof text === 'object' && text.text) {
    return text.text;
  }
  
  return '';
};

/**
 * Generate color based on string (for user colors, etc.)
 * @param {string} str - Input string
 * @returns {string} HEX color code
 */
export const stringToColor = (str) => {
  if (!str) return '#6B7280'; // Default gray
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use hue rotation to create more vibrant colors
  const h = Math.abs(hash % 360);
  const s = 65 + (hash % 20); // 65-85% saturation
  const l = 45 + (hash % 10); // 45-55% lightness
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * Convert weekday number to name
 * @param {number} weekday - Weekday number (0-6, where 0 is Sunday)
 * @returns {string} Weekday name
 */
export const weekdayToName = (weekday) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[weekday] || 'Unknown';
};

/**
 * Get shortened user name (for display in small spaces)
 * @param {string} name - Full user name
 * @returns {string} Shortened name
 */
export const shortenUserName = (name) => {
  if (!name) return 'Unknown';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  
  // Get first name and first initial of last name
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
};

/**
 * Format date ranges for message search
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDateForApi = (date) => {
  if (!date) return '';
  return date instanceof Date 
    ? date.toISOString().split('T')[0] // YYYY-MM-DD
    : date;
};

/**
 * Build API query string from search parameters
 * @param {Object} params - Search parameters
 * @returns {string} URL query string
 */
export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.set(key, value);
      }
    }
  });
  
  return queryParams.toString();
};

/**
 * Parse search params from URL
 * @param {URLSearchParams} searchParams - URL search params
 * @returns {Object} Parsed parameters
 */
export const parseSearchParams = (searchParams) => {
  const params = {};
  
  searchParams.forEach((value, key) => {
    if (params[key]) {
      if (!Array.isArray(params[key])) {
        params[key] = [params[key]];
      }
      params[key].push(value);
    } else {
      // Convert 'true'/'false' strings to actual booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      params[key] = value;
    }
  });
  
  return params;
};

/**
 * Format large numbers with K, M suffix
 * @param {number} num - Number to format
 * @returns {string} Formatted number with suffix
 */
export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
}; 