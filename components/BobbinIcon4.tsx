import React from 'react';

interface BobbinIconProps {
  size?: number;
  className?: string;
}

export const BobbinIcon4: React.FC<BobbinIconProps> = ({ 
  size = 24, 
  className = "" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Clean rabbit head silhouette - profile facing right */}
    <path d="M8 6c0-2.2 1.8-4 4-4s4 1.8 4 4c0 .5-.1 1-.3 1.4l1.8 1.8c.3.3.5.7.5 1.1v2.2c0 1.4-1.1 2.5-2.5 2.5h-7c-1.4 0-2.5-1.1-2.5-2.5V9.3c0-.4.2-.8.5-1.1L7.3 7.4C7.1 7 8 6.5 8 6z"/>
    
    {/* Left ear - long and upright */}
    <path d="M10 1c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1s1-.4 1-1V2c0-.6-.4-1-1-1z"/>
    
    {/* Right ear - long and upright */}
    <path d="M14 1c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1s1-.4 1-1V2c0-.6-.4-1-1-1z"/>
  </svg>
);

// Alternative cleaner single-path version for better performance
export const BobbinIcon4Clean: React.FC<BobbinIconProps> = ({ 
  size = 24, 
  className = "" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simplified elegant rabbit silhouette */}
    <path d="M9 2c0-1.1.9-2 2-2s2 .9 2 2v1.5c.5-.3 1.1-.5 1.7-.5 1.7 0 3.1 1.2 3.3 2.8.1.8-.2 1.6-.8 2.2l-1.2 1.2c-.6.6-.6 1.6 0 2.2.3.3.5.7.5 1.1v4.5c0 2.2-1.8 4-4 4h-4c-2.2 0-4-1.8-4-4V11c0-1.7 1.3-3 3-3 .6 0 1.2.2 1.7.5V7c0-.4.1-.8.3-1.1L9.3 5c.4-.7.7-1.5.7-2.3V2zm5 1c-.6 0-1 .4-1 1v2c0 .3-.1.5-.3.7l-.4.4c-.4.4-.4 1 0 1.4s1 .4 1.4 0l.4-.4c.2-.2.5-.3.7-.3.6 0 1-.4 1-1V3c0-.6-.4-1-1-1z"/>
  </svg>
);

// Default export for easy importing
export default BobbinIcon4;