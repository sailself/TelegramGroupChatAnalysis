import React from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { formatNumber } from '../utils/helpers';

const UserCard = ({ user, className = '' }) => {
  const { id, username, first_name, last_name, message_count, color } = user;
  
  const displayName = username 
    ? `@${username}` 
    : [first_name, last_name].filter(Boolean).join(' ');
    
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg"
            style={{ backgroundColor: color || '#4B5563' }}
          >
            {(first_name?.[0] || username?.[0] || '?').toUpperCase()}
          </div>
          
          <div className="ml-4">
            <Link 
              to={`/users/${id}`} 
              className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
            >
              {displayName}
            </Link>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1.5 text-gray-400 dark:text-gray-500" />
            <span>{formatNumber(message_count)} messages</span>
          </div>
          
          <Link 
            to={`/users/${id}/stats`}
            className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            <ChartBarIcon className="h-5 w-5 mr-1.5" />
            <span>View stats</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserCard; 