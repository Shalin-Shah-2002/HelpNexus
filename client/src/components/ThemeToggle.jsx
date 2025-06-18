import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <IconButton 
        onClick={toggleTheme}
        sx={{ 
          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          color: isDarkMode ? 'grey.400' : 'grey.700',
          '&:hover': { 
            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 