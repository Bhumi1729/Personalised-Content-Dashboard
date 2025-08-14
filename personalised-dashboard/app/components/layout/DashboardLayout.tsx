'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ApiStatusMonitor from './ApiStatusMonitor';
import { useSearchParams } from 'next/navigation';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../store';

// Function to check if dark theme is active (unused)
// function isDarkTheme() {
//   if (typeof document !== 'undefined') {
//     return document.documentElement.classList.contains('dark');
//   }
//   return false;
// }

interface DashboardLayoutProps {
  children: ReactNode;
  initialTab?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, initialTab = 'feed' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const searchParams = useSearchParams();
  const searchQuery = useAppSelector((state: RootState) => state.search.query);
  // const theme = useAppSelector((state: RootState) => state.theme.theme); // unused

  // Initialize with the initialTab prop
  useEffect(() => {
    console.log('DashboardLayout received initialTab:', initialTab);
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle tab change from URL parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['feed', 'trending', 'favorites', 'settings'].includes(tabParam)) {
      console.log('DashboardLayout setting tab from URL:', tabParam);
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      console.log('DashboardLayout setting search tab due to query:', searchQuery);
      setActiveTab('search');
    } else if (activeTab === 'search') {
      setActiveTab('feed');
    }
  }, [searchQuery, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Log current state to debug
  console.log('DashboardLayout state:', { activeTab, urlTab: searchParams.get('tab') });

  return (
    <div className="flex min-h-screen dashboard-container">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto pl-4 md:pl-5 pr-2 dashboard-main">
          <div className="pr-2">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                // Only pass activeTab prop to custom React components, not DOM elements
                if (typeof child.type === 'string') {
                  // This is a DOM element (div, span, etc.), don't add activeTab prop
                  return child;
                } else {
                  // This is a React component, safe to add activeTab prop
                  return React.cloneElement(child as React.ReactElement<{ activeTab?: string }>, { activeTab });
                }
              }
              return child;
            })}
          </div>
        </main>
        <ApiStatusMonitor />
      </div>
    </div>
  );
};

export default DashboardLayout;
