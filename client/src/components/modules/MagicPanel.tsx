import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Wand2, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ModuleType } from '@/components/hub/ModuleCard';

interface MagicPanelProps {
  isOpen: boolean;
  moduleType: ModuleType;
  width?: number | string;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave?: () => void;
  onReset?: () => void;
}

const MagicPanel: React.FC<MagicPanelProps> = ({
  isOpen,
  moduleType,
  width = '30%',
  title,
  children,
  onClose,
  onSave,
  onReset
}) => {
  // For touch swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Spring physics for panel opening/closing
  const x = useSpring(isOpen ? 0 : 100, {
    stiffness: 170,
    damping: 26,
    mass: 1
  });

  // Update spring animation when isOpen changes
  useEffect(() => {
    x.set(isOpen ? 0 : 100);
  }, [isOpen, x]);

  // Get color theme based on module type
  const getColorTheme = (): string => {
    switch (moduleType) {
      case 'style':
        return 'bg-gradient-to-br from-purple-600 to-indigo-800';
      case 'storytelling':
        return 'bg-gradient-to-br from-blue-600 to-cyan-800';
      case 'characters':
        return 'bg-gradient-to-br from-emerald-600 to-teal-800';
      case 'media':
        return 'bg-gradient-to-br from-amber-600 to-orange-800';
      case 'storyboard':
        return 'bg-gradient-to-br from-pink-600 to-rose-800';
      case 'video':
        return 'bg-gradient-to-br from-red-600 to-rose-800';
      default:
        return 'bg-gradient-to-br from-gray-700 to-gray-900';
    }
  };

  // Handle touch/swipe events
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && isOpen) {
      onClose();
    } else if (isRightSwipe && !isOpen) {
      // Implement open functionality if needed
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Default panel title if not provided
  const defaultTitle = `${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Controls`;

  return (
    <div className="fixed inset-y-0 right-0 z-50 pointer-events-none">
      
      {/* Main panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute top-0 right-0 h-full bg-gray-950/95 backdrop-blur-sm border-l border-gray-800 shadow-xl pointer-events-auto overflow-hidden"
            style={{ width }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header */}
            <div className={`${getColorTheme()} p-4 flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                <Wand2 className="text-white" size={18} />
                <h3 className="font-semibold text-white">
                  {title || defaultTitle}
                </h3>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X size={18} />
              </Button>
            </div>
            
            {/* Content area */}
            <div className="p-4 h-[calc(100%-64px)] overflow-y-auto">
              {children}
            </div>
            
            {/* Footer with actions */}
            <div className="absolute bottom-0 left-0 w-full p-3 bg-gray-900 border-t border-gray-800 flex justify-between">
              {onReset && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-gray-400 hover:text-white border-gray-700"
                  onClick={onReset}
                >
                  <RotateCcw size={14} className="mr-2" />
                  Reset
                </Button>
              )}
              
              {onSave && (
                <Button 
                  variant="default"
                  size="sm"
                  className="ml-auto"
                  onClick={onSave}
                >
                  <Save size={14} className="mr-2" />
                  Apply Changes
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MagicPanel;