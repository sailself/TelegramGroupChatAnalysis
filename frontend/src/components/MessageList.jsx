import React from 'react';
import { ChatIcon, DocumentTextIcon, PhotographIcon, PaperClipIcon, DocumentIcon } from '@heroicons/react/outline';
import { formatDate, formatTime } from '../utils/helpers';

// Helper function to highlight text matches in a string
const HighlightedText = ({ text, highlightText }) => {
  if (!highlightText || !text) return <span>{text}</span>;
  
  const regex = new RegExp(`(${highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// Helper function to determine message type icon
const getMessageTypeIcon = (message) => {
  if (message.is_media) {
    return <PhotographIcon className="h-5 w-5 text-blue-500" />;
  } else if (message.is_document) {
    return <DocumentIcon className="h-5 w-5 text-green-500" />;
  } else if (message.is_file) {
    return <PaperClipIcon className="h-5 w-5 text-gray-500" />;
  } else {
    return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
  }
};

const MessageList = ({ messages, showUser = false, highlightText = '' }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="py-10 text-center">
        <ChatIcon className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {messages.map((message) => (
        <li key={message.id} className={`p-4 ${message.is_reply ? 'bg-gray-50' : ''}`}>
          <div className="flex items-start">
            {/* Message type icon */}
            <div className="flex-shrink-0 mt-0.5 mr-4">
              {getMessageTypeIcon(message)}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header: username, date and reply status */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  {showUser && (
                    <span className="font-medium text-gray-900 truncate mr-2">
                      {message.user_name || `User ${message.user_id}`}
                    </span>
                  )}
                  
                  <span className="text-sm text-gray-500">
                    {formatDate(message.date)} at {formatTime(message.date)}
                  </span>
                  
                  {message.is_forwarded && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Forwarded
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {message.reaction_count > 0 && (
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <span className="mr-1">👍</span> {message.reaction_count}
                    </span>
                  )}
                  
                  {message.views > 0 && (
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <span className="mr-1">👁️</span> {message.views}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Message text content */}
              <div className="mt-1">
                <p className="text-sm text-gray-900 whitespace-pre-line">
                  <HighlightedText text={message.text} highlightText={highlightText} />
                </p>
              </div>
              
              {/* If this is a reply to another message */}
              {message.reply_to && (
                <div className="mt-2 pl-3 border-l-2 border-gray-200">
                  <p className="text-xs text-gray-500">
                    In reply to: <span className="font-medium">{message.reply_to.user_name || `User ${message.reply_to.user_id}`}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 truncate">
                    {message.reply_to.text}
                  </p>
                </div>
              )}
              
              {/* If message has media attachments */}
              {message.media && message.media.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.media.map((media, index) => (
                    <div key={index} className="relative">
                      {media.type === 'image' ? (
                        <div className="h-20 w-20 rounded overflow-hidden bg-gray-100">
                          <img 
                            src={media.url} 
                            alt={`Media attachment ${index + 1}`}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 flex items-center justify-center rounded overflow-hidden bg-gray-100 text-gray-500">
                          <DocumentIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {message.media.length > 3 && (
                    <div className="h-20 w-20 flex items-center justify-center rounded overflow-hidden bg-gray-100 text-gray-500">
                      <span className="text-sm font-medium">+{message.media.length - 3} more</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MessageList; 