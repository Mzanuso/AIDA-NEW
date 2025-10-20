import React, { useState } from 'react';
import { Heart, ChevronUp, ChevronDown, Grid, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export interface StyleItem {
  id: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  colorPalette: string[];
  imageUrl: string;
  examples: string[];
}

// Mock data - nella versione reale di AIDA, questi dati verrebbero recuperati dal backend
const styleData: StyleItem[] = [
  {
    id: '1',
    name: 'Neo Tokyo',
    description: 'Cyberpunk-inspired futuristic cityscape with neon lights and high-tech elements',
    category: 'Cinematic',
    keywords: ['Futuristic', 'Neon', 'Cyberpunk', 'Urban', 'Night'],
    colorPalette: ['#0092E3', '#DD39B0', '#121212', '#50EBFF', '#FF5E5E'],
    imageUrl: 'https://picsum.photos/id/1035/800/1200',
    examples: Array(9).fill('https://picsum.photos/seed/picsum/300/300')
  },
  {
    id: '2',
    name: 'Ethereal Dream',
    description: 'Surrealistic dreamscape with floating elements and soft pastel colors',
    category: 'Surrealistic',
    keywords: ['Dreamy', 'Pastel', 'Floating', 'Soft', 'Abstract'],
    colorPalette: ['#A9D6E5', '#F2C1E1', '#FFFFFF', '#61E8E1', '#F6D2E0'],
    imageUrl: 'https://picsum.photos/id/1015/800/1200',
    examples: Array(9).fill('https://picsum.photos/seed/picsum/300/300')
  },
  {
    id: '3',
    name: 'Vintage Film',
    description: 'Classic film aesthetic with grain texture and warm tones',
    category: 'Retro',
    keywords: ['Film', 'Grainy', 'Warm', 'Nostalgic', 'Classic'],
    colorPalette: ['#E8D8C4', '#B7845B', '#7D5A3C', '#3A3238', '#D8C9B6'],
    imageUrl: 'https://picsum.photos/id/1019/800/1200',
    examples: Array(9).fill('https://picsum.photos/seed/picsum/300/300')
  }
];

interface StylePhaseProps {
  onStyleSelect: (style: StyleItem) => void;
}

const StylePhase: React.FC<StylePhaseProps> = ({ onStyleSelect }) => {
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  
  const currentStyle = styleData[currentStyleIndex];

  const nextStyle = () => {
    setCurrentStyleIndex((prev) => (prev + 1) % styleData.length);
    setShowGallery(false);
  };

  const prevStyle = () => {
    setCurrentStyleIndex((prev) => (prev - 1 + styleData.length) % styleData.length);
    setShowGallery(false);
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleGallery = () => {
    setShowGallery(!showGallery);
  };

  const selectStyle = () => {
    onStyleSelect(currentStyle);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Main style card */}
      <div className="style-card">
        <div className="absolute inset-0 z-0">
          <div className="ken-burns-effect h-full">
            <img 
              src={currentStyle.imageUrl} 
              alt={currentStyle.name} 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-aida-dark via-transparent to-transparent"></div>
          </div>
        </div>
        
        <div className="style-info">
          <h2 className="text-3xl font-bold mb-1">{currentStyle.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-aida-gray/50">
              {currentStyle.category}
            </span>
            <div className="flex gap-2">
              {currentStyle.keywords.slice(0, 3).map((keyword, idx) => (
                <span key={idx} className="text-xs text-aida-light-gray">
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-aida-light-gray max-w-xs">
            {currentStyle.description}
          </p>
          
          <div className="flex gap-2 mt-4">
            {currentStyle.colorPalette.map((color, idx) => (
              <div 
                key={idx} 
                className="w-8 h-8 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        <div className="style-actions">
          <button 
            className={`action-button ${liked[currentStyle.id] ? 'bg-aida-magenta' : ''}`}
            onClick={() => toggleLike(currentStyle.id)}
          >
            <Heart fill={liked[currentStyle.id] ? 'white' : 'none'} />
          </button>
          <button 
            className="action-button"
            onClick={toggleGallery}
          >
            <Grid />
          </button>
          <Button
            className="bg-aida-blue text-white rounded-full px-8 py-6 mt-4"
            onClick={selectStyle}
          >
            Choose
          </Button>
        </div>
      </div>
      
      {/* Navigation controls */}
      <button 
        className="absolute top-1/2 left-4 z-20 transform -translate-y-1/2 bg-aida-gray/30 rounded-full p-2"
        onClick={prevStyle}
      >
        <ChevronUp />
      </button>
      <button 
        className="absolute bottom-24 left-1/2 z-20 transform -translate-x-1/2 bg-aida-gray/30 rounded-full p-2"
        onClick={nextStyle}
      >
        <ChevronDown />
      </button>
      
      {/* Side gallery panel */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            className="side-panel right-0 bg-aida-gray/90 backdrop-blur-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Gallery</h3>
              <button 
                className="p-2"
                onClick={toggleGallery}
              >
                <X />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {currentStyle.examples.map((example, idx) => (
                <div key={idx} className="aspect-square overflow-hidden rounded-lg">
                  <img 
                    src={example} 
                    alt={`Example ${idx}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Color Palette</h4>
              <div className="flex justify-between">
                {currentStyle.colorPalette.map((color, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div 
                      className="w-12 h-12 rounded-full border border-white/20 mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs">{color}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {currentStyle.keywords.map((keyword, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs px-3 py-1 rounded-full bg-aida-dark"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StylePhase;