import React, { useState } from 'react';
import { 
  MoreVertical, 
  PlayCircle, 
  Copy, 
  Trash2, 
  Calendar, 
  Clock,
  Video,
  Monitor,
  Smartphone
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: number;
  title: string;
  type: string;
  subtype?: string;
  status?: string;
  format?: {
    aspectRatio?: string;
  };
  target?: {
    duration?: number;
    platform?: string[];
  };
  thumbnailUrl?: string;
  updatedAt?: string;
}

interface ProjectCardProps {
  project: Project;
  onContinue: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onContinue,
  onDuplicate,
  onDelete
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch(status) {
      case 'in-progress':
        return (
          <Badge className="text-xs bg-amber-500/80 text-white">In Progress</Badge>
        );
      case 'completed':
        return (
          <Badge className="text-xs bg-green-500/80 text-white">Completed</Badge>
        );
      case 'draft':
        return (
          <Badge className="text-xs bg-gray-500/80 text-white">Draft</Badge>
        );
      default:
        return null;
    }
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'youtube':
        return <Video className="w-3 h-3" />;
      case 'website':
        return <Monitor className="w-3 h-3" />;
      case 'instagram':
      case 'tiktok':
        return <Smartphone className="w-3 h-3" />;
      default:
        return <Video className="w-3 h-3" />;
    }
  };

  return (
    <div 
      className="flex flex-col h-52 rounded-md overflow-hidden bg-gradient-to-b from-gray-800/40 to-black/40 border border-gray-800/40"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Preview/Thumbnail */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-gray-800 to-black group">
        {project.thumbnailUrl ? (
          <img 
            src={project.thumbnailUrl} 
            alt={project.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V22" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12H22" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            variant="ghost" 
            className="rounded-full h-12 w-12 p-0 bg-white/10 hover:bg-white/20"
            onClick={() => onContinue(project.id)}
          >
            <PlayCircle className="h-6 w-6 text-white" />
          </Button>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          {getStatusBadge(project.status)}
        </div>
        
        {/* Format badge */}
        {project.format?.aspectRatio && (
          <div className="absolute bottom-2 left-2">
            <Badge className="text-xs bg-black/70 text-gray-300 border border-gray-700">
              {project.format.aspectRatio}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Metadata */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-white truncate pr-4">{project.title}</h3>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
                <DropdownMenuItem 
                  className="cursor-pointer text-gray-200 hover:text-white focus:text-white"
                  onClick={() => onContinue(project.id)}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  <span>Continue</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-gray-200 hover:text-white focus:text-white"
                  onClick={() => onDuplicate(project.id)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="text-xs text-gray-400 mt-1 flex items-center space-x-0.5">
            <span className="capitalize">{project.type}</span>
            {project.subtype && (
              <>
                <span className="mx-1">•</span>
                <span className="capitalize">{project.subtype}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{getFormattedDate(project.updatedAt)}</span>
          </div>
          
          {project.target?.duration && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{project.target.duration}s</span>
            </div>
          )}
        </div>
        
        {/* Platform target icons */}
        {project.target?.platform && project.target.platform.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {project.target.platform.map((platform, index) => (
              <div key={index} className="p-1 bg-gray-800/40 rounded-full">
                {getPlatformIcon(platform)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;