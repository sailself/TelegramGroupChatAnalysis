import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, truncateText, extractText } from '../utils/helpers';

const MessageCard = ({ message, chatInfo }) => {
  // Extract only the properties we need
  const {
    message_id,
    user_name,
    date,
    content,
    text,
    media_type,
    views,
    forwards,
    replies,
    chat_id,
    from_name,
    from_id
  } = message;

  // Choose the right text content (different message formats may have text in different properties)
  const messageContent = content || text || '';
  const userName = user_name || from_name || 'Anonymous User';
  const userId = from_id || '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
              {userName ? userName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="ml-3">
              <Link 
                to={userId ? `/users/${userId}` : '#'} 
                className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                {userName}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {date && formatDate(date)} {date && formatTime(date)}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {message_id && `#${message_id}`}
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
          {/* Show different message types accordingly */}
          {media_type === 'photo' && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Photo
              </span>
            </div>
          )}
          
          {media_type === 'video' && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                Video
              </span>
            </div>
          )}
          
          {media_type === 'document' && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Document
              </span>
            </div>
          )}
          
          {/* Message content */}
          <p>{truncateText(extractText(messageContent), 500)}</p>
        </div>
        
        {/* Message stats */}
        {(views || forwards || replies) && (
          <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
            {views !== undefined && (
              <span>{views} views</span>
            )}
            {forwards !== undefined && (
              <span>{forwards} forwards</span>
            )}
            {replies !== undefined && (
              <span>{replies} replies</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCard; 