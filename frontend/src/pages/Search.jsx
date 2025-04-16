import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { parseSearchParams, buildQueryString, formatDate, extractText, truncateText } from '../utils/helpers';
import { getUsers, searchMessages } from '../utils/api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Load initial search params from URL
  useEffect(() => {
    const params = parseSearchParams(searchParams);
    setQuery(params.query || '');
    setDateFrom(params.dateFrom || '');
    setDateTo(params.dateTo || '');
    setAuthorId(params.authorId || '');
    setPage(parseInt(params.page) || 1);
    
    // Only search if we have a query
    if (params.query) {
      performSearch(params);
    }
    
    // Load users for filter dropdown
    fetchUsers();
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      const users = await getUsers();
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const performSearch = async (params = null) => {
    setLoading(true);
    try {
      const searchObj = params || {
        query,
        dateFrom,
        dateTo,
        authorId,
        page,
        pageSize
      };
      
      const results = await searchMessages(searchObj);
      setResults(results.messages || []);
      setTotalResults(results.total || 0);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    const newParams = {
      query,
      dateFrom,
      dateTo,
      authorId,
      page: 1 // Reset to first page on new search
    };
    
    // Update URL with search params
    setSearchParams(newParams);
    performSearch(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = {
      ...parseSearchParams(searchParams),
      page: newPage
    };
    setSearchParams(newParams);
    setPage(newPage);
  };

  const totalPages = Math.ceil(totalResults / pageSize);

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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search for messages..."
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFiltersVisible(!filtersVisible)}
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

          {filtersVisible && (
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
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All authors</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Search Results */}
      {query && (
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200 px-6 py-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Results {results.length > 0 && `(${totalResults})`}
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-5 text-center text-gray-500">
              No results found. Try adjusting your search terms.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {results.map((message) => (
                <div key={message.id} className="px-6 py-5 flex flex-col">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-900">{message.from}</span>
                    <span className="ml-3 text-xs text-gray-500">
                      {formatDate(message.date, 'PPp')}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    {truncateText(extractText(message.text), 300)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    page === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    page === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * pageSize, totalResults)}
                    </span>{' '}
                    of <span className="font-medium">{totalResults}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                        page === 1 ? 'text-gray-300' : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Simplified pagination for brevity */}
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      {page} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                        page === totalPages ? 'text-gray-300' : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
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

export default Search; 