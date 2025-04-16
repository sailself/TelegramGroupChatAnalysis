import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router-dom';

import Loading from '../components/Loading';
import MessageList from '../components/MessageList';
import { searchMessages } from '../utils/api';
import { formatDate } from '../utils/helpers';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [userId, setUserId] = useState(searchParams.get('user') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');
  const [sortField, setSortField] = useState(searchParams.get('sort') || 'date');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasMedia, setHasMedia] = useState(searchParams.get('has_media') === 'true');
  const [isForwarded, setIsForwarded] = useState(searchParams.get('is_forwarded') === 'true');
  const [hasReply, setHasReply] = useState(searchParams.get('has_reply') === 'true');
  
  const PAGE_SIZE = 20;
  
  // Memoize the search function to avoid recreating it on each render
  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        page_size: PAGE_SIZE,
        sort_by: sortField,
        sort_order: sortOrder,
      };
      
      // Add optional filter parameters if they exist
      if (searchQuery) params.search_text = searchQuery;
      if (userId) params.user_id = userId;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (hasMedia) params.has_media = true;
      if (isForwarded) params.is_forwarded = true;
      if (hasReply) params.has_reply = true;
      
      const result = await searchMessages(params);
      setMessages(result.messages || []);
      setTotalResults(result.total || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error searching messages:', err);
      setError('Failed to search messages. Please try again.');
      setLoading(false);
    }
  }, [
    page, 
    searchQuery, 
    userId, 
    dateFrom, 
    dateTo, 
    sortField, 
    sortOrder, 
    hasMedia,
    isForwarded,
    hasReply
  ]);
  
  // Fetch messages based on search parameters
  useEffect(() => {
    // Update URL search params
    const newSearchParams = new URLSearchParams();
    if (searchQuery) newSearchParams.set('q', searchQuery);
    if (userId) newSearchParams.set('user', userId);
    if (dateFrom) newSearchParams.set('from', dateFrom);
    if (dateTo) newSearchParams.set('to', dateTo);
    if (sortField !== 'date') newSearchParams.set('sort', sortField);
    if (sortOrder !== 'desc') newSearchParams.set('order', sortOrder);
    if (hasMedia) newSearchParams.set('has_media', 'true');
    if (isForwarded) newSearchParams.set('is_forwarded', 'true');
    if (hasReply) newSearchParams.set('has_reply', 'true');
    if (page > 1) newSearchParams.set('page', page.toString());
    
    setSearchParams(newSearchParams);
    performSearch();
  }, [
    page, 
    searchQuery, 
    userId, 
    dateFrom, 
    dateTo, 
    sortField, 
    sortOrder, 
    hasMedia,
    isForwarded,
    hasReply,
    performSearch,
    setSearchParams
  ]);
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Rest of the component code...

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Search Messages</h1>
        <p className="mt-2 text-sm text-gray-500">
          Search through all messages in the chat history
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="flex items-center">
            <div className="flex-grow">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search for messages..."
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>

          {isFilterOpen && (
            <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-4">
              <div>
                <label htmlFor="from-date" className="block text-sm font-medium text-gray-700">
                  From Date
                </label>
                <input
                  type="date"
                  id="from-date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="to-date" className="block text-sm font-medium text-gray-700">
                  To Date
                </label>
                <input
                  type="date"
                  id="to-date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <select
                  id="author"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All authors</option>
                  {/* Add author options here */}
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Results {messages.length > 0 && `(${totalResults})`}
            </h3>
          </div>

          <MessageList 
            messages={messages}
            loading={loading}
            error={error}
            totalPages={Math.ceil(totalResults / PAGE_SIZE)}
            currentPage={page}
            onPageChange={setPage}
            searchParams={{
              query: searchQuery,
              dateFrom: dateFrom,
              dateTo: dateTo,
              user: userId,
              mediaType: hasMedia ? 'any' : ''
            }}
            onSearch={(params) => {
              if (params.query !== undefined) setSearchQuery(params.query);
              if (params.dateFrom !== undefined) setDateFrom(params.dateFrom);
              if (params.dateTo !== undefined) setDateTo(params.dateTo);
              if (params.user !== undefined) setUserId(params.user);
              if (params.mediaType !== undefined) setHasMedia(params.mediaType === 'any');
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Search; 