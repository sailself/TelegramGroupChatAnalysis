import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

import Loading from '../components/Loading';
import { getUsers } from '../utils/api';
import { formatNumber, stringToColor } from '../utils/helpers';

const UserProfiles = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'message_count', direction: 'desc' });

  // Load users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort and filter users
  const getSortedUsers = () => {
    const filteredUsers = searchTerm 
      ? users.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : users;
    
    return [...filteredUsers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedUsers = getSortedUsers();

  // Render the sort indicator
  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUpIcon className="w-4 h-4 ml-1 inline" />
      : <ArrowDownIcon className="w-4 h-4 ml-1 inline" />;
  };

  if (loading) {
    return <Loading fullScreen message="Loading user profiles..." />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Profiles</h1>
        <p className="text-gray-500 mt-1">
          Browse and analyze detailed user profiles from the chat
        </p>
      </div>

      {/* Search and filter */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search users by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {sortedUsers.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <span className="flex items-center">
                    User
                    <SortIndicator column="name" />
                  </span>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('message_count')}
                >
                  <span className="flex items-center">
                    Messages
                    <SortIndicator column="message_count" />
                  </span>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full" style={{ backgroundColor: stringToColor(user.name) }}>
                        <div className="h-full w-full flex items-center justify-center text-white font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.replace('user', '')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{formatNumber(user.message_count)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/users/${user.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? 'No users matching your search' : 'No users found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfiles; 