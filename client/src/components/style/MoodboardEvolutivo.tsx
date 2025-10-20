import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setExploreOpen } from '@/lib/redux/slices/styleSlice';

const MoodboardEvolutivo: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedStyles = useAppSelector(state => state.style.selectedStyles);
  
  const handleExploreClick = () => {
    dispatch(setExploreOpen(true));
  };
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-neutral-100 px-4 py-2 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-neutral-600">Style Evolution</span>
        <button 
          className="text-primary text-sm font-medium flex items-center"
          onClick={handleExploreClick}
        >
          Explore
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </button>
      </div>
      <div className="flex-1 flex space-x-2 overflow-x-auto pb-1">
        {selectedStyles.length > 0 ? (
          // Show selected styles
          selectedStyles.map((style, index) => (
            <div 
              key={`${style.code}-${index}`}
              className={`h-full aspect-square rounded-lg overflow-hidden shadow-sm flex-shrink-0 ${index === 0 ? 'border border-primary' : ''}`}
            >
              <img
                src={style.imageUrl || ''}
                alt={style.name}
                className="h-full w-full object-cover"
              />
            </div>
          ))
        ) : (
          // Empty state
          <div className="h-full aspect-square rounded-lg overflow-hidden shadow-sm flex-shrink-0 opacity-50">
            <div className="h-full w-full bg-neutral-100 flex items-center justify-center">
              <span className="material-icons text-neutral-400">add</span>
            </div>
          </div>
        )}
        
        {/* Empty tile for next style */}
        {selectedStyles.length > 0 && (
          <div className="h-full aspect-square rounded-lg overflow-hidden shadow-sm flex-shrink-0 opacity-50">
            <div className="h-full w-full bg-neutral-100 flex items-center justify-center">
              <span className="material-icons text-neutral-400">add</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodboardEvolutivo;
