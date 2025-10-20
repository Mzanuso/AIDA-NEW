import React, { useState } from 'react';
import { CheckIcon, Filter, Square, Clock, Monitor, SlidersHorizontal, Users, Palette, Heart } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FilterDialogProps {
  onApplyFilters: (filters: FilterOptions) => void;
  selectedFilters: FilterOptions;
  showFavorites: boolean;
  onToggleFavorites: (show: boolean) => void;
}

export interface FilterOptions {
  categories: string[];
  aspects: string[];
  durations: number[];
  styles: string[];
  platforms: string[];
  audiences: string[];
}

// Filtri completi disponibili
const availableFilters = {
  categories: [
    'commercial',
    'product',
    'promotional', 
    'documentary',
    'corporate',
    'explainer',
    'tutorial',
    'social',
    'educational',
    'entertainment'
  ],
  aspects: ['16:9', '9:16', '1:1', '4:5', '4:3'],
  durations: [30, 60, 120, 180, 300, 600],
  styles: ['Clean', 'Modern', 'Cinematic', 'Vibrant', 'Minimal', 'Corporate', 'Dynamic', 'Nostalgic'],
  platforms: ['instagram', 'tiktok', 'youtube', 'facebook', 'linkedin', 'website'],
  audiences: ['Gen Z', 'Millennials', 'Business', 'All', 'Educational', 'Professional']
};

// Helper per formattare il tempo in minuti e secondi
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  return `${minutes}:${remainingSecs.toString().padStart(2, '0')}`;
};

