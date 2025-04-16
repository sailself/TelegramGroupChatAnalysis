import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  CalendarIcon,
  FaceSmileIcon,
  PhotoIcon,
  LinkIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';

import Loading from '../components/Loading';
import { getChatAnalytics, getActivityPatterns, getChatTopics, getUserRankings } from '../utils/api';
import { formatNumber, weekdayToName } from '../utils/helpers';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [userRankings, setUserRankings] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');  // overview, activity, users, topics

  // Load data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data with larger sample size for more accuracy
        const analyticsData = await getChatAnalytics({ sample_size: 10000 });
        setAnalytics(analyticsData);
        
        // Fetch activity patterns
        const activity = await getActivityPatterns();
        setActivityData(activity);
        
        // Fetch topics
        const topics = await getChatTopics();
        setTopicData(topics);
        
        // Fetch user rankings
        const rankings = await getUserRankings();
        setUserRankings(rankings);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  // Format data for charts
  const prepareActivityData = () => {
    if (!activityData) return { hourly: [], daily: [] };
    
    // Hourly activity
    const hourlyData = Object.entries(activityData.peak_hours).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      name: `${hour}:00`
    })).sort((a, b) => a.hour - b.hour);
    
    // Daily activity
    const dailyData = Object.entries(activityData.peak_days).slice(-30).map(([date, count]) => ({
      date,
      count,
      name: date.split('T')[0]
    }));
    
    return { hourly: hourlyData, daily: dailyData };
  };

  // Prepare topic data for visualization
  const prepareTopicData = () => {
    if (!topicData?.topics) return [];
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
    
    return topicData.topics.slice(0, 10).map((topic, index) => ({
      name: topic.topic,
      value: topic.weight,
      fill: COLORS[index % COLORS.length]
    }));
  };

  if (loading) {
    return <Loading fullScreen message="Loading analytics data..." />;
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

  const { hourly, daily } = prepareActivityData();
  const topics = prepareTopicData();

  // Tabs for different analytics sections
  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: HashtagIcon },
      { id: 'activity', label: 'Activity Patterns', icon: ClockIcon },
      { id: 'users', label: 'User Rankings', icon: UserGroupIcon },
      { id: 'topics', label: 'Topics', icon: ChatBubbleLeftRightIcon },
    ];
    
    return (
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  // Render the overview tab
  const renderOverview = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatNumber(analytics.total_messages)}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-md">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatNumber(analytics.active_users)}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-md">
              <UserGroupIcon className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Peak Hour</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {hourly.length > 0 ? 
                  hourly.reduce((max, hour) => hour.count > max.count ? hour : max, hourly[0]).name 
                  : 'N/A'}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-md">
              <ClockIcon className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Top Topic</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 truncate">
                {topics.length > 0 ? topics[0].name : 'N/A'}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-md">
              <HashtagIcon className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold mb-4">Most Active Users</h2>
          <div className="space-y-3">
            {analytics.most_active_users.slice(0, 5).map((user, index) => (
              <div key={user.user_id} className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-medium">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/users/${user.user_id}`} className="text-gray-900 hover:text-primary-600">
                    {user.user_id.replace('user', '')}
                  </Link>
                </div>
                <div className="text-gray-500">
                  {formatNumber(user.count)} messages
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold mb-4">Top Topics</h2>
          <div className="space-y-2">
            {topics.slice(0, 5).map((topic, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-medium">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-900">{topic.name}</span>
                </div>
                <div className="text-gray-500">
                  Score: {topic.value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render the activity patterns tab
  const renderActivity = () => (
    <div>
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Hourly Activity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Daily Activity (Last 30 Days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#7c3aed" fill="#7c3aed33" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Render the user rankings tab
  const renderUserRankings = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold mb-4">Most Active Users</h2>
        <div className="space-y-3">
          {userRankings?.most_active?.slice(0, 10).map((user, index) => (
            <div key={user.user_id} className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/users/${user.user_id}`} className="text-gray-900 hover:text-primary-600">
                  {user.user_id.replace('user', '')}
                </Link>
              </div>
              <div className="text-gray-500">
                {formatNumber(user.count)} msgs
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold mb-4">Emoji Users</h2>
        <div className="space-y-3">
          {userRankings?.emoji_users?.slice(0, 10).map((user, index) => (
            <div key={user.user_id} className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                <span className="text-yellow-600 font-medium">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/users/${user.user_id}`} className="text-gray-900 hover:text-primary-600">
                  {user.user_id.replace('user', '')}
                </Link>
              </div>
              <div className="text-gray-500">
                {formatNumber(user.count)} emojis
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold mb-4">Media Sharers</h2>
        <div className="space-y-3">
          {userRankings?.media_users?.slice(0, 10).map((user, index) => (
            <div key={user.user_id} className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <span className="text-green-600 font-medium">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/users/${user.user_id}`} className="text-gray-900 hover:text-primary-600">
                  {user.user_id.replace('user', '')}
                </Link>
              </div>
              <div className="text-gray-500">
                {formatNumber(user.count)} media
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold mb-4">Long Messages</h2>
        <div className="space-y-3">
          {userRankings?.long_message_users?.slice(0, 10).map((user, index) => (
            <div key={user.user_id} className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <span className="text-purple-600 font-medium">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/users/${user.user_id}`} className="text-gray-900 hover:text-primary-600">
                  {user.user_id.replace('user', '')}
                </Link>
              </div>
              <div className="text-gray-500">
                {formatNumber(user.count)} long msgs
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render the topics tab
  const renderTopics = () => (
    <div>
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Top Discussion Topics</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topics}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {topics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold mb-4">Topics by Weight</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topics}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Render the content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'activity':
        return renderActivity();
      case 'users':
        return renderUserRankings();
      case 'topics':
        return renderTopics();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat Analytics</h1>
        <p className="text-gray-500 mt-1">
          Comprehensive analytics and insights about the group chat
        </p>
      </div>
      
      {renderTabs()}
      {renderContent()}
    </div>
  );
};

export default Analytics; 