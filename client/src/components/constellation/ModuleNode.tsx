import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  MessageSquareText, 
  Users, 
  ImagePlus, 
  Projector, 
  Video,
  Check,
  Lock,
  AlertCircle,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type ModuleType = 'style' | 'storytelling' | 'characters' | 'media' | 'storyboard' | 'video';

export interface ModuleStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  progress: number;
  dependencies?: ModuleType[];
  isRecommended?: boolean;
  hasWarning?: boolean;
}

interface ModuleNodeProps {
  type: ModuleType;
  status: ModuleStatus;
  position: { x: number; y: number };
  size?: number;
  onSelect: (type: ModuleType) => void;
  onMenuAction?: (action: string, type: ModuleType) => void;
}

const ModuleNode: React.FC<ModuleNodeProps> = ({
  type,
  status,
  position,
  size = 60,
  onSelect,
  onMenuAction
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get the proper icon by module type
  const getIcon = () => {
    switch (type) {
      case 'style':
        return <Palette size={size * 0.4} />;
      case 'storytelling':
        return <MessageSquareText size={size * 0.4} />;
      case 'characters':
        return <Users size={size * 0.4} />;
      case 'media':
        return <ImagePlus size={size * 0.4} />;
      case 'storyboard':
        return <Projector size={size * 0.4} />;
      case 'video':
        return <Video size={size * 0.4} />;
      default:
        return <Palette size={size * 0.4} />;
    }
  };

  // Get the status color
  const getStatusColor = () => {
    switch (status.status) {
      case 'completed':
        return '#10b981'; // Green
      case 'in_progress':
        return '#0284c7'; // Blue
      case 'not_started':
        return '#6b7280'; // Gray
      case 'locked':
        return '#374151'; // Dark Gray
      default:
        return '#6b7280';
    }
  };
  
  // Determine if node should be clickable
  const isClickable = status.status !== 'locked';
  
  // Format module type for display
  const formatModuleType = (type: ModuleType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Generate tooltip content
  const getTooltipContent = () => {
    return (
      <div className="max-w-xs">
        <h3 className="font-semibold">{formatModuleType(type)} Module</h3>
        <p className="text-sm mt-1">Status: {status.status.replace('_', ' ')}</p>
        <div className="w-full bg-gray-300 h-1 rounded-full mt-2">
          <div 
            className="h-full rounded-full" 
            style={{ width: `${status.progress}%`, backgroundColor: getStatusColor() }}
          ></div>
        </div>
        
        {status.dependencies && status.dependencies.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold">Dependencies:</p>
            <ul className="text-xs mt-1 list-disc pl-4">
              {status.dependencies.map(dep => (
                <li key={dep}>{formatModuleType(dep)}</li>
              ))}
            </ul>
          </div>
        )}
        
        {status.hasWarning && (
          <p className="text-xs text-amber-500 mt-2">
            This module has unresolved dependencies
          </p>
        )}
      </div>
    );
  };

  // Animation variants for the node
  const nodeVariants = {
    initial: {
      scale: 0.8,
      opacity: 0
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.1,
      boxShadow: '0 0 15px rgba(0, 100, 255, 0.5)',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0px rgba(0, 100, 255, 0)',
        '0 0 15px rgba(0, 100, 255, 0.7)',
        '0 0 0px rgba(0, 100, 255, 0)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const
      }
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isHovered ? 10 : 1
      }}
    >
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div>
              <motion.div
                initial="initial"
                animate={status.isRecommended ? ["animate", "pulse"] : "animate"}
                whileHover={isClickable ? "hover" : undefined}
                whileTap={isClickable ? "tap" : undefined}
                variants={nodeVariants}
                onClick={isClickable ? () => onSelect(type) : undefined}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative flex items-center justify-center rounded-full ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  background: status.status === 'locked' 
                    ? '#1f2937' 
                    : `linear-gradient(135deg, ${getStatusColor()}, ${status.isRecommended ? '#7c3aed' : getStatusColor()})`,
                  border: `3px solid ${status.isRecommended ? '#8b5cf6' : getStatusColor()}`,
                }}
              >
                {/* Central Icon */}
                <div className={`text-white ${status.status === 'locked' ? 'opacity-50' : ''}`}>
                  {getIcon()}
                </div>
                
                {/* Progress Ring */}
                <svg
                  className="absolute top-0 left-0 w-full h-full -rotate-90"
                  viewBox={`0 0 ${size + 6} ${size + 6}`}
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <circle
                    cx={size / 2 + 3}
                    cy={size / 2 + 3}
                    r={size / 2}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="3"
                  />
                  {status.progress > 0 && (
                    <circle
                      cx={size / 2 + 3}
                      cy={size / 2 + 3}
                      r={size / 2}
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * (size / 2) * (status.progress / 100)} ${2 * Math.PI * (size / 2)}`}
                    />
                  )}
                </svg>
                
                {/* Status Indicators */}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1">
                  {status.status === 'completed' && (
                    <Check size={16} className="text-green-500" />
                  )}
                  {status.status === 'locked' && (
                    <Lock size={16} className="text-gray-700" />
                  )}
                  {status.hasWarning && (
                    <AlertCircle size={16} className="text-amber-500" />
                  )}
                  {status.isRecommended && status.status !== 'completed' && status.status !== 'locked' && (
                    <ChevronRight size={16} className="text-purple-500" />
                  )}
                </div>

                {/* Context Menu */}
                {isClickable && onMenuAction && (
                  <div className="absolute -top-1 -right-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button 
                          className="p-1 rounded-full bg-white text-gray-700 hover:bg-gray-100 focus:outline-none"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={14} />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuLabel>{formatModuleType(type)}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onMenuAction('quick_setup', type)}>
                          Quick Setup
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMenuAction('view_dependencies', type)}>
                          View Dependencies
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMenuAction('reset', type)}>
                          Reset Progress
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </motion.div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-white p-2 rounded-md shadow-md">
            {getTooltipContent()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ModuleNode;