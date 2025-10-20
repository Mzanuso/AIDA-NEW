import React from 'react';
import { useAppSelector } from '@/lib/redux/hooks';

interface ProgressIndicatorProps {
  title?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ title = 'Style Profile' }) => {
  const styleProgress = useAppSelector(state => state.style.styleProgress);
  const totalStyleQuestions = useAppSelector(state => state.style.totalStyleQuestions);
  
  const progressPercentage = Math.min((styleProgress / totalStyleQuestions) * 100, 100);
  
  return (
    <div className="px-6 py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-neutral-600">{title}</span>
        <span className="text-sm font-medium text-primary">{styleProgress}/{totalStyleQuestions}</span>
      </div>
      <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