const FilterDialog: React.FC<FilterDialogProps> = ({ 
  onApplyFilters, 
  selectedFilters,
  showFavorites,
  onToggleFavorites
}) => {
  // Stati locali per ogni tipo di filtro
  const [localFilters, setLocalFilters] = useState<FilterOptions>({...selectedFilters});
  const [activeTab, setActiveTab] = useState('categories');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(showFavorites);
  
  // Gestione toggle di varie categorie di filtri
  const handleToggleFilter = (filterType: keyof FilterOptions, filter: string | number) => {
    setLocalFilters(prev => {
      // Crea una copia dell'array attuale per quel tipo di filtro
      const currentFilters = [...prev[filterType]];
      
      // Aggiunge o rimuove il filtro dalla selezione
      if (currentFilters.includes(filter)) {
        return {
          ...prev,
          [filterType]: currentFilters.filter(f => f !== filter)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentFilters, filter]
        };
      }
    });
  };

  // Applica tutti i filtri
  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    if (showOnlyFavorites !== showFavorites) {
      onToggleFavorites(showOnlyFavorites);
    }
  };

  // Pulisce tutti i filtri
  const handleClearFilters = () => {
    setLocalFilters({
      categories: [],
      aspects: [],
      durations: [],
      styles: [],
      platforms: [],
      audiences: []
    });
    setShowOnlyFavorites(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm"
          className="text-white bg-aida-blue hover:bg-aida-blue/90 transition-colors"
        >
          <Filter size={16} className="mr-1.5" />
          <span>Advanced Filters</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 backdrop-blur-md border-gray-800 text-white max-w-xl w-full">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <SlidersHorizontal size={18} className="mr-2 text-aida-blue" />
            <span>Advanced Filters</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Filter templates by multiple criteria
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-2 bg-gray-800" />
        
        <div className="flex items-center space-x-2 py-2">
          <Switch 
            id="favorites-only" 
            checked={showOnlyFavorites}
            onCheckedChange={setShowOnlyFavorites}
          />
          <Label htmlFor="favorites-only" className="text-gray-300 flex items-center cursor-pointer">
            <Heart size={16} className="mr-1.5 text-pink-500" />
            Show favorites only
          </Label>
        </div>
        
        <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-6 gap-1 bg-black/40 p-1 mb-4">
            <TabsTrigger value="categories" className="text-xs data-[state=active]:bg-aida-blue/90">Categories</TabsTrigger>
            <TabsTrigger value="aspects" className="text-xs data-[state=active]:bg-aida-blue/90">Aspect Ratio</TabsTrigger>
            <TabsTrigger value="durations" className="text-xs data-[state=active]:bg-aida-blue/90">Duration</TabsTrigger>
            <TabsTrigger value="styles" className="text-xs data-[state=active]:bg-aida-blue/90">Style</TabsTrigger>
            <TabsTrigger value="platforms" className="text-xs data-[state=active]:bg-aida-blue/90">Platforms</TabsTrigger>
            <TabsTrigger value="audiences" className="text-xs data-[state=active]:bg-aida-blue/90">Audience</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="mt-0">
            <ScrollArea className="h-56 pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {availableFilters.categories.map((filter) => (
                  <Badge
                    key={filter}
                    variant="outline"
                    className={`
                      cursor-pointer flex items-center justify-between px-3 py-2 
                      ${localFilters.categories.includes(filter) 
                        ? 'bg-aida-blue/20 border-aida-blue text-white' 
                        : 'bg-black/50 border-gray-700 text-gray-300 hover:border-gray-500'}
                    `}
                    onClick={() => handleToggleFilter('categories', filter)}
                  >
                    <span className="capitalize">{filter}</span>
                    {localFilters.categories.includes(filter) && (
                      <CheckIcon size={14} className="ml-2 text-aida-blue" />
                    )}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="aspects" className="mt-0">
            <ScrollArea className="h-56 pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {availableFilters.aspects.map((aspect) => (
                  <Badge
                    key={aspect}
                    variant="outline"
                    className={`
                      cursor-pointer flex items-center justify-between px-3 py-2 
                      ${localFilters.aspects.includes(aspect) 
                        ? 'bg-aida-blue/20 border-aida-blue text-white' 
                        : 'bg-black/50 border-gray-700 text-gray-300 hover:border-gray-500'}
                    `}
                    onClick={() => handleToggleFilter('aspects', aspect)}
                  >
                    <div className="flex items-center">
                      <Square size={14} className="mr-1.5 text-gray-500" />
                      <span>{aspect}</span>
                    </div>
                    {localFilters.aspects.includes(aspect) && (
                      <CheckIcon size={14} className="ml-2 text-aida-blue" />
                    )}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="durations" className="mt-0">
            <ScrollArea className="h-56 pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {availableFilters.durations.map((duration) => (
                  <Badge
                    key={duration}
                    variant="outline"
                    className={`
                      cursor-pointer flex items-center justify-between px-3 py-2 
                      ${localFilters.durations.includes(duration) 
                        ? 'bg-aida-blue/20 border-aida-blue text-white' 
                        : 'bg-black/50 border-gray-700 text-gray-300 hover:border-gray-500'}
                    `}
                    onClick={() => handleToggleFilter('durations', duration)}
                  >
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1.5 text-gray-500" />
                      <span>{formatDuration(duration)}</span>
                    </div>
                    {localFilters.durations.includes(duration) && (
                      <CheckIcon size={14} className="ml-2 text-aida-blue" />
                    )}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="styles" className="mt-0">
            <ScrollArea className="h-56 pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {availableFilters.styles.map((style) => (
                  <Badge
                    key={style}
                    variant="outline"
                    className={`
                      cursor-pointer flex items-center justify-between px-3 py-2 
                      ${localFilters.styles.includes(style) 
                        ? 'bg-aida-blue/20 border-aida-blue text-white' 
                        : 'bg-black/50 border-gray-700 text-gray-300 hover:border-gray-500'}
                    `}
                    onClick={() => handleToggleFilter('styles', style)}
                  >
                    <div className="flex items-center">
                      <Palette size={14} className="mr-1.5 text-gray-500" />
                      <span>{style}</span>
                    </div>
                    {localFilters.styles.includes(style) && (
                      <CheckIcon size={14} className="ml-2 text-aida-blue" />
                    )}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="platforms" className="mt-0">
            <ScrollArea className="h-56 pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {availableFilters.platforms.map((platform) => (
                  <Badge
                    key={platform}
                    variant="outline"
                    className={`
                      cursor-pointer flex items-center justify-between px-3 py-2 
                      ${localFilters.platforms.includes(platform) 
                        ? 'bg-aida-blue/20 border-aida-blue text-white' 
                        : 'bg-black/50 border-gray-700 text-gray-300 hover:border-gray-500'}
                    `}
                    onClick={() => handleToggleFilter('platforms', platform)}
                  >
                    <div className="flex items-center">
                      <Monitor size={14} className="mr-1.5 text-gray-500" />
                      <span className="capitalize">{platform}</span>
                    </div>
                    {localFilters.platforms.includes(platform) && (
                      <CheckIcon size={14} className="ml-2 text-aida-blue" />
                    )}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="audiences" className="mt-0">
            <ScrollArea className="h-56 pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {availableFilters.audiences.map((audience) => (
                  <Badge
                    key={audience}
                    variant="outline"
                    className={`
                      cursor-pointer flex items-center justify-between px-3 py-2 
                      ${localFilters.audiences.includes(audience) 
                        ? 'bg-aida-blue/20 border-aida-blue text-white' 
                        : 'bg-black/50 border-gray-700 text-gray-300 hover:border-gray-500'}
                    `}
                    onClick={() => handleToggleFilter('audiences', audience)}
                  >
                    <div className="flex items-center">
                      <Users size={14} className="mr-1.5 text-gray-500" />
                      <span>{audience}</span>
                    </div>
                    {localFilters.audiences.includes(audience) && (
                      <CheckIcon size={14} className="ml-2 text-aida-blue" />
                    )}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex sm:justify-between pt-4 gap-3">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white"
            onClick={handleClearFilters}
          >
            Clear all
          </Button>
          <Button 
            className="bg-aida-blue hover:bg-aida-blue/90 text-white"
            onClick={handleApplyFilters}
          >
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;