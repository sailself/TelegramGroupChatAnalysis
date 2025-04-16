import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { getChatInfo, getChatAnalytics, getActivityPatterns, getChatTopics } from '../utils/api';
import { formatNumber, formatDate } from '../utils/helpers';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [topicData, setTopicData] = useState(null);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic chat info
        const info = await getChatInfo();
        setChatInfo(info);
        
        // Fetch analytics with smaller sample size for quick load
        const analyticsData = await getChatAnalytics({ sample_size: 5000 });
        setAnalytics(analyticsData);
        
        // Fetch activity patterns
        const activity = await getActivityPatterns();
        setActivityData(activity);
        
        // Fetch chat topics
        const topics = await getChatTopics();
        setTopicData(topics);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Format activity data for charts
  const formatActivityData = () => {
    if (!activityData) return { hourly: [], daily: [] };
    
    // Hourly data
    const hourlyData = Object.entries(activityData.peak_hours).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      formattedHour: `${hour}:00`
    })).sort((a, b) => a.hour - b.hour);
    
    // Daily data - just use the last 7 days
    const dailyData = Object.entries(activityData.peak_days)
      .slice(-7)
      .map(([date, count]) => ({
        date,
        count,
        formattedDate: formatDate(date, 'MMM d')
      }));
    
    return { hourly: hourlyData, daily: dailyData };
  };

  // Format topic data for visualization
  const formatTopicData = () => {
    if (!topicData?.topics) return [];
    
    // Get colors for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
    
    return topicData.topics.slice(0, 6).map((topic, index) => ({
      name: topic.topic,
      value: topic.weight,
      color: COLORS[index % COLORS.length]
    }));
  };

  if (loading) {
    return <Loading fullScreen message="Loading dashboard data..." />;
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

  const { hourly, daily } = formatActivityData();
  const topics = formatTopicData();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {chatInfo && (
          <p className="text-gray-500 mt-1">
            Overview of {chatInfo.name} ({chatInfo.type}) with {formatNumber(chatInfo.total_messages)} messages
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Messages" 
          value={formatNumber(chatInfo?.total_messages || 0)} 
          icon={ChatBubbleLeftRightIcon}
        />
        <StatCard 
          title="Active Users" 
          value={formatNumber(analytics?.active_users || 0)} 
          icon={UserGroupIcon}
        />
        <StatCard 
          title="Most Active Hour" 
          value={hourly.length > 0 ? 
            `${hourly.reduce((max, hour) => hour.count > max.count ? hour : max, hourly[0]).formattedHour}` 
            : 'N/A'} 
          icon={ClockIcon}
        />
        <StatCard 
          title="Most Active Day" 
          value={daily.length > 0 ? 
            `${daily.reduce((max, day) => day.count > max.count ? day : max, daily[0]).formattedDate}` 
            : 'N/A'} 
          icon={CalendarIcon}
        />
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-4">Hourly Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedHour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Daily Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Topics and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-4">Top Topics</h2>
          {topics.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topics}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({name}) => name}
                  >
                    {topics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">No topic data available</p>
          )}
        </div>
        
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Most Active Users</h2>
            <Link to="/users" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              View All Users
            </Link>
          </div>
          
          {analytics?.most_active_users?.length > 0 ? (
            <div className="space-y-3">
              {analytics.most_active_users.slice(0, 5).map((user, index) => (
                <div key={user.user_id} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-primary-700 font-medium">{index + 1}</span>
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
          ) : (
            <p className="text-gray-500 text-center py-10">No user data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 