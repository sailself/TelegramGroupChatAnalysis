import React from 'react';

const Loading = ({ size = 'md', fullScreen = false, message = 'Loading...' }) => {
  // Set size classes based on the size prop
  let sizeClasses = 'w-8 h-8';
  if (size === 'sm') sizeClasses = 'w-5 h-5';
  if (size === 'lg') sizeClasses = 'w-12 h-12';
  
  // Spinner component
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}></div>
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );
  
  // If fullScreen, center the spinner on the page
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <Spinner />
      </div>
    );
  }
  
  // Regular spinner
  return <Spinner />;
};

export default Loading; 