import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const MainNav = () => {
  const navigation = [
    { name: 'Dashboard', to: '/', icon: HomeIcon },
    { name: 'User Profiles', to: '/users', icon: UsersIcon },
    { name: 'Analytics', to: '/analytics', icon: ChartBarIcon },
    { name: 'Search', to: '/search', icon: MagnifyingGlassIcon },
  ];

  return (
    <nav className="space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.to}
          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <item.icon className="flex-shrink-0 w-6 h-6 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Initialize dark mode based on localStorage or system preference
  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0 px-4">
              <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">
                Telegram Analytics
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-4 space-y-1">
              <Link
                to="/"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HomeIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Dashboard
              </Link>
              <Link
                to="/users"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UsersIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                User Profiles
              </Link>
              <Link
                to="/analytics"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChartBarIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Analytics
              </Link>
              <Link
                to="/search"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MagnifyingGlassIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Search
              </Link>
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <SunIcon className="mr-3 h-5 w-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">
          Telegram Analytics
        </Link>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none"
        >
          {darkMode ? (
            <SunIcon className="h-6 w-6 text-yellow-500" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
            <div className="pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between px-4">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Telegram Analytics
                </div>
                <button
                  onClick={toggleSidebar}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="mt-5 px-4 space-y-1">
                <Link
                  to="/"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleSidebar}
                >
                  <HomeIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Dashboard
                </Link>
                <Link
                  to="/users"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleSidebar}
                >
                  <UsersIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  User Profiles
                </Link>
                <Link
                  to="/analytics"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleSidebar}
                >
                  <ChartBarIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Analytics
                </Link>
                <Link
                  to="/search"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleSidebar}
                >
                  <MagnifyingGlassIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Search
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col md:pl-64 flex-1">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 