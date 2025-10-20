import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { likeStyle, dislikeStyle, skipQuestion } from '@/lib/redux/slices/styleSlice';

const SwipeCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const availableStyles = useAppSelector(state => state.style.availableStyles);
  const currentStyleIndex = useAppSelector(state => state.style.currentStyleIndex);
  
  const [exitX, setExitX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const currentStyle = availableStyles[currentStyleIndex % availableStyles.length];
  const nextStyle = availableStyles[(currentStyleIndex + 1) % availableStyles.length];
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      setExitX(window.innerWidth + 200);
      dispatch(likeStyle());
    } else if (info.offset.x < -threshold) {
      setExitX(-window.innerWidth - 200);
      dispatch(dislikeStyle());
    }
  };

  const handleLike = () => {
    if (!isDragging) {
      setExitX(window.innerWidth + 200);
      dispatch(likeStyle());
    }
  };

  const handleDislike = () => {
    if (!isDragging) {
      setExitX(-window.innerWidth - 200);
      dispatch(dislikeStyle());
    }
  };

  const handleSkipQuestion = () => {
    // Trigger skip animation
    if (!isDragging) {
      dispatch(skipQuestion());
      // Reset positions
      x.set(0);
      y.set(0);
    }
  };

  // Reset values after animation completes
  useEffect(() => {
    if (exitX !== 0) {
      const timer = setTimeout(() => {
        x.set(0);
        y.set(0);
        setExitX(0);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [exitX, x, y]);
  
  if (!currentStyle) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Style Selection Complete</h3>
          <p className="text-neutral-600">You've gone through all available styles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Current card to swipe on */}
      <motion.div
        ref={cardRef}
        className="absolute top-4 left-4 right-4 bottom-28 bg-white rounded-2xl shadow-lg overflow-hidden z-30"
        style={{ x, y, rotate, zIndex: exitX !== 0 ? 40 : 30 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: exitX }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 bg-neutral-50 flex items-center justify-center overflow-hidden">
            <img
              src={currentStyle.imageUrl || ''}
              alt={currentStyle.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 bg-white">
            <h3 className="font-display font-semibold text-lg mb-1">{currentStyle.name}</h3>
            <p className="text-neutral-600 text-sm">{currentStyle.description}</p>
          </div>
        </div>
      </motion.div>
      
      {/* Next card (partially visible) */}
      {nextStyle && (
        <div className="absolute top-8 left-8 right-8 bottom-32 bg-white rounded-2xl shadow-md overflow-hidden z-20 opacity-70">
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-neutral-50 flex items-center justify-center overflow-hidden">
              <img
                src={nextStyle.imageUrl || ''}
                alt={nextStyle.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Action overlays */}
      <motion.div 
        className="absolute top-0 left-0 right-0 bottom-0 z-40 pointer-events-none flex items-center justify-center"
        style={{ opacity: likeOpacity }}
      >
        <div className="rotate-12 border-4 border-accent rounded-xl px-6 py-2">
          <span className="font-display font-bold text-4xl text-accent">LIKE</span>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute top-0 left-0 right-0 bottom-0 z-40 pointer-events-none flex items-center justify-center"
        style={{ opacity: dislikeOpacity }}
      >
        <div className="-rotate-12 border-4 border-secondary rounded-xl px-6 py-2">
          <span className="font-display font-bold text-4xl text-secondary">SKIP</span>
        </div>
      </motion.div>
      
      {/* Swipe buttons */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-5 z-50">
        <button 
          className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center border border-secondary"
          onClick={handleDislike}
        >
          <span className="material-icons text-secondary text-2xl">close</span>
        </button>
        
        <button 
          className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center border border-neutral-200"
          onClick={handleSkipQuestion}
        >
          <span className="material-icons text-neutral-400">refresh</span>
        </button>
        
        <button 
          className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center border border-accent"
          onClick={handleLike}
        >
          <span className="material-icons text-accent text-2xl">favorite</span>
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;
