import React from 'react';
import { TemplateData } from '@/types/templateTypes';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, Award, Music, Star, Zap, 
  MonitorSmartphone, Tv, Smartphone, Video, BookOpen,
  Briefcase, TrendingUp, Film, MessageSquare, Palette,
  Users, ArrowLeft, ArrowRight, PanelLeft, PanelRight,
  ListChecks, Target, Tag, Info, Square
} from 'lucide-react';

interface TemplateDetailModalProps {
  template: TemplateData | null;
  isOpen: boolean;
  onClose: () => void;
}



const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({ 
  template, isOpen, onClose 
}) => {
  // Solo l'immagine principale
  const mainImage = template && template.thumbnailUrl ? template.thumbnailUrl : '';

  if (!template) return null;

  // Formatta la durata in un formato leggibile
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '-'; 
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-black/60 backdrop-blur-xl border-gray-800 text-white max-w-4xl mx-2 p-0 overflow-hidden shadow-xl shadow-black/30">
        <div className="flex flex-col md:flex-row h-[80vh] max-h-[650px]">
          {/* Immagine singola a sinistra */}
          <div className="relative md:w-1/2 h-full overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
            <div className="h-full w-full relative">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={template.title} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-40">
                  <svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2V22" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H22" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              
              {/* Aspect ratio indicator */}
              <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded flex items-center">
                <Square size={12} className="mr-1.5" />
                {template.aspectRatio}
              </div>
            </div>
          </div>
          
          {/* Dettagli a destra */}
          <div className="md:w-1/2 p-5 md:p-6 overflow-y-auto max-h-full custom-scrollbar">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl text-white font-light flex items-center mb-1">
                {template.title}
                {template.isNew && (
                  <Badge className="ml-3 text-xs bg-gradient-to-r from-aida-blue to-cyan-500 text-white">
                    NEW
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                {template.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Categoria principale + categorie aggiuntive */}
              {template.categories && template.categories.length > 0 ? (
                template.categories.map((category, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-aida-blue/20 text-aida-blue border border-aida-blue/40 capitalize"
                  >
                    {category}
                  </Badge>
                ))
              ) : (
                <Badge 
                  className="bg-aida-blue/20 text-aida-blue border border-aida-blue/40 capitalize"
                >
                  {template.category}
                </Badge>
              )}
            </div>
            
            <Separator className="my-4 bg-gray-800" />
            
            {/* Specifiche tecniche */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white flex items-center">
                  <Info size={14} className="mr-1.5 text-aida-blue" />
                  Template Details
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1.5 text-gray-500" />
                    Duration:
                  </div>
                  <div className="font-medium">{formatDuration(template.duration)}</div>
                  
                  <div className="flex items-center">
                    <Square size={14} className="mr-1.5 text-gray-500" />
                    Aspect Ratio:
                  </div>
                  <div className="font-medium">{template.aspectRatio || '-'}</div>
                  
                  <div className="flex items-center">
                    <Palette size={14} className="mr-1.5 text-gray-500" />
                    Style:
                  </div>
                  <div className="font-medium">{template.style || '-'}</div>
                  
                  <div className="flex items-center">
                    <Users size={14} className="mr-1.5 text-gray-500" />
                    Target Audience:
                  </div>
                  <div className="font-medium">{template.targetAudience || '-'}</div>
                </div>
              </div>
              
              {/* Target platforms */}
              {template.platforms && template.platforms.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white flex items-center">
                    <Target size={14} className="mr-1.5 text-aida-blue" />
                    Target Platforms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {template.platforms.map((platform, idx) => {
                      const getPlatformIcon = (platform: string) => {
                        switch (platform.toLowerCase()) {
                          case 'tiktok': return <Smartphone size={14} />;
                          case 'instagram': return <Smartphone size={14} />;
                          case 'youtube': return <Tv size={14} />;
                          case 'facebook': return <MonitorSmartphone size={14} />;
                          case 'linkedin': return <Briefcase size={14} />;
                          case 'website': return <Tv size={14} />;
                          default: return <MonitorSmartphone size={14} />;
                        }
                      };
                      
                      return (
                        <Badge 
                          key={`${platform}-${idx}`} 
                          variant="outline" 
                          className="bg-black/30 text-gray-300 border-gray-700 flex items-center gap-1.5"
                        >
                          {getPlatformIcon(platform)}
                          <span className="capitalize">{platform}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white flex items-center">
                    <Tag size={14} className="mr-1.5 text-aida-blue" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.map((tag, idx) => (
                      <Badge 
                        key={`${tag}-${idx}`} 
                        variant="outline" 
                        className="bg-transparent text-gray-400 border-gray-800 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Separator className="my-4 bg-gray-800" />
            
            {/* Actions */}
            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="sm:mr-auto border-gray-700 text-gray-300 hover:text-white">
                  Close
                </Button>
              </DialogClose>
              <Button className="bg-aida-blue hover:bg-aida-blue/90 text-white">
                Use Template
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDetailModal;