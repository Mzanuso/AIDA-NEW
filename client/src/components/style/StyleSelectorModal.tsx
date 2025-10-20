import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';

interface StyleReference {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  images: {
    thumbnail: string;
    full: string[];
  };
}

interface StyleSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStyleSelect: (style: StyleReference) => void;
}

const StyleSelectorModal: React.FC<StyleSelectorModalProps> = ({
  open,
  onOpenChange,
  onStyleSelect,
}) => {
  const [styles, setStyles] = useState<StyleReference[]>([]);
  const [filteredStyles, setFilteredStyles] = useState<StyleReference[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StyleReference | null>(null);

  // Fetch styles from API when modal opens
  useEffect(() => {
    if (open && styles.length === 0) {
      fetchStyles();
    }
  }, [open]);

  // Filter styles based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStyles(styles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = styles.filter(
        (style) =>
          style.name?.toLowerCase().includes(query) ||
          style.id?.toLowerCase().includes(query) ||
          style.category?.toLowerCase().includes(query) ||
          style.description?.toLowerCase().includes(query) ||
          (style.tags && style.tags.length > 0 && style.tags.some((tag) => tag?.toLowerCase().includes(query)))
      );
      setFilteredStyles(filtered);
    }
  }, [searchQuery, styles]);

  const fetchStyles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/styles');
      const data = await response.json();

      // API returns { data: { data: [...] } }
      const stylesData = data.data?.data || data.data || [];
      console.log('Loaded styles:', stylesData.length);
      setStyles(stylesData);
      setFilteredStyles(stylesData);
    } catch (error) {
      console.error('Error fetching styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleClick = (style: StyleReference) => {
    setSelectedStyle(style);
  };

  const handleConfirmSelection = () => {
    if (selectedStyle) {
      onStyleSelect(selectedStyle);
      onOpenChange(false);
      // Reset state
      setSelectedStyle(null);
      setSearchQuery('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[600px] max-w-[600px] h-[80vh] sm:h-[75vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Select a Style</DialogTitle>
          <DialogDescription>
            Choose a visual style reference for your video project
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search by name, code, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Styles Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStyles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <div className="bg-neutral-50 p-6 rounded-xl mb-4">
                <Search className="h-12 w-12 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No styles found</h3>
              <p className="text-neutral-500 text-center max-w-xs">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 py-2">
              {filteredStyles.map((style) => (
                <div
                  key={style.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedStyle?.id === style.id
                      ? 'border-primary shadow-lg'
                      : 'border-transparent hover:border-neutral-200'
                  }`}
                  onClick={() => handleStyleClick(style)}
                >
                  {/* Image */}
                  <div className="aspect-video bg-neutral-100 overflow-hidden">
                    {style.images?.thumbnail ? (
                      <img
                        src={`http://localhost:3002${style.images.thumbnail}`}
                        alt={style.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <span className="text-4xl">🎨</span>
                      </div>
                    )}
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <h4 className="text-white font-semibold text-sm truncate">
                      {style.name}
                    </h4>
                  </div>

                  {/* Selection Indicator */}
                  {selectedStyle?.id === style.id && (
                    <div className="absolute top-3 right-3 bg-primary rounded-full p-2">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Confirm Button Only */}
        <div className="border-t pt-3 flex justify-end">
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedStyle}
            size="default"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StyleSelectorModal;
