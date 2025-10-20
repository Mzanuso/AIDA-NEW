import React, { useState, useEffect } from 'react';

const StatusBar: React.FC = () => {
  const [time, setTime] = useState<string>(formatTime(new Date()));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return (
    <div className="h-6 bg-neutral-50 flex items-center justify-between px-4">
      <div className="text-xs">{time}</div>
      <div className="flex items-center space-x-1">
        <span className="material-icons text-xs">signal_cellular_alt</span>
        <span className="material-icons text-xs">wifi</span>
        <span className="material-icons text-xs">battery_full</span>
      </div>
    </div>
  );
};

export default StatusBar;
