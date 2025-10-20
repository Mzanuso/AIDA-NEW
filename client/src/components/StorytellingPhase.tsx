import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StyleItem } from './StylePhase';
import { Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface StorytellingPhaseProps {
  selectedStyle: StyleItem;
  onStorySelect: (story: any) => void;
}

const StorytellingPhase: React.FC<StorytellingPhaseProps> = ({ 
  selectedStyle, 
  onStorySelect 
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedStories, setGeneratedStories] = useState<any[]>([]);

  // Funzione simulata per generare storie basate sul prompt
  const generateStories = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulazione di una chiamata API - in un'implementazione reale, questa sarà una chiamata all'API Claude
    setTimeout(() => {
      const mockStories = [
        {
          id: '1',
          title: 'Urban Odyssey',
          synopsis: 'A journey through the neon-lit streets of a futuristic metropolis, following a young artist who discovers a hidden world beneath the city.',
          themes: ['Discovery', 'Urban life', 'Technology'],
          styleMatching: 0.92
        },
        {
          id: '2',
          title: 'Digital Dreams',
          synopsis: 'A virtual reality designer creates a world so immersive that the boundaries between reality and fiction begin to blur, raising questions about identity and consciousness.',
          themes: ['Reality', 'Identity', 'Technology'],
          styleMatching: 0.85
        },
        {
          id: '3',
          title: 'Neon Memories',
          synopsis: 'In a world where memories can be digitized and sold, a memory dealer finds a rare recording that could change everything about how society functions.',
          themes: ['Memory', 'Commerce', 'Society'],
          styleMatching: 0.78
        }
      ];
      
      setGeneratedStories(mockStories);
      setIsGenerating(false);
    }, 2000);
  };

  const selectStory = (story: any) => {
    onStorySelect({
      ...story,
      prompt,
      style: selectedStyle
    });
  };

  return (
    <div className="min-h-screen bg-aida-dark p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tell Your Story</h1>
        <p className="text-aida-light-gray">
          Describe the story you want to tell. Our AI will help craft a narrative that matches your selected <span className="text-aida-blue">{selectedStyle.name}</span> style.
        </p>
      </div>

      <div className="bg-aida-gray/30 rounded-lg p-4 mb-6">
        <Textarea
          placeholder="Describe your story idea or concept... (e.g., 'A short film about a robot discovering emotions through art')"
          className="min-h-[120px] bg-aida-gray/50 border-aida-gray text-aida-white resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <Button 
            onClick={generateStories}
            disabled={isGenerating || !prompt.trim()}
            className="bg-aida-magenta text-white"
          >
            {isGenerating ? 'Generating...' : (
              <>
                <Wand2 className="mr-2 h-4 w-4" /> 
                Generate Story Ideas
              </>
            )}
          </Button>
        </div>
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 bg-gradient-to-r from-aida-blue to-aida-magenta rounded-full opacity-70 animate-pulse"></div>
            <div className="absolute inset-2 bg-aida-dark rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Wand2 className="text-aida-white h-8 w-8 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-aida-light-gray animate-pulse">Crafting your story...</p>
        </div>
      )}

      {!isGenerating && generatedStories.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Choose a Story Direction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedStories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-aida-gray/50 border-aida-gray hover:bg-aida-gray/70 transition-colors cursor-pointer group" onClick={() => selectStory(story)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium group-hover:text-aida-blue transition-colors">{story.title}</h3>
                      <div className="text-xs bg-aida-blue/20 text-aida-blue px-2 py-1 rounded-full">
                        {Math.round(story.styleMatching * 100)}% match
                      </div>
                    </div>
                    <p className="text-sm text-aida-light-gray mb-4">{story.synopsis}</p>
                    <div className="flex flex-wrap gap-2">
                      {story.themes.map((theme: string, idx: number) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-aida-dark rounded-full">
                          {theme}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-right">
                      <Button size="sm" variant="ghost" className="text-aida-blue hover:text-aida-blue/80">
                        Select this story
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StorytellingPhase;