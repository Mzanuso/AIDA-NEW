import React, { useState } from 'react';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import ModuleNavigation from '@/components/ui/ModuleNavigation';
import ModuleContent from '@/components/ui/ModuleContent';
import { Button } from '@/components/ui/button';
import { 
  ImageIcon, 
  Upload, 
  Music, 
  Video, 
  Trash2, 
  Plus, 
  Search,
  FileUp,
  Filter,
  Star,
  Download,
  Check
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  name: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  dateAdded: string;
  tags: string[];
  favorite: boolean;
}

const MediaPage: React.FC = () => {
  const [mediaTab, setMediaTab] = useState<'image' | 'video' | 'audio'>('image');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);
  
  // Mock data for media items
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'image',
      name: 'Product Hero Shot',
      url: 'https://dummyimage.com/600x400/3498db/ffffff&text=Product+Image',
      thumbnailUrl: 'https://dummyimage.com/600x400/3498db/ffffff&text=Product+Image',
      dateAdded: '2025-04-10',
      tags: ['product', 'marketing', 'hero'],
      favorite: true
    },
    {
      id: '2',
      type: 'image',
      name: 'Team Meeting',
      url: 'https://dummyimage.com/600x400/27ae60/ffffff&text=Team+Photo',
      thumbnailUrl: 'https://dummyimage.com/600x400/27ae60/ffffff&text=Team+Photo',
      dateAdded: '2025-04-15',
      tags: ['team', 'corporate', 'people'],
      favorite: false
    },
    {
      id: '3',
      type: 'video',
      name: 'Product Demo',
      url: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://dummyimage.com/600x400/e74c3c/ffffff&text=Video+Thumbnail',
      duration: 120,
      dateAdded: '2025-04-18',
      tags: ['demo', 'product', 'tutorial'],
      favorite: true
    },
    {
      id: '4',
      type: 'audio',
      name: 'Background Music',
      url: 'https://example.com/audio1.mp3',
      thumbnailUrl: 'https://dummyimage.com/600x400/9b59b6/ffffff&text=Audio+File',
      duration: 180,
      dateAdded: '2025-04-20',
      tags: ['music', 'background', 'relaxing'],
      favorite: false
    }
  ]);
  
  // Filtraggio dei media in base alla ricerca e alla tab attiva
  const filteredMedia = mediaItems.filter(item => {
    const matchesType = item.type === mediaTab;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesSearch;
  });
  
  // Gestire la selezione/deselezione di un elemento media
  const handleToggleSelect = (id: string) => {
    setSelectedMedia(prev => 
      prev.includes(id) 
        ? prev.filter(mediaId => mediaId !== id)
        : [...prev, id]
    );
  };
  
  // Simulare un caricamento di file
  const handleUpload = () => {
    setUploadingMedia(true);
    // Simulare il tempo di caricamento
    setTimeout(() => {
      setUploadingMedia(false);
      // In un'implementazione reale, qui aggiungeremmo i nuovi file al database
      alert('Upload completed successfully!');
    }, 2000);
  };
  
  // Aggiungere un elemento ai preferiti
  const handleToggleFavorite = (id: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
  };
  
  // Eliminare gli elementi selezionati
  const handleDeleteSelected = () => {
    if (selectedMedia.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedMedia.length} item(s)?`)) {
      setMediaItems(prev => prev.filter(item => !selectedMedia.includes(item.id)));
      setSelectedMedia([]);
    }
  };

  return (
    <BackgroundAnimation color="indigo">
      <ModuleNavigation currentModule="media" />
      <ModuleContent color="indigo">
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon size={24} className="text-indigo-400" />
          <h1 className="text-2xl font-light">Media Library</h1>
        </div>
        
        <div className="space-y-6">
          {/* Tabs e filtri */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Tabs 
              defaultValue="image" 
              value={mediaTab} 
              onValueChange={(value) => setMediaTab(value as 'image' | 'video' | 'audio')}
              className="w-full md:w-auto"
            >
              <TabsList>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Images</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  <span>Audio</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search media..."
                  className="pl-10 bg-black/20 border-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select defaultValue="date-desc">
                <SelectTrigger className="w-[180px] bg-black/20 border-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" className="bg-black/20 border-gray-700">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Selected items controls */}
          {selectedMedia.length > 0 && (
            <div className="flex justify-between items-center py-2 px-4 bg-indigo-900/30 rounded-md border border-indigo-700/50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-indigo-300">{selectedMedia.length} item(s) selected</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-transparent border-gray-600 hover:bg-indigo-900/50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-transparent text-red-400 border-red-900/50 hover:bg-red-900/20 hover:text-red-300"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-transparent border-gray-600"
                  onClick={() => setSelectedMedia([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
          
          {/* Grid di media */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Upload card */}
            <Card className="bg-black/20 border-indigo-800/30 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-0">
                <div 
                  className="flex flex-col items-center justify-center gap-3 p-8 text-center h-full min-h-[200px]"
                  onClick={handleUpload}
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-900/40 flex items-center justify-center group-hover:bg-indigo-800/60 transition-colors">
                    {uploadingMedia ? (
                      <div className="animate-spin h-8 w-8 border-t-2 border-indigo-400 rounded-full"></div>
                    ) : (
                      <FileUp className="h-8 w-8 text-indigo-400" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-indigo-300 mb-1">Upload Media</h3>
                    <p className="text-xs text-gray-400">
                      {uploadingMedia ? 'Uploading...' : 'Drag & drop files or click to browse'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Media items */}
            {filteredMedia.map(item => (
              <Card 
                key={item.id}
                className={`bg-black/20 ${
                  selectedMedia.includes(item.id) 
                    ? 'border-indigo-500 ring-1 ring-indigo-500/50' 
                    : 'border-gray-800 hover:border-indigo-700/50'
                } transition-all duration-300 overflow-hidden`}
              >
                <CardContent className="p-0 relative">
                  {/* Miniatura */}
                  <div 
                    className="aspect-video relative bg-black/40 cursor-pointer overflow-hidden"
                    onClick={() => handleToggleSelect(item.id)}
                  >
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {item.type === 'video' && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(item.duration! / 60)}:{(item.duration! % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                    
                    {item.type === 'audio' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="h-12 w-12 text-indigo-400 opacity-50" />
                      </div>
                    )}
                    
                    {/* Overlay selezione */}
                    {selectedMedia.includes(item.id) && (
                      <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium truncate pr-6">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute top-2 right-2 h-7 w-7 rounded-full ${
                          item.favorite
                            ? 'text-yellow-400 bg-black/60'
                            : 'text-gray-400 hover:text-yellow-400 bg-black/40'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item.id);
                        }}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs px-2 py-0 bg-black/30 hover:bg-indigo-900/30 cursor-pointer"
                          onClick={() => setSearchQuery(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-2 flex justify-between bg-black/40 text-xs text-gray-400">
                  <span>{item.dateAdded}</span>
                  <div className="flex items-center gap-1">
                    {item.type === 'image' && <ImageIcon className="h-3 w-3" />}
                    {item.type === 'video' && <Video className="h-3 w-3" />}
                    {item.type === 'audio' && <Music className="h-3 w-3" />}
                    <span className="capitalize">{item.type}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Empty state */}
          {filteredMedia.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-indigo-900/20 flex items-center justify-center mb-4">
                {mediaTab === 'image' && <ImageIcon className="h-8 w-8 text-indigo-400/50" />}
                {mediaTab === 'video' && <Video className="h-8 w-8 text-indigo-400/50" />}
                {mediaTab === 'audio' && <Music className="h-8 w-8 text-indigo-400/50" />}
              </div>
              
              <h3 className="text-xl font-medium mb-2">No {mediaTab}s found</h3>
              
              {searchQuery ? (
                <p className="text-gray-400 mb-4">
                  No results for "{searchQuery}". Try a different search term or clear the filter.
                </p>
              ) : (
                <p className="text-gray-400 mb-4">
                  Upload some {mediaTab}s to get started
                </p>
              )}
              
              <Button
                onClick={handleUpload}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload {mediaTab}s
              </Button>
            </div>
          )}
        </div>
      </ModuleContent>
    </BackgroundAnimation>
  );
};

export default MediaPage;