import React from 'react';
import { Home, Brush, BookText, Users, Layout, ImageIcon, Video, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface ModuleNavigationProps {
  currentModule: 'style' | 'script' | 'cast' | 'board' | 'story' | 'media' | 'video';
}

interface ModuleNavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({ currentModule }) => {
  const [, setLocation] = useLocation();

  const modules: ModuleNavItem[] = [
    {
      name: 'Style',
      icon: <Brush className="h-5 w-5" />,
      path: '/style',
      color: 'text-aida-magenta hover:text-pink-400'
    },
    {
      name: 'Script',
      icon: <BookText className="h-5 w-5" />,
      path: '/script',
      color: 'text-red-500 hover:text-red-400'
    },
    {
      name: 'Cast',
      icon: <Users className="h-5 w-5" />,
      path: '/cast',
      color: 'text-emerald-500 hover:text-emerald-400'
    },
    {
      name: 'Board',
      icon: <Layout className="h-5 w-5" />,
      path: '/board',
      color: 'text-amber-500 hover:text-amber-400'
    },
    {
      name: 'Story',
      icon: <BookText className="h-5 w-5" />,
      path: '/story',
      color: 'text-violet-500 hover:text-violet-400'
    },
    {
      name: 'Media',
      icon: <ImageIcon className="h-5 w-5" />,
      path: '/media',
      color: 'text-indigo-500 hover:text-indigo-400'
    },
    {
      name: 'Video',
      icon: <Video className="h-5 w-5" />,
      path: '/video',
      color: 'text-cyan-500 hover:text-cyan-400'
    }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 bg-black/40 backdrop-blur-md border-b border-gray-800/50">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        onClick={() => setLocation('/aida-hub')}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
        {modules.map((module) => (
          <Button
            key={module.name}
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-full",
              currentModule === module.name.toLowerCase() ? 
                "bg-white/10 font-medium " + module.color : 
                "text-gray-400 hover:text-gray-300"
            )}
            onClick={() => setLocation(module.path)}
          >
            {module.icon}
            <span className="hidden sm:inline text-xs">{module.name}</span>
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        onClick={() => setLocation('/aida-hub')}
      >
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ModuleNavigation;