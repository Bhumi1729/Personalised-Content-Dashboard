'use client';

import React, { useState } from 'react';
import { FiHome, FiTrendingUp, FiStar, FiMenu, FiX, FiGrid } from 'react-icons/fi';
import { RiDashboardFill } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const theme = useSelector((state: RootState) => state.theme.theme);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  const itemText = isCollapsed ? 'hidden' : 'block';
  const mobileVisibility = isMobileOpen ? 'left-0' : '-left-full';

  const handleNavClick = (tab: string) => {
    // First update the URL to reflect the new tab
    if (tab !== 'search') {
      // Use replace instead of push to avoid building up history
      router.replace(`/dashboard?tab=${tab}`);
    }
    
    // Then notify the parent about the tab change
    onTabChange(tab);
    
    // Close mobile sidebar after selection
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
    
    console.log('Sidebar - Tab clicked:', tab);
  };

  const NavItem = ({ id, icon, text }: { id: string, icon: React.ReactNode, text: string }) => (
    <button
      onClick={() => handleNavClick(id)}
      className={`flex items-center w-full p-3 ${
        activeTab === id ? 'bg-gray-300 text-black' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
      } rounded-md transition-colors mb-2`}
    >
      <div className="mr-3">{icon}</div>
      <span className={`${itemText} font-medium`}>{text}</span>
    </button>
  );

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-500 text-white rounded-md"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
          className={`
            fixed top-0 ${mobileVisibility} md:left-0 h-full bg-white dark:bg-sidebar-custom transition-all duration-300 z-10
            ${sidebarWidth} md:${sidebarWidth} border-r border-gray-200
          `}
      >
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center">
              <div 
                className="flex items-center justify-center w-10 h-10 rounded mr-3" 
                style={{
                  backgroundColor: theme === 'light' ? 'black' : 'white',
                  color: theme === 'light' ? 'white' : 'black'
                }}
              >
                <RiDashboardFill size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{color: theme === 'light' ? 'black' : 'white'}}>PGAGI</h2>
                <p className="text-xs text-gray-500">Content Dashboard</p>
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center w-10 h-10 rounded mx-auto" 
              style={{
                backgroundColor: theme === 'light' ? 'black' : 'white',
                color: theme === 'light' ? 'white' : 'black'
              }}
            >
              <RiDashboardFill size={22} />
            </div>
          )}
          <button
            className="p-1 rounded-md hover:bg-gray-100 text-gray-600 hidden md:block"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>
        </div>

        <div className="p-4 mt-2">
          <NavItem id="feed" icon={<FiHome size={20} />} text="Dashboard" />
          <NavItem id="personalized" icon={<FiGrid size={20} />} text="Personalized Feed" />
          <NavItem id="trending" icon={<FiTrendingUp size={20} />} text="Trending" />
          <NavItem id="favorites" icon={<FiStar size={20} />} text="Favorites" />
            {/* Search tab removed */}
        </div>
      </aside>
      
      {/* Add empty space to push content when sidebar is visible */}
      <div className={`hidden md:block ${sidebarWidth}`}></div>
    </>
  );
};

export default Sidebar;
