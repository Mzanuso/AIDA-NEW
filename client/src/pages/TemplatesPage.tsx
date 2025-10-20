import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bookmark, SlidersHorizontal, ArrowLeft, Grid, Tag, CheckCheck, TrendingUp, 
  Star, Clock, Video, BookOpen, User, CreditCard, Settings, LogOut,
  Briefcase, Film, MessageSquare, Tv, Smartphone, MonitorSmartphone, Palette,
  Award, Zap, Filter, Heart, ChevronLeft, ChevronRight, Sparkles, Coins
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TemplateData } from '@/types/templateTypes';
import TemplateCard from '@/components/hub/TemplateCard';
import { mockTemplates } from '@/data/mockTemplates';
import { useLocation, Link } from 'wouter';
import NewAidaLogoAnimation from '@/components/ui/NewAidaLogoAnimation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FilterDialog, { FilterOptions } from '@/components/template/FilterDialog';
import TemplateDetailModal from '@/components/template/TemplateDetailModal';

interface TemplatesPageProps {
  onSelectTemplate?: (templateId: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const TemplatesPage: React.FC<TemplatesPageProps> = ({ onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateData[]>(mockTemplates);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    categories: [],
    aspects: [],
    durations: [],
    styles: [],
    platforms: [],
    audiences: []
  });
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [, setLocation] = useLocation();

  // Estrae tutte le categorie uniche dai dati dei template (sia singole che multiple)
  const extractUniqueCategories = () => {
    const categoriesSet = new Set<string>();
    
    // Aggiungi sempre 'all' come prima categoria
    categoriesSet.add('all');
    
    mockTemplates.forEach(template => {
      // Aggiungi la categoria principale
      if (template.category) {
        categoriesSet.add(template.category);
      }
      
      // Aggiungi anche le categorie multiple se presenti
      if (template.categories && template.categories.length > 0) {
        template.categories.forEach(category => categoriesSet.add(category));
      }
    });
    
    return Array.from(categoriesSet);
  };
  
  // Categorie di template (derivate dai dati)
  const categories = extractUniqueCategories();

  // Effetto per caricare e filtrare i template
  useEffect(() => {
    setIsLoading(true);
    // Simulazione fetch
    setTimeout(() => {
      let filtered = [...mockTemplates];
      
      // Filtra per categoria (inclusivo tra categorie multiple)
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(template => {
          // Controlla nelle categorie multiple se presenti
          if (template.categories && template.categories.length > 0) {
            return template.categories.includes(selectedCategory);
          }
          // Altrimenti usa la categoria singola
          return template.category === selectedCategory;
        });
      }
      
      // Filtra per preferiti (se attivo)
      if (showFavorites) {
        filtered = filtered.filter(template => favoriteTemplates.includes(template.id));
      }
      
      // Filtra per categorie (se presenti)
      if (advancedFilters.categories.length > 0) {
        filtered = filtered.filter(template => {
          const templateCategories = template.categories || [];
          // Verifica se il template appartiene ad almeno una delle categorie selezionate
          return advancedFilters.categories.some(cat => 
            templateCategories.includes(cat) || template.category === cat
          );
        });
      }
      
      // Filtra per aspect ratio (se presenti)
      if (advancedFilters.aspects.length > 0) {
        filtered = filtered.filter(template => {
          return template.aspectRatio && advancedFilters.aspects.includes(template.aspectRatio);
        });
      }
      
      // Filtra per durata (se presenti)
      if (advancedFilters.durations.length > 0) {
        filtered = filtered.filter(template => {
          return template.duration && advancedFilters.durations.includes(template.duration);
        });
      }
      
      // Filtra per stile (se presenti)
      if (advancedFilters.styles.length > 0) {
        filtered = filtered.filter(template => {
          return template.style && advancedFilters.styles.includes(template.style);
        });
      }
      
      // Filtra per piattaforme (se presenti)
      if (advancedFilters.platforms.length > 0) {
        filtered = filtered.filter(template => {
          return template.platforms && template.platforms.some(platform => 
            advancedFilters.platforms.includes(platform)
          );
        });
      }
      
      // Filtra per audience (se presenti)
      if (advancedFilters.audiences.length > 0) {
        filtered = filtered.filter(template => {
          return template.targetAudience && advancedFilters.audiences.includes(template.targetAudience);
        });
      }
      
      // Filtra per query di ricerca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          template => 
            template.title.toLowerCase().includes(query) || 
            template.description.toLowerCase().includes(query) ||
            template.tags.some(tag => tag.toLowerCase().includes(query)) ||
            (template.platforms && template.platforms.some(platform => platform.toLowerCase().includes(query))) ||
            (template.style && template.style.toLowerCase().includes(query))
        );
      }
      
      setFilteredTemplates(filtered);
      setIsLoading(false);
    }, 300);
  }, [searchQuery, selectedCategory, advancedFilters, showFavorites, favoriteTemplates]);

  // Funzione per gestire il filtro
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Funzione per gestire la selezione di un template
  const handleTemplateSelect = (template: TemplateData) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.id);
    } else {
      console.log(`Template selected: ${template.id}`);
      setSelectedTemplate(template);
      setIsDetailModalOpen(true);
    }
  };
  
  // Gestione filtri avanzati
  const handleApplyAdvancedFilters = (filters: FilterOptions) => {
    setAdvancedFilters(filters);
  };
  
  // Gestione preferiti
  const handleToggleFavorite = (templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };
  
  // Toggle visualizzazione preferiti
  const handleToggleShowFavorites = (show: boolean) => {
    setShowFavorites(show);
  };
  
  // Torna all'hub
  const handleBackToHub = () => {
    setLocation('/aida-hub');
  };
  
  // Formatta la durata in minuti:secondi
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Header con logo e navigazione */}
      <header className="flex justify-between items-center h-14 px-2 sm:px-4 border-b border-gray-800 relative">
        {/* Logo AIDA animato con link alla home */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full hover:bg-black/40 transition-colors"
            onClick={handleBackToHub}
          >
            <ArrowLeft size={18} className="text-gray-400" />
          </Button>
          <Link href="/aida-hub" className="flex items-center">
            <NewAidaLogoAnimation size={32} className="p-0.5" />
          </Link>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <h1 className="text-xl font-light">Templates Library</h1>
        </div>
        
        {/* Credits e profilo utente */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/plan">
            <Badge 
              className="bg-gradient-to-r from-red-500 to-aida-magenta border-0 text-white rounded-full px-2 sm:px-3 font-light text-xs hover:from-red-600 hover:to-aida-magenta/90 transition-all cursor-pointer shadow-sm hover:shadow-aida-magenta/20 flex items-center gap-1"
            >
              <Coins size={12} className="mr-0.5" />
              262
            </Badge>
          </Link>
          
          {/* User Button con dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="rounded-full h-8 w-8 p-0 border border-gray-800/50 bg-black/30 hover:bg-black/50 hover:border-gray-700 transition-all group"
              >
                <span className="sr-only">User menu</span>
                <User size={14} className="text-gray-400 group-hover:text-white transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-40 mr-4 bg-black/90 backdrop-blur-md border-gray-800 text-gray-200">
              <DropdownMenuLabel className="text-xs font-normal text-gray-400">Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="gap-2 text-sm hover:bg-gray-800/80 cursor-pointer">
                <User size={14} className="text-gray-400" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm hover:bg-gray-800/80 cursor-pointer">
                <Settings size={14} className="text-gray-400" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm hover:bg-gray-800/80 cursor-pointer">
                <CreditCard size={14} className="text-gray-400" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="gap-2 text-sm hover:bg-gray-800/80 cursor-pointer">
                <LogOut size={14} className="text-gray-400" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Alone luminoso animato in background - opacità ulteriormente ridotta */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vh] -translate-x-1/2 -translate-y-1/2 ambient-glow opacity-ultra-low">
          <div className="absolute inset-0 rounded-full bg-[#0092E3] blur-[180px]"></div>
          <div className="absolute inset-0 rounded-full bg-[#DD39B0] blur-[220px] mix-blend-screen opacity-70"></div>
        </div>
      </div>
      
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Search e filtri con stile migliorato */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-black/30 backdrop-blur-sm border border-gray-800/40 p-4 rounded-md">
          <div className="relative flex-grow">
            <Input
              className="w-full bg-black/50 backdrop-blur-sm border border-gray-800/50 rounded-md text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-aida-blue/30 focus-visible:border-aida-blue/50 transition-all"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={selectedCategory === 'all' ? "default" : "outline"}
              size="sm"
              className={`text-sm ${
                selectedCategory === 'all' 
                  ? "bg-aida-magenta hover:bg-aida-magenta/90 text-white border-0" 
                  : "bg-transparent border border-gray-800/70 text-gray-300 hover:text-white hover:bg-black/50"
              }`}
              onClick={() => handleCategoryChange('all')}
            >
              <Grid size={14} className="mr-1.5" />
              All
            </Button>
            
            <FilterDialog 
              onApplyFilters={handleApplyAdvancedFilters}
              selectedFilters={advancedFilters}
              showFavorites={showFavorites}
              onToggleFavorites={handleToggleShowFavorites}
            />
          </div>
        </div>
        
        {/* Templates Display */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative flex">
              <div className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-aida-blue/10 opacity-75"></div>
              <div className="animate-spin relative h-8 w-8 rounded-full border-t-2 border-b-2 border-aida-blue"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Fullscreen Swipeable Cards per Mobile */}
            <div className="block md:hidden mb-8">
              {filteredTemplates.length > 0 && (
                <div className="relative">
                  <div className="overflow-x-auto hide-scrollbar snap-x snap-mandatory flex">
                    {filteredTemplates.map((template) => (
                      <div 
                        key={template.id}
                        className="flex-none snap-center w-full min-h-[85vh] transform transition-all px-2"
                      >
                        <div className="relative w-full h-full bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/40 shadow-lg">
                          {/* Card content top area (image) */}
                          <div className="h-2/3 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                            {template.thumbnailUrl ? (
                              <img 
                                src={template.thumbnailUrl} 
                                alt={template.title} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20">
                                <svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 2V22" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M2 12H22" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                            
                            {/* Badge di status */}
                            <div className="absolute top-4 right-4 flex flex-col gap-1">
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
                            <div className="absolute top-4 left-4 z-10">
                              <button 
                                className={`w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors border border-gray-800/40 backdrop-blur-sm ${favoriteTemplates.includes(template.id) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-300'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(template.id);
                                }}
                              >
                                <Heart 
                                  size={20} 
                                  className={`transition-all ${favoriteTemplates.includes(template.id) ? 'fill-pink-500' : 'fill-transparent'}`} 
                                />
                              </button>
                            </div>
                            
                            {/* Aspect ratio */}
                            <div className="absolute bottom-4 right-4">
                              <Badge className="text-xs bg-black/60 text-gray-300 border border-gray-800/80 px-2 py-0.5">
                                {template.aspectRatio}
                              </Badge>
                            </div>
                            
                            {/* Effetto glassmorphism con sfumatura */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                          </div>
                          
                          {/* Card content bottom area (info) */}
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/60 backdrop-blur-lg border-t border-gray-800/20 p-5 flex flex-col justify-between">
                            <div>
                              <h3 className="text-xl font-medium text-white leading-tight mb-2">
                                {template.title}
                              </h3>
                              <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                                {template.description}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {/* Durata */}
                              {template.duration !== undefined && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-black/40 text-gray-300 border border-gray-800/60 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{formatDuration(template.duration)}</span>
                                </Badge>
                              )}
                              
                              {/* Stile */}
                              {template.style && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-black/40 text-gray-300 border border-gray-800/60 flex items-center">
                                  <Palette className="w-3 h-3 mr-1" />
                                  <span>{template.style}</span>
                                </Badge>
                              )}
                              
                              {/* Pulsante per vedere dettagli */}
                              <Button 
                                className="ml-auto bg-aida-blue hover:bg-aida-blue/90 text-white text-xs px-3 h-7"
                                onClick={() => handleTemplateSelect(template)}
                              >
                                Use Template
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Indicatore di swipe - posizionato in basso al centro */}
                  <div className="fixed bottom-6 left-0 right-0 flex justify-center space-x-2 z-50 pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-800/30 shadow-lg">
                      <p className="text-xs text-gray-400 flex items-center">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Swipe to browse
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Grid per Desktop */}
            <div className="hidden md:block">
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredTemplates.map((template, index) => (
                  <motion.div 
                    key={template.id}
                    variants={itemVariants}
                    transition={{ delay: index * 0.03 }}
                    className="transform transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-aida-blue/10"
                  >
                    <TemplateCard
                      template={template}
                      onClick={handleTemplateSelect}
                      isFavorite={favoriteTemplates.includes(template.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </>
        )}
        
        {!isLoading && filteredTemplates.length === 0 && (
          <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No templates found matching your criteria.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-300 hover:bg-black/50 hover:text-white border border-gray-800/70"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <CheckCheck size={14} className="mr-1.5" />
              Clear filters
            </Button>
          </div>
        )}
      </main>
      
      {/* Modale di dettaglio template */}
      <TemplateDetailModal 
        template={selectedTemplate} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default TemplatesPage;