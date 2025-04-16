import React from 'react';
import Spinner from './Spinner';

const LoadingSpinner = ({ size = 'md', fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-50">
        <div className="text-center">
          <Spinner size={size} />
          {message && <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <Spinner size={size} />
      {message && <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner; 