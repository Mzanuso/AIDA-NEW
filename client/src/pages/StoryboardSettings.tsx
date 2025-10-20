import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Wand2, 
  Settings, 
  Layers, 
  Film, 
  Timer, 
  Palette, 
  Sparkles,
  Loader2,
  X,
  LayoutGrid,
  ListOrdered,
  GitBranch,
  Clock,
  Plus,
  Minus,
  Aperture,
  Scissors,
  MoveHorizontal,
  MoveVertical,
  Droplets,
  ZoomIn,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const StoryboardSettings: React.FC = () => {
  // Stati per il layout della UI
  const [selectedLayout, setSelectedLayout] = useState<'sequential' | 'grid' | 'timeline' | 'flowchart'>('sequential');
  const [sceneCount, setSceneCount] = useState<number>(8);
  const [selectedTransition, setSelectedTransition] = useState<'fade' | 'cut' | 'slide' | 'dissolve' | 'wipe' | 'zoom'>('fade');
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  // Funzione per rigenerare le scene
  const regenerateScenes = () => {
    // Usando l'API Kling per rigenerare le scene
    console.log("Rigenerazione scene...");
    toast({
      title: "Rigenerazione scene",
      description: "Le scene verranno rigenerate dall'AI.",
      duration: 3000,
    });
  };

  const applySettings = () => {
    console.log("Impostazioni applicate:", {
      layout: selectedLayout,
      sceneCount,
      transition: selectedTransition,
    });
    
    toast({
      title: "Impostazioni applicate",
      description: "Le impostazioni dello storyboard sono state salvate.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-aida-dark p-6 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header con pulsante di chiusura */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-aida-orange/20 border border-aida-orange/50 rounded-md flex items-center justify-center">
              <Settings className="h-5 w-5 text-aida-orange" />
            </div>
            <h1 className="text-2xl font-bold">Storyboard Settings</h1>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Layout principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Prima colonna: Board Layout */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 text-aida-orange">
                <Layers />
              </div>
              <h2 className="text-lg font-semibold">Board Layout</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                className={`p-4 rounded-md text-left transition ${
                  selectedLayout === 'sequential' 
                    ? 'bg-aida-orange/20 border-2 border-aida-orange' 
                    : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
                }`}
                onClick={() => setSelectedLayout('sequential')}
              >
                <span className="font-medium">Sequential</span>
              </button>
              
              <button 
                className={`p-4 rounded-md text-left transition ${
                  selectedLayout === 'grid' 
                    ? 'bg-aida-blue/20 border-2 border-aida-blue' 
                    : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
                }`}
                onClick={() => setSelectedLayout('grid')}
              >
                <span className="font-medium">Grid</span>
              </button>
              
              <button 
                className={`p-4 rounded-md text-left transition ${
                  selectedLayout === 'timeline' 
                    ? 'bg-aida-blue/20 border-2 border-aida-blue' 
                    : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
                }`}
                onClick={() => setSelectedLayout('timeline')}
              >
                <span className="font-medium">Timeline</span>
              </button>
              
              <button 
                className={`p-4 rounded-md text-left transition ${
                  selectedLayout === 'flowchart' 
                    ? 'bg-aida-blue/20 border-2 border-aida-blue' 
                    : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
                }`}
                onClick={() => setSelectedLayout('flowchart')}
              >
                <span className="font-medium">Flowchart</span>
              </button>
            </div>
          </div>
          
          {/* Seconda colonna: Scene Count */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 text-aida-orange">
                <Layers />
              </div>
              <h2 className="text-lg font-semibold">Scene Count</h2>
            </div>
            
            <div className="bg-aida-gray/20 border border-aida-gray/40 p-6 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span>Number of scenes: {sceneCount}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md border border-aida-gray/40"
                    onClick={() => setSceneCount(Math.max(3, sceneCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md border border-aida-gray/40"
                    onClick={() => setSceneCount(Math.min(12, sceneCount + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="relative pt-4">
                <div className="h-1.5 bg-aida-orange rounded-full w-full"></div>
                <div className="flex justify-between text-xs text-aida-light-gray mt-2">
                  <span>Min: 3</span>
                  <span>Max: 12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scene Frames */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-aida-orange">
                <ImageIcon />
              </div>
              <h2 className="text-lg font-semibold">Scene Frames</h2>
            </div>
            
            <Button 
              variant="ghost" 
              className="bg-aida-gray/30 border border-aida-gray/50 hover:bg-aida-gray/40"
              onClick={regenerateScenes}
            >
              Regenerate
            </Button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {[...Array(3)].map((_, index) => (
              <div 
                key={index}
                onClick={() => setActiveSceneIndex(index)}
                className={`relative flex-shrink-0 w-36 h-24 rounded-md overflow-hidden cursor-pointer transition ${
                  activeSceneIndex === index 
                    ? 'border-2 border-aida-orange' 
                    : 'border border-aida-gray/40'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-aida-gray/30">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Transitions */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 text-aida-orange">
              <MoveHorizontal />
            </div>
            <h2 className="text-lg font-semibold">Transitions</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              className={`p-4 rounded-md text-left transition ${
                selectedTransition === 'fade' 
                  ? 'bg-aida-orange/20 border-2 border-aida-orange' 
                  : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
              }`}
              onClick={() => setSelectedTransition('fade')}
            >
              <span className="font-medium">Fade</span>
            </button>
            
            <button 
              className={`p-4 rounded-md text-left transition ${
                selectedTransition === 'cut' 
                  ? 'bg-aida-blue/20 border-2 border-aida-blue' 
                  : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
              }`}
              onClick={() => setSelectedTransition('cut')}
            >
              <span className="font-medium">Cut</span>
            </button>
            
            <button 
              className={`p-4 rounded-md text-left transition ${
                selectedTransition === 'slide' 
                  ? 'bg-aida-blue/20 border-2 border-aida-blue' 
                  : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
              }`}
              onClick={() => setSelectedTransition('slide')}
            >
              <span className="font-medium">Slide</span>
            </button>
            
            <button 
              className={`p-4 rounded-md text-left transition ${
                selectedTransition === 'dissolve' 
                  ? 'bg-aida-blue/20 border-2 border-aida-blue' 
                  : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
              }`}
              onClick={() => setSelectedTransition('dissolve')}
            >
              <span className="font-medium">Dissolve</span>
            </button>
            
            <button 
              className={`p-4 rounded-md text-left transition ${
                selectedTransition === 'wipe' 
                  ? 'bg-aida-blue/20 border-2 border-aida-blue' 
                  : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
              }`}
              onClick={() => setSelectedTransition('wipe')}
            >
              <span className="font-medium">Wipe</span>
            </button>
            
            <button 
              className={`p-4 rounded-md text-left transition ${
                selectedTransition === 'zoom' 
                  ? 'bg-aida-blue/20 border-2 border-aida-blue' 
                  : 'bg-aida-gray/20 border border-aida-gray/40 hover:bg-aida-gray/30'
              }`}
              onClick={() => setSelectedTransition('zoom')}
            >
              <span className="font-medium">Zoom</span>
            </button>
          </div>
        </div>
        
        {/* Apply Settings Button */}
        <div className="flex justify-center">
          <Button 
            className="bg-aida-orange hover:bg-aida-orange/90 text-white font-medium px-8 py-6"
            onClick={applySettings}
          >
            Apply Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryboardSettings;