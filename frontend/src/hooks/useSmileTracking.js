import { useState, useRef, useEffect } from 'react';

export const useSmileTracking = () => {
  const [smileStats, setSmileStats] = useState({ 
    smiles: 0, 
    unsmiles: 0, 
    total: 0 
  });
  
  const totalFramesRef = useRef(0);
  const smileFramesRef = useRef(0);
  const unsmileRef = useRef(0);

  // Update stats when refs change
  const updateSmileStats = () => {
    setSmileStats({
      smiles: smileFramesRef.current,
      unsmiles: unsmileRef.current,
      total: totalFramesRef.current,
    });
  };

  // Reset all statistics
  const resetSmileStats = () => {
    totalFramesRef.current = 0;
    smileFramesRef.current = 0;
    unsmileRef.current = 0;
    setSmileStats({ smiles: 0, unsmiles: 0, total: 0 });
  };

  // Get current statistics
  const getCurrentStats = () => ({
    smileFrames: smileFramesRef.current,
    unsmileFrames: unsmileRef.current,
    totalFrames: totalFramesRef.current,
    smileRate: totalFramesRef.current > 0 
      ? ((smileFramesRef.current / totalFramesRef.current) * 100).toFixed(1)
      : 0
  });

  // Periodic update effect (optional - can be triggered manually)
  useEffect(() => {
    const interval = setInterval(updateSmileStats, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  return {
    smileStats,
    smileFramesRef,
    unsmileRef,
    totalFramesRef,
    updateSmileStats,
    resetSmileStats,
    getCurrentStats
  };
};