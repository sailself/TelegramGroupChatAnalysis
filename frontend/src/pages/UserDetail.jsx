import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  UserIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  CalendarIcon,
  FaceSmileIcon,
  PhotoIcon,
  LinkIcon,
  ArrowPathIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import Loading from '../components/Loading';
import StatCard from '../components/StatCard';
import MessageList from '../components/MessageList';
import { getUserProfile, getUserMessages } from '../utils/api';
import { formatNumber, formatDate, weekdayToName } from '../utils/helpers';

const UserDetail = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profileData = await getUserProfile(userId);
        setProfile(profileData);
        
        // Fetch a sample of user messages
        await fetchUserMessages();
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  // Fetch user messages with pagination
  const fetchUserMessages = async (limit = 10) => {
    try {
      setLoadingMessages(true);
      const messagesData = await getUserMessages(userId, { 
        limit,
        sort_by: 'date',
        sort_order: 'desc' 
      });
      setMessages(messagesData.messages);
      setLoadingMessages(false);
    } catch (err) {
      console.error('Error fetching user messages:', err);
      setLoadingMessages(false);
    }
  };

  // Format activity data for visualization
  const formatActivityData = () => {
    if (!profile) return { hourly: [], weekly: [] };
    
    // Format hourly activity
    const hourlyData = Object.entries(profile.active_hours).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      name: `${hour}:00`
    })).sort((a, b) => a.hour - b.hour);
    
    // Format weekday activity
    const weeklyData = Object.entries(profile.active_weekdays).map(([day, count]) => ({
      day: parseInt(day),
      count,
      name: weekdayToName(parseInt(day))
    })).sort((a, b) => a.day - b.day);
    
    return { hourly: hourlyData, weekly: weeklyData };
  };

  // Format topics for visualization
  const formatTopicData = () => {
    if (!profile?.topics) return [];
    
    // Define colors for the pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    return profile.topics.slice(0, 5).map((topic, index) => ({
      name: topic.topic,
      value: topic.weight,
      fill: COLORS[index % COLORS.length]
    }));
  };

  // Format media data for visualization
  const formatMediaData = () => {
    if (!profile?.media_count) return [];
    
    // Define colors for the pie chart
    const COLORS = ['#34D399', '#A78BFA', '#F87171', '#60A5FA', '#FBBF24'];
    
    return Object.entries(profile.media_count).map(([type, count], index) => ({
      name: type,
      value: count,
      fill: COLORS[index % COLORS.length]
    }));
  };

  if (loading) {
    return <Loading fullScreen message={`Loading profile for user ${userId}...`} />;
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

  const { hourly, weekly } = formatActivityData();
  const topicData = formatTopicData();
  const mediaData = formatMediaData();

  return (
    <div>
      {/* Back button */}
      <div className="mb-4">
        <Link to="/users" className="flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium">
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Users
        </Link>
      </div>
      
      {/* User header */}
      <div className="bg-white rounded-lg shadow-md px-6 py-5 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {profile.name || 'Unknown User'}
            </h1>
            <p className="text-gray-500">
              User ID: {profile.user_id.replace('user', '')}
            </p>
          </div>
        </div>
        
        {/* User summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-gray-700">
            {profile.summary}
          </p>
        </div>
      </div>
      
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Total Messages" 
          value={formatNumber(profile.message_count)} 
          icon={ChatBubbleLeftRightIcon}
        />
        <StatCard 
          title="First Message" 
          value={profile.first_message_date ? formatDate(profile.first_message_date, 'PPP') : 'N/A'} 
          icon={CalendarIcon}
        />
        <StatCard 
          title="Last Message" 
          value={profile.last_message_date ? formatDate(profile.last_message_date, 'PPP') : 'N/A'} 
          icon={ClockIcon}
        />
      </div>
      
      {/* Activity charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-5">
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
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold mb-4">Weekly Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Topic and Media charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold mb-4">Favorite Topics</h2>
          {topicData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {topicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-10 text-gray-500">No topic data available</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold mb-4">Media Usage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm font-medium text-gray-500 mb-1">Emojis</div>
              <div className="flex items-center">
                <FaceSmileIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <div className="text-lg font-semibold">{formatNumber(profile.emoji_count)}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm font-medium text-gray-500 mb-1">Shared Links</div>
              <div className="flex items-center">
                <LinkIcon className="h-5 w-5 text-blue-500 mr-2" />
                <div className="text-lg font-semibold">{formatNumber(profile.link_count)}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm font-medium text-gray-500 mb-1">Forwarded</div>
              <div className="flex items-center">
                <ArrowPathIcon className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-lg font-semibold">{formatNumber(profile.forwarded_count)}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm font-medium text-gray-500 mb-1">Avg Message Length</div>
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500 mr-2" />
                <div className="text-lg font-semibold">{Math.round(profile.avg_message_length)} chars</div>
              </div>
            </div>
          </div>
          
          {mediaData.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Media Types</h3>
              <div className="space-y-2">
                {mediaData.map((item) => (
                  <div key={item.name} className="flex items-center">
                    <PhotoIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{item.name}: </span>
                    <span className="ml-1 text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent messages */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Messages</h2>
          <button 
            onClick={() => fetchUserMessages(20)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-800"
            disabled={loadingMessages}
          >
            {loadingMessages ? 'Loading...' : 'Load More'}
          </button>
        </div>
        
        {loadingMessages ? (
          <Loading message="Loading messages..." />
        ) : (
          <MessageList messages={messages} showUser={false} />
        )}
      </div>
    </div>
  );
};

export default UserDetail; 