'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../components/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../hooks/redux';
import CategorizedContentFeed from '../components/content/CategorizedContentFeed';
import TrendingContent from '../components/content/TrendingContent';
import FavoritesContent from '../components/content/FavoritesContent';
import SearchResults from '../components/content/SearchResults';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import SettingsModal from '../components/layout/SettingsModal';
import { useSearchParams } from 'next/navigation';
import { RootState } from '../store';

function DashboardContent() {
  // Use search params to determine initial tab
  const searchParams = useSearchParams();
  const propActiveTab = searchParams.get('tab') || 'feed';
  
  const [localActiveTab, setLocalActiveTab] = useState(propActiveTab);
  const { user, isLoading } = useAuth();
  const { data: session, status } = useSession();
  const searchQuery = useAppSelector((state: RootState) => state.search.query);
  const theme = useAppSelector((state: RootState) => state.theme.theme);
  const router = useRouter();
  
  // Sync our local state with the prop whenever it changes
  useEffect(() => {
    setLocalActiveTab(propActiveTab);
    console.log('Dashboard received activeTab prop:', propActiveTab);
  }, [propActiveTab]);
  
  // Also sync with URL params as a fallback
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['feed', 'trending', 'favorites', 'settings'].includes(tabParam)) {
      setLocalActiveTab(tabParam);
      console.log('Dashboard synced with URL tab param:', tabParam);
    }
  }, [searchParams]);
  
  // Debug authentication state
  useEffect(() => {
    console.log('Dashboard Auth State:', { 
      customUser: user, 
      customAuthLoading: isLoading,
      sessionStatus: status,
      session: session,
      activeTab: localActiveTab
    });
  }, [user, isLoading, status, session, localActiveTab]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user && status === "unauthenticated") {
      console.log('Not authenticated, redirecting to sign in');
      router.push('/auth/signin');
    }
  }, [user, isLoading, router, status]);

  // Show loading screen while checking authentication
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user && !session) {
    return null;
  }

  const renderTabContent = () => {
    console.log('Rendering tab content for:', localActiveTab);
    
    switch (localActiveTab) {
      case 'feed':
        return <CategorizedContentFeed />;
      case 'trending':
        return <TrendingContent />;
      case 'favorites':
        return <FavoritesContent />;
      case 'search':
        return <SearchResults />;
      case 'settings':
        // Always open the settings modal when the settings tab is selected
        return (
          <>
            <div className="bg-black p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Dashboard Settings</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Customize your dashboard experience with the settings below.</p>
            </div>
            <SettingsModal isOpen={true} onClose={() => router.replace('/dashboard?tab=feed')} />
          </>
        );
      default:
        return <CategorizedContentFeed />;
    }
  };

  return (
    <DashboardLayout initialTab={searchParams.get('tab') || 'feed'}>
      <div className="w-full">
        {/* Main content area */}
        <div className="flex flex-col">
          {/* Only show header for non-trending tabs */}
          {localActiveTab !== 'trending' && (
            <div className="p-6" style={{backgroundColor: theme === 'light' ? '#f0f0f0' : '#000000', color: theme === 'light' ? '#000000' : '#ffffff'}}>
              <h1 className="text-2xl font-bold" style={{color: theme === 'light' ? '#000000' : '#ffffff'}}>
                Welcome back, {user?.name || session?.user?.name || 'User'}!
              </h1>
              <p className="mt-1" style={{color: theme === 'light' ? '#4B5563' : '#9CA3AF'}}>
                {searchQuery ? 
                  `Search results for "${searchQuery}"` :
                  `${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                }
              </p>
            </div>
          )}
          {/* Main content */}
          <div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const DashboardPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;
