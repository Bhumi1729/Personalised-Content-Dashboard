'use client';
import Image from 'next/image';


import React, { useState } from 'react';
import { useAuth } from '../providers/AuthContext';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../ui/ThemeToggle';
import { FiSettings, FiUser, FiBell } from 'react-icons/fi';
import SearchBar from './SearchBar';
import SettingsModal from './SettingsModal';
import ProfileModal from './ProfileModal';
import { useAppSelector } from '../../hooks/redux';

const Header: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const theme = useAppSelector((state) => state.theme.theme);
  
  const handleOpenSettings = () => {
    // Navigate to the dashboard with the settings tab parameter
    router.push('/dashboard?tab=settings');
  };

  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  if (isLoading) {
    return (
      <header className="bg-white dark:bg-sidebar-custom dark:shadow-md p-4 flex items-center justify-between dark:border-b dark:border-gray-800" style={{ boxShadow: 'none', borderBottom: 'none' }}>
        <div className="flex-1 mx-2">
          <div className="animate-pulse w-64 h-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-sidebar-custom dark:shadow-md p-4 flex items-center justify-between dark:border-b dark:border-gray-800" style={{ boxShadow: 'none', borderBottom: 'none' }}>
      <div className="flex-1 mx-2 max-w-xl">
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <button
          className="p-2 rounded-full hover:bg-black dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors relative"
          aria-label="Notifications"
        >
          <FiBell 
            className="dark:text-gray-300 hover:text-white" 
            size={20}
            style={{ color: theme === 'light' ? '#000000' : undefined }}
          />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button
          onClick={handleOpenSettings}
          className="p-2 rounded-full hover:bg-black dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Settings"
        >
          <FiSettings 
            className="dark:text-gray-300 hover:text-white" 
            size={20}
            style={{ color: theme === 'light' ? '#000000' : undefined }}
          />
        </button>
        
        {user ? (
          <button
              onClick={handleOpenProfile}
              className={`flex items-center gap-3 py-1 px-3 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${theme === 'light' ? 'hover:bg-gray-200 bg-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 bg-gray-900'}`}
              aria-label="Profile"
          >
            <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-semibold">{user.name}</span>
                <span
                  className="text-xs"
                  style={theme === 'light' ? { color: '#374151' } : { color: '' }}
                >
                  {user.email}
                </span>
            </div>
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || 'User'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
                priority
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiUser size={16} />
            Sign In
          </button>
        )}
      </div>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  );
};

export default Header;
