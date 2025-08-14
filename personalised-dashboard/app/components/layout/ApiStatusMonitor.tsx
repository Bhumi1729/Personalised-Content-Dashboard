'use client';

import React, { useEffect, useState } from 'react';
import { validateAllApiKeys } from '../../services/apiKeys';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export interface ApiStatus {
  news: boolean;
  omdb: boolean;
  isOnline: boolean;
}

const ApiStatusMonitor: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    news: true,
    omdb: true,
    isOnline: true,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Check API keys and online status
  useEffect(() => {
    // Check if browser is online
    const handleOnlineStatusChange = () => {
      setApiStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    };

    // Add event listeners for online/offline status
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Check API keys
    const keyStatus = validateAllApiKeys();
    setApiStatus(prev => ({
      ...prev,
      news: keyStatus.news,
      omdb: keyStatus.omdb,
    }));

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // If everything is working correctly, don't show anything
  if (apiStatus.news && apiStatus.omdb && apiStatus.isOnline) {
    return null;
  }

  // Otherwise, show a warning
  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-xs ${isExpanded ? 'w-72' : 'w-12'} transition-all duration-200`}>
      <div className="flex items-center">
        {!isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-red-600"
          >
            <FiAlertCircle size={24} />
          </button>
        )}
        
        {isExpanded && (
          <>
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-2">API Status</h3>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center">
                  {apiStatus.isOnline ? 
                    <FiCheckCircle className="text-green-600 mr-1" size={16} /> :
                    <FiAlertCircle className="text-red-600 mr-1" size={16} />
                  }
                  <span>Internet Connection: {apiStatus.isOnline ? 'Online' : 'Offline'}</span>
                </li>
                <li className="flex items-center">
                  {apiStatus.news ? 
                    <FiCheckCircle className="text-green-600 mr-1" size={16} /> :
                    <FiAlertCircle className="text-red-600 mr-1" size={16} />
                  }
                  <span>News API Key: {apiStatus.news ? 'Valid' : 'Missing/Invalid'}</span>
                </li>
                <li className="flex items-center">
                  {apiStatus.omdb ? 
                    <FiCheckCircle className="text-green-600 mr-1" size={16} /> :
                    <FiAlertCircle className="text-red-600 mr-1" size={16} />
                  }
                  <span>OMDB API Key: {apiStatus.omdb ? 'Valid' : 'Missing/Invalid'}</span>
                </li>
              </ul>
              {(!apiStatus.news || !apiStatus.omdb) && (
                <p className="text-xs mt-2 text-gray-600">
                  Please check your .env file and make sure all API keys are properly set.
                </p>
              )}
              {!apiStatus.isOnline && (
                <p className="text-xs mt-2 text-gray-600">
                  You appear to be offline. Some features may not work properly.
                </p>
              )}
            </div>
            <button 
              onClick={() => setIsExpanded(false)} 
              className="ml-2 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <span className="text-lg">&times;</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ApiStatusMonitor;
