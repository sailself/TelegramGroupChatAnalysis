import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/outline';
import { XCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { useSearchParams } from 'react-router-dom';

import Loading from '../components/Loading';
import MessageList from '../components/MessageList';
import { searchMessages } from '../utils/api';
import { formatDate } from '../utils/helpers';

const Messages = () => {
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
  
  // Fetch messages based on search parameters
  useEffect(() => {
    const fetchMessages = async () => {
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
    };
    
    fetchMessages();
    
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
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setUserId('');
    setDateFrom('');
    setDateTo('');
    setHasMedia(false);
    setIsForwarded(false);
    setHasReply(false);
    setPage(1);
  };
  
  // Toggle sort order for a field
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1); // Reset to first page on sort change
  };
  
  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    
    return sortOrder === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4 ml-1" />
      : <ArrowDownIcon className="h-4 w-4 ml-1" />;
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);
  const startResult = (page - 1) * PAGE_SIZE + 1;
  const endResult = Math.min(page * PAGE_SIZE, totalResults);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Messages</h1>
        <p className="text-gray-500 mt-1">
          Search and explore all messages in the chat history
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <SearchIcon className="h-5 w-5 mr-2 -ml-1" />
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isFilterOpen || userId || dateFrom || dateTo || hasMedia || isForwarded || hasReply
                  ? 'bg-primary-50 text-primary-700 border-primary-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FilterIcon className="h-5 w-5 mr-2 -ml-1" />
              Filters
              {(userId || dateFrom || dateTo || hasMedia || isForwarded || hasReply) && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800">
                  {[
                    userId && '1',
                    (dateFrom || dateTo) && '1',
                    hasMedia && '1',
                    isForwarded && '1',
                    hasReply && '1'
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
          </form>
          
          {isFilterOpen && (
            <div className="mt-3 border-t pt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    id="user-filter"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Filter by user ID"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="date-from" className="block text-sm font-medium text-gray-700">From Date</label>
                  <input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="block text-sm font-medium text-gray-700">To Date</label>
                  <input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hasMedia}
                    onChange={(e) => setHasMedia(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Has Media</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isForwarded}
                    onChange={(e) => setIsForwarded(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Forwarded Messages</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hasReply}
                    onChange={(e) => setHasReply(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Reply Messages</span>
                </label>
              </div>
              
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mr-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sort options */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 flex flex-wrap items-center justify-between">
          <div className="text-sm text-gray-500">
            {totalResults > 0 ? (
              <span>
                Showing <span className="font-medium">{startResult}</span> to <span className="font-medium">{endResult}</span> of{' '}
                <span className="font-medium">{totalResults}</span> results
              </span>
            ) : (
              <span>No results found</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-sm text-gray-500">Sort by:</span>
            <button
              onClick={() => toggleSort('date')}
              className={`text-sm flex items-center ${sortField === 'date' ? 'font-medium text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Date {renderSortIndicator('date')}
            </button>
            <button
              onClick={() => toggleSort('user')}
              className={`text-sm flex items-center ${sortField === 'user' ? 'font-medium text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              User {renderSortIndicator('user')}
            </button>
            <button
              onClick={() => toggleSort('length')}
              className={`text-sm flex items-center ${sortField === 'length' ? 'font-medium text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Length {renderSortIndicator('length')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Message list */}
      {loading ? (
        <Loading size="lg" message="Searching messages..." />
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <MessageList 
            messages={messages} 
            showUser={true} 
            highlightText={searchQuery} 
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startResult}</span> to <span className="font-medium">{endResult}</span> of{' '}
                    <span className="font-medium">{totalResults}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Generate page buttons */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pageNum
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages; 