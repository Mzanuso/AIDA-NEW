import React from 'react';
import { ModuleType } from '@/types/moduleTypes';

// Re-export for backward compatibility
export { ModuleType };
import { 
  Brush, 
  BookText, 
  Users, 
  Layout, 
  ImageIcon, 
  Video,
  Lock,
  Check
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  moduleType: ModuleType;
  title: string;
  progress: number;
  isActive: boolean;
  isDisabled: boolean;
  isCompleted: boolean;
  onClick: () => void;
  onLongPress?: () => void;
  className?: string;
}

// Helper per ottenere l'icona per ciascun tipo di modulo
const getModuleIcon = (type: ModuleType, className: string = "w-5 h-5") => {
  switch (type) {
    case 'style':
      return <Brush className={className} />;
    case 'storytelling':
      return <BookText className={className} />;
    case 'characters':
      return <Users className={className} />;
    case 'storyboard':
      return <Layout className={className} />;
    case 'media':
      return <ImageIcon className={className} />;
    case 'video':
      return <Video className={className} />;
    default:
      return <Brush className={className} />;
  }
};

// Helper per ottenere il colore per ciascun tipo di modulo
const getModuleColor = (type: ModuleType) => {
  switch (type) {
    case 'style':
      return 'from-blue-600 to-purple-800';
    case 'storytelling':
      return 'from-amber-500 to-red-700';
    case 'characters':
      return 'from-green-500 to-emerald-800';
    case 'storyboard':
      return 'from-orange-500 to-rose-700';
    case 'media':
      return 'from-indigo-500 to-violet-800';
    case 'video':
      return 'from-red-500 to-pink-800';
    default:
      return 'from-gray-700 to-gray-900';
  }
};

const ModuleCard: React.FC<ModuleCardProps> = ({
  moduleType,
  title,
  progress,
  isActive,
  isDisabled,
  isCompleted,
  onClick,
  onLongPress,
  className
}) => {
  // Gestione pressione prolungata (long press)
  const pressTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const handleMouseDown = () => {
    if (onLongPress && !isDisabled) {
      pressTimeoutRef.current = setTimeout(() => {
        onLongPress();
      }, 800);
    }
  };
  
  const handleMouseUp = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
  };
  
  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform-gpu",
        isDisabled ? "opacity-50 grayscale cursor-not-allowed" : "hover:scale-[1.02]",
        isActive ? "ring-2 ring-white/20 shadow-lg shadow-gray-900/50" : "",
        className
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Sfondo gradiente */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-70",
          getModuleColor(moduleType)
        )}
      />
      
      {/* Overlay scuro */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Contenuto */}
      <div className="relative h-full w-full p-4 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className="bg-black/30 p-2 rounded-md">
            {getModuleIcon(moduleType, "w-6 h-6")}
          </div>
          
          {isDisabled && (
            <div className="bg-black/70 p-1.5 rounded-full">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
          )}
          
          {isCompleted && (
            <div className="bg-green-800/70 p-1.5 rounded-full">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-semibold mb-1">{title}</h3>
          
          {/* Progress bar */}
          <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden mb-1">
            <div 
              className={cn(
                "h-full rounded-full",
                isCompleted 
                  ? "bg-green-500" 
                  : progress > 0 
                    ? "bg-white" 
                    : "bg-transparent"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs opacity-80">
            <span>{progress}% complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;