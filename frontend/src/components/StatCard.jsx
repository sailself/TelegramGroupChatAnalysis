import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, description, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        
        {Icon && (
          <div className="p-2 bg-primary-50 rounded-md">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
        )}
      </div>
      
      {(change || description) && (
        <div className="mt-4">
          {change && (
            <div className={`inline-flex items-center text-sm font-medium ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {change > 0 ? '↑' : change < 0 ? '↓' : ''}
              {Math.abs(change)}%
            </div>
          )}
          
          {description && (
            <p className="inline-block ml-2 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard; 