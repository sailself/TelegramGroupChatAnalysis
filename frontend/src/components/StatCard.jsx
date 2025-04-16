import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

const StatCard = ({ title, value, icon: Icon, change, description }) => {
  const isPositiveChange = change > 0;
  const showChange = change !== undefined && change !== null;
  
  return (
    <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300">
              {Icon && <Icon className="h-6 w-6" />}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {description && (
        <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <div className="flex items-center text-gray-500 dark:text-gray-300">
              {showChange && (
                <span className="flex items-center mr-1.5">
                  {isPositiveChange ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-600 dark:text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-600 dark:text-red-500" />
                  )}
                  <span 
                    className={`ml-1 ${
                      isPositiveChange 
                        ? 'text-green-600 dark:text-green-500' 
                        : 'text-red-600 dark:text-red-500'
                    }`}
                  >
                    {Math.abs(change)}%
                  </span>
                </span>
              )}
              <span>{description}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard; 