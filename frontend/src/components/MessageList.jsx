import React, { useState, useEffect } from 'react';
import { formatDate, formatDateForApi } from '../utils/helpers';
import MessageCard from './MessageCard';
import Pagination from './Pagination';

const MessageList = ({ 
  messages = [], 
  chatInfo,
  isLoading = false, 
  loading = false,
  error = null, 
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  searchParams = {},
  onSearch
}) => {
  // Use either isLoading or loading prop
  const isLoadingState = isLoading || loading;
  
  const [groupedMessages, setGroupedMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState(searchParams.query || '');
  const [dateFrom, setDateFrom] = useState(searchParams.dateFrom || '');
  const [dateTo, setDateTo] = useState(searchParams.dateTo || '');
  const [user, setUser] = useState(searchParams.user || '');
  const [mediaType, setMediaType] = useState(searchParams.mediaType || '');
  
  // Group messages by date
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    
    const grouped = messages.reduce((groups, message) => {
      const date = message.date.split('T')[0]; // Extract date part from ISO string
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
    
    setGroupedMessages(grouped);
  }, [messages]);
  
  // Reset to page 1 when search params change
  useEffect(() => {
    if (onPageChange && (
      searchTerm !== searchParams.query ||
      dateFrom !== searchParams.dateFrom ||
      dateTo !== searchParams.dateTo ||
      user !== searchParams.user ||
      mediaType !== searchParams.mediaType
    )) {
      onPageChange(1);
    }
  }, [searchTerm, dateFrom, dateTo, user, mediaType, searchParams, onPageChange]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (onSearch) {
      const params = {
        query: searchTerm,
        dateFrom: formatDateForApi(dateFrom),
        dateTo: formatDateForApi(dateTo),
        user,
        mediaType
      };
      
      onSearch(params);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setUser('');
    setMediaType('');
    
    if (onSearch) {
      onSearch({});
    }
  };

  // Loading state
  if (isLoadingState) {
    return (
      <div className="py-10">
        <div className="flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading messages...</span>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Failed to load messages</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error instanceof Error ? error.message : error}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!messages || messages.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center my-4">
        <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No messages found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          There are no messages matching your criteria.
        </p>
      </div>
    );
  }

  // Convert grouped dates to sorted array
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(b) - new Date(a));
  
  return (
    <div className="w-full">
      {/* Search Form - Show only if onSearch handler is provided */}
      {onSearch && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Term */}
              <div>
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Text
                </label>
                <input
                  id="searchTerm"
                  type="text"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Date From */}
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  id="dateFrom"
                  type="date"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              {/* Date To */}
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  id="dateTo"
                  type="date"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              
              {/* User */}
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User
                </label>
                <input
                  id="user"
                  type="text"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Username or ID"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
              
              {/* Media Type */}
              <div>
                <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Media Type
                </label>
                <select
                  id="mediaType"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="photo">Photos</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                  <option value="audio">Audio</option>
                  <option value="sticker">Stickers</option>
                </select>
              </div>
              
              {/* Search Buttons */}
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Messages List - Use grouped by date view if messages are grouped */}
      {Object.keys(groupedMessages).length > 0 ? (
        <div className="space-y-6">
          {/* Messages grouped by date */}
          {sortedDates.map(date => (
            <div key={date} className="space-y-2">
              <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-2">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 pl-1">
                  {formatDate(date, 'full')}
                </h2>
              </div>
              
              <div className="space-y-4">
                {groupedMessages[date].map(message => (
                  <MessageCard 
                    key={message.id || message.message_id} 
                    message={message} 
                    chatInfo={chatInfo}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageCard 
              key={message.id || message.message_id} 
              message={message} 
              chatInfo={chatInfo}
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="my-6">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default MessageList; 