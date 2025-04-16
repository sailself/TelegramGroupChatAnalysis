import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * Format a date string to a readable format
 * @param {string} dateStr - The date string in ISO format
 * @param {string} formatStr - The format string (default: 'MM/DD/YYYY')
 * @returns {string} - The formatted date
 */
export const formatDate = (dateStr, formatStr = 'MM/DD/YYYY') => {
  if (!dateStr) return '';
  return dayjs(dateStr).format(formatStr);
};

/**
 * Format a time string in ISO format
 * @param {string} dateStr - The date string in ISO format
 * @returns {string} - The formatted time
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return dayjs(dateStr).format('h:mm A');
};

/**
 * Format a number with comma separators
 * @param {number} num - The number to format
 * @returns {string} - The formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} - The truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Extract text content from a Telegram message object
 * @param {Object} message - The Telegram message object
 * @returns {string} - The extracted text
 */
export const extractText = (message) => {
  if (!message) return '';
  
  if (typeof message === 'string') {
    return message.replace(/<[^>]*>/g, '');
  }
  
  if (message.text) {
    return message.text;
  }
  
  if (message.caption) {
    return message.caption;
  }
  
  return '';
};

/**
 * Generate a HEX color code based on a string
 * @param {string} str - The input string
 * @returns {string} - The generated HEX color
 */
export const stringToColor = (str) => {
  if (!str) return '#cccccc';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

/**
 * Convert a weekday number to its name
 * @param {number} weekday - The weekday number (0-6)
 * @returns {string} - The weekday name
 */
export const weekdayToName = (weekday) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[weekday] || '';
};

/**
 * Shorten a user's full name for display
 * @param {string} name - The full name
 * @returns {string} - The shortened name
 */
export const shortenUserName = (name) => {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length <= 1) return name;
  
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
};

/**
 * Format a date for API queries
 * @param {Date|string} date - The date to format
 * @returns {string} - The formatted date (YYYY-MM-DD)
 */
export const formatDateForApi = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Build a query string from search parameters
 * @param {Object} params - The search parameters
 * @returns {string} - The query string
 */
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return '';
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Parse search parameters from a URL
 * @param {URLSearchParams} searchParams - The URL search params object
 * @returns {Object} - The parsed search parameters
 */
export const parseSearchParams = (searchParams) => {
  if (!searchParams) return {};
  
  const params = {};
  
  for (const [key, value] of searchParams.entries()) {
    if (value) {
      params[key] = value;
    }
  }
  
  return params;
};

/**
 * Format a large number with K or M suffix
 * @param {number} num - The number to format
 * @returns {string} - The formatted number
 */
export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
};

/**
 * Format a date relative to the current time
 * @param {string} dateStr - The date string in ISO format
 * @returns {string} - The relative time (e.g., '2 hours ago')
 */
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  return dayjs(dateStr).fromNow();
};

/**
 * Get a readable date range description
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {string} - The date range description
 */
export const getDateRangeDescription = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (start.year() !== end.year()) {
    return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
  }
  
  if (start.month() !== end.month()) {
    return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  }
  
  return `${start.format('MMM D')} - ${end.format('D, YYYY')}`;
};

/**
 * Get the current date and time formatted for display
 * @returns {string} - The current date and time
 */
export const getCurrentDateTime = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}; 