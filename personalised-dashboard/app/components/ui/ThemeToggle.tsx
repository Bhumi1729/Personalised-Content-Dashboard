import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/themeSlice';

const ThemeToggle: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-full hover:bg-black dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors theme-toggle-btn"
      aria-label="Toggle theme"
      title="Toggle dark/light mode"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {theme === 'dark' ? (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 theme-icon-sun" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          fill={isHovered ? "yellow" : "none"}
          style={{
            color: isHovered ? "white" : "#fcd34d",
            stroke: isHovered ? "white" : "#fcd34d"
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 4.05l-.71.71M21 12h-1M4 12H3m16.95 7.05l-.71-.71M4.05 19.95l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 theme-icon-moon" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          fill={isHovered ? "black" : "none"}
          style={{
            color: isHovered ? "white" : "#000000",
            stroke: isHovered ? "white" : "#000000"
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
