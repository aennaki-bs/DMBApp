
import React, { useEffect } from 'react';

const GlobalStyles: React.FC = () => {
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      body {
        overflow: hidden;
      }
      
      /* Custom scrollbar styling */
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.2);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.5);
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(59, 130, 246, 0.7);
      }
    `;
    
    document.head.appendChild(style);
    
    // Cleanup function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default GlobalStyles;
