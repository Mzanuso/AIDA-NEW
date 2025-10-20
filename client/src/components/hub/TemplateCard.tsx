import React from 'react';
import { TemplateData } from '@/types/templateTypes';
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Award, Sparkles, Star, Music, Zap, Users,
  MonitorSmartphone, Tv, Smartphone, Video, BookOpen,
  Briefcase, TrendingUp, Film, Megaphone, Palette, Heart
} from 'lucide-react';

interface TemplateCardProps {
  template: TemplateData;
  onClick: (template: TemplateData) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  onClick, 
  isFavorite = false,
  onToggleFavorite
}) => {
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return ''; 
    const minutes = Math.floor(seconds / 60);
    return `${minutes}${minutes === 1 ? ' min' : ' mins'}`;
  };

  // Handler per il pulsante preferito, con stop della propagazione dell'evento
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(template.id);
    }
  };

  return (
    <div 
      className="w-full md:w-60 h-44 bg-black/30 backdrop-blur-sm rounded-md overflow-hidden flex flex-col cursor-pointer transition-all border border-gray-800/40 hover:border-aida-blue/30 hover:shadow-lg hover:shadow-aida-blue/10"
      onClick={() => onClick(template)}
    >
      {/* Anteprima template */}
      <div className="h-28 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
        {template.thumbnailUrl ? (
          <img 
            src={template.thumbnailUrl} 
            alt={template.title} 
            className="w-full h-full object-cover"
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
        
        {/* Badge di status */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {template.isNew && (
            <Badge className="text-xs bg-gradient-to-r from-aida-blue to-cyan-500 text-white flex items-center px-2">
              <Sparkles className="w-3 h-3 mr-1" />
              New
            </Badge>
          )}
          
          {template.isPopular && (
            <Badge className="text-xs bg-gradient-to-r from-amber-500 to-red-500 text-white flex items-center px-2">
              <Award className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          
          {template.isRecommended && (
            <Badge className="text-xs bg-gradient-to-r from-aida-magenta to-purple-500 text-white flex items-center px-2">
              <Star className="w-3 h-3 mr-1" />
              Recommended
            </Badge>
          )}
        </div>
        
        {/* Icona preferiti */}
        <div className="absolute top-2 left-2 z-10">
          <button 
            className={`w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors border border-gray-800/40 backdrop-blur-sm ${isFavorite ? 'text-pink-500' : 'text-gray-400 hover:text-pink-300'}`}
            onClick={handleFavoriteClick}
          >
            <Heart 
              size={18} 
              className={`transition-all ${isFavorite ? 'fill-pink-500' : 'fill-transparent'}`} 
            />
          </button>
        </div>

        {/* Aspect ratio */}
        <div className="absolute bottom-2 right-2">
          <Badge className="text-xs bg-black/60 text-gray-300 border border-gray-800/80 px-1.5">
            {template.aspectRatio}
          </Badge>
        </div>
        
        {/* Effetto sottile sfumato solo sulla parte bassa per leggibilità */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>
      
      {/* Dettagli template */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium text-white leading-tight truncate">
            {template.title}
          </h3>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {template.description}
          </p>
        </div>
        
        {/* Prima riga info con durata e stile */}
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {template.duration ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-black/40 text-gray-300 border border-gray-800/60 flex items-center">
              <Clock className="w-2.5 h-2.5 mr-0.5" />
              <span>{formatDuration(template.duration)}</span>
            </Badge>
          ) : null}
          
          {template.style ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-black/40 text-gray-300 border border-gray-800/60 flex items-center">
              <Palette className="w-2.5 h-2.5 mr-0.5" />
              <span>{template.style}</span>
            </Badge>
          ) : null}
        </div>
        
        {/* Piattaforme target */}
        {template.platforms && template.platforms.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {template.platforms.map((platform, idx) => {
              // Icona per piattaforma
              const PlatformIcon = () => {
                switch (platform.toLowerCase()) {
                  case 'tiktok': return <Smartphone className="w-2.5 h-2.5" />;
                  case 'instagram': return <Smartphone className="w-2.5 h-2.5" />;
                  case 'youtube': return <Tv className="w-2.5 h-2.5" />;
                  case 'facebook': return <MonitorSmartphone className="w-2.5 h-2.5" />;
                  case 'linkedin': return <Briefcase className="w-2.5 h-2.5" />;
                  default: return <MonitorSmartphone className="w-2.5 h-2.5" />;
                }
              };
              
              return (
                <Badge 
                  key={`${platform}-${idx}`} 
                  variant="outline" 
                  className="text-[10px] px-1 py-0 h-4 bg-black/20 text-gray-400 border-0"
                >
                  <PlatformIcon />
                </Badge>
              );
            })}
          </div>
        ) : null}
        
        {/* Categorie multiple o categoria singola */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {template.categories && template.categories.length > 0 ? (
            template.categories.map((category, idx) => {
              // Colore per categoria
              const getCategoryColor = (cat: string) => {
                switch (cat.toLowerCase()) {
                  case 'commercial': return 'from-green-500 to-green-700';
                  case 'social': return 'from-blue-500 to-blue-700';
                  case 'educational': return 'from-yellow-500 to-amber-600';
                  case 'corporate': return 'from-gray-500 to-gray-700';
                  case 'documentary': return 'from-orange-500 to-red-700';
                  case 'promotional': return 'from-purple-500 to-aida-magenta';
                  case 'entertainment': return 'from-pink-500 to-red-600';
                  case 'explainer': return 'from-cyan-500 to-blue-600';
                  case 'tutorial': return 'from-teal-500 to-green-600';
                  case 'product': return 'from-indigo-500 to-purple-700';
                  default: return 'from-gray-500 to-gray-700';
                }
              };
              
              return (
                <Badge key={`${category}-${idx}`} 
                  className={`text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r ${getCategoryColor(category)} text-white border-0`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              );
            })
          ) : (
            <Badge 
              className="text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white border-0"
            >
              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;