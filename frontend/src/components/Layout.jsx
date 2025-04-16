import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigation = [
    { name: 'Dashboard', to: '/', icon: HomeIcon },
    { name: 'User Profiles', to: '/users', icon: UsersIcon },
    { name: 'Analytics', to: '/analytics', icon: ChartBarIcon },
    { name: 'Search', to: '/search', icon: MagnifyingGlassIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-primary-600">Chat Profiler</h2>
          <button 
            onClick={toggleSidebar}
            className="p-2 text-gray-500 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => `
                flex items-center px-3 py-2 text-gray-700 rounded-md group
                ${isActive 
                  ? 'bg-primary-50 text-primary-700 font-medium' 
                  : 'hover:bg-gray-50'}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`
                flex-shrink-0 w-6 h-6 mr-3
                ${({ isActive }) => isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
              `} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:bg-white md:border-r md:border-gray-200">
        <div className="flex items-center h-16 px-6 border-b">
          <h2 className="text-xl font-bold text-primary-600">Chat Profiler</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="mt-4 px-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 text-gray-700 rounded-md group
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'hover:bg-gray-50'}
                `}
              >
                <item.icon className="flex-shrink-0 w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Page heading - could be dynamic based on route */}
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 md:hidden">
              Chat Profiler
            </h1>

            {/* Right side of header - could have user info, settings, etc. */}
            <div></div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-4 md:px-6">
          <div className="text-center text-gray-500 text-sm">
            Telegram Group Chat Profiler &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 