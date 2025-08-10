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
    {/* Rabbit ears */}
    <path d="M8 2C8 1.4 8.4 1 9 1C9.6 1 10 1.4 10 2V6C10 6.6 9.6 7 9 7C8.4 7 8 6.6 8 6V2Z"/>
    <path d="M14 2C14 1.4 14.4 1 15 1C15.6 1 16 1.4 16 2V6C16 6.6 15.6 7 15 7C14.4 7 14 6.6 14 6V2Z"/>
    
    {/* Head/body */}
    <path d="M6 8C6 6.9 6.9 6 8 6H16C17.1 6 18 6.9 18 8V16C18 18.2 16.2 20 14 20H10C7.8 20 6 18.2 6 16V8Z"/>
    
    {/* Nose/face detail */}
    <circle cx="12" cy="12" r="1" fill="white" opacity="0.3"/>
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