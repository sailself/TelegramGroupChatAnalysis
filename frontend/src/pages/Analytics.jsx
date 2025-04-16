import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { UserIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

import Loading from '../components/Loading';
import { formatNumber } from '../utils/helpers';
import { getChatAnalytics, getUserRankings, getChatTopics } from '../utils/api';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [rankings, setRankings] = useState(null);
  const [topics, setTopics] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch analytics data
        const analyticsData = await getChatAnalytics();
        setAnalytics(analyticsData);
        
        // Fetch user rankings
        const rankingsData = await getUserRankings();
        setRankings(rankingsData);
        
        // Fetch topics
        const topicsData = await getChatTopics();
        setTopics(topicsData.topics || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <Loading size="lg" message="Loading chat analytics..." />;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Format activity data for charts
  const activityByHour = Object.entries(analytics?.peak_hours || {}).map(([hour, count]) => ({
    name: `${hour}:00`,
    value: count
  })).sort((a, b) => parseInt(a.name) - parseInt(b.name));
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive analytics and insights about the group chat</p>
      </div>
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Messages</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">{formatNumber(analytics?.total_messages || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-md p-3">
                <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Users</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">{formatNumber(analytics?.active_users || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs for detailed analytics */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-t-lg border-b border-gray-200 dark:border-gray-700 px-4">
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-4 text-sm font-medium border-b-2 focus:outline-none',
                  selected
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              Overview
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-4 text-sm font-medium border-b-2 focus:outline-none',
                  selected
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              Activity Patterns
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-4 text-sm font-medium border-b-2 focus:outline-none',
                  selected
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              User Rankings
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-4 text-sm font-medium border-b-2 focus:outline-none',
                  selected
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              Topics
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Overview Panel */}
            <Tab.Panel className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Chat Overview</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Top Active Users</h4>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {rankings?.most_active?.slice(0, 5).map((user, index) => (
                      <li key={user.user_id} className="py-3 flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-6">{index + 1}.</span>
                        <Link 
                          to={`/users/${user.user_id}`}
                          className="flex-1 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {user.user_id.replace('user', 'User ')}
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(user.count)} messages</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Main Topics</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topics}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="weight"
                          nameKey="topic"
                        >
                          {topics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            
            {/* Activity Patterns Panel */}
            <Tab.Panel className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Activity by Hour</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityByHour}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Message Count" fill="#0284c7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Tab.Panel>
            
            {/* User Rankings Panel */}
            <Tab.Panel className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Rankings</h3>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Most Active Users</h4>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rankings?.most_active?.slice(0, 10).map((user, index) => (
                    <li key={user.user_id} className="py-3 flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-6">{index + 1}.</span>
                      <Link 
                        to={`/users/${user.user_id}`}
                        className="flex-1 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {user.user_id.replace('user', 'User ')}
                      </Link>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(user.count)} messages</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Tab.Panel>
            
            {/* Topics Panel */}
            <Tab.Panel className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Discussion Topics</h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Top Discussion Topics</h4>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {topics.map((topic, index) => (
                      <li key={index} className="py-3 flex items-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                          {topic.topic}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {(topic.weight * 100).toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Topics by Weight</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topics}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="weight"
                          nameKey="topic"
                        >
                          {topics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Analytics; 