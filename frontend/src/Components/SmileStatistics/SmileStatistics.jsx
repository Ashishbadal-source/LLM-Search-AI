import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const SmileStatistics = ({ smileStats, isVisible = true, position = 'top-right' }) => {
  const { darkMode } = useTheme();

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const smileRate = smileStats.total > 0 
    ? ((smileStats.smiles / smileStats.total) * 100).toFixed(1) 
    : 0;

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-[1000] transition-all duration-300 hover:scale-105`}
      title="Real-time smile detection statistics during your interview"
    >
      <div className={`
        ${darkMode 
          ? 'bg-gray-800/90 text-white border-gray-600' 
          : 'bg-white/90 text-gray-700 border-gray-200'
        } 
        backdrop-blur-sm p-3 rounded-lg shadow-lg border text-xs font-medium
        min-w-[140px]
      `}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">📊</span>
          <span className="font-semibold text-sm">Smile Analytics</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span>😊</span>
              <span>Smiles:</span>
            </span>
            <span className="font-bold text-green-600">{smileStats.smiles}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span>😐</span>
              <span>Neutral:</span>
            </span>
            <span className="font-bold text-blue-600">{smileStats.unsmiles}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span>🎯</span>
              <span>Frames:</span>
            </span>
            <span className="font-bold">{smileStats.total}</span>
          </div>
          
          <div className={`
            border-t pt-2 mt-2 flex justify-between items-center
            ${darkMode ? 'border-gray-600' : 'border-gray-200'}
          `}>
            <span className="flex items-center gap-1">
              <span>📈</span>
              <span>Rate:</span>
            </span>
            <span className={`font-bold text-lg ${
              smileRate > 50 ? 'text-green-500' : 
              smileRate > 25 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {smileRate}%
            </span>
          </div>
        </div>
        
        {/* Progress bar for smile rate */}
        <div className={`
          mt-2 h-2 rounded-full overflow-hidden
          ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
        `}>
          <div 
            className={`h-full transition-all duration-500 ${
              smileRate > 50 ? 'bg-green-500' : 
              smileRate > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(smileRate, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SmileStatistics;