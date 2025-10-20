import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StyleItem } from './StylePhase';
import { 
  Plus, 
  Trash2, 
  MoveHorizontal, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon, 
  CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormDescription } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface StoryboardPhaseProps {
  storyContent: any;
  selectedStyle: StyleItem;
  onComplete: (scenes: any[]) => void;
}

interface Scene {
  id: string;
  description: string;
  prompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
  style?: string;
  aspectRatio?: string;
  error?: string;
}

const StoryboardPhase: React.FC<StoryboardPhaseProps> = ({ 
  storyContent, 
  selectedStyle, 
  onComplete 
}) => {
  const [scenes, setScenes] = useState<Scene[]>([
    { id: '1', description: 'Opening Scene', prompt: '', style: 'realistic', aspectRatio: '16:9' },
    { id: '2', description: 'Introduction', prompt: '', style: 'realistic', aspectRatio: '16:9' },
    { id: '3', description: 'Development', prompt: '', style: 'realistic', aspectRatio: '16:9' }
  ]);
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0].id);
  const [klingApiAvailable, setKlingApiAvailable] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  
  const activeScene = scenes.find(scene => scene.id === activeSceneId) || scenes[0];

  useEffect(() => {
    // Verifica se l'API Kling è disponibile
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/kling/status');
        const data = await response.json();
        setKlingApiAvailable(data.available);
        
        if (!data.available) {
          setApiError(data.message || 'API Kling non disponibile');
          toast({
            title: "API Kling non disponibile",
            description: "Non è possibile generare storyboard automatici.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error checking API status:', error);
        setKlingApiAvailable(false);
        setApiError('Impossibile verificare lo stato dell\'API Kling');
      }
    };

    checkApiStatus();
  }, []);

  const addScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      description: `Scene ${scenes.length + 1}`,
      prompt: ''
    };
    setScenes([...scenes, newScene]);
    setActiveSceneId(newScene.id);
  };

  const deleteScene = (id: string) => {
    if (scenes.length <= 1) return;
    
    const newScenes = scenes.filter(scene => scene.id !== id);
    setScenes(newScenes);
    
    if (activeSceneId === id) {
      setActiveSceneId(newScenes[0].id);
    }
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(scene => 
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  };

  const generateImage = async (scene: Scene) => {
    if (!klingApiAvailable) {
      toast({
        title: "API Kling non disponibile",
        description: "Non è possibile generare storyboard automatici.",
        variant: "destructive"
      });
      return;
    }

    if (!scene.prompt || scene.prompt.trim() === '') {
      toast({
        title: "Prompt mancante",
        description: "Inserisci una descrizione per la scena prima di generare l'immagine.",
        variant: "destructive"
      });
      return;
    }

    // Aggiorna lo stato della scena
    updateScene(scene.id, { 
      isGenerating: true,
      error: undefined
    });
    
    try {
      // Costruisci il prompt con le caratteristiche di stile
      let enhancedPrompt = scene.prompt;
      
      // Aggiungi il nome dello stile e le parole chiave
      if (selectedStyle && selectedStyle.name) {
        enhancedPrompt += `, ${selectedStyle.name} style`;
        
        // Aggiungi alcune parole chiave dello stile
        if (selectedStyle.keywords && selectedStyle.keywords.length > 0) {
          // Prendi al massimo 3 parole chiave per non rendere il prompt troppo lungo
          const keywordsToAdd = selectedStyle.keywords.slice(0, 3).join(', ');
          enhancedPrompt += `, ${keywordsToAdd}`;
        }
      }
      
      // Prepara i parametri per la generazione
      const payload = {
        prompt: enhancedPrompt,
        style: scene.style || 'realistic',
        aspectRatio: scene.aspectRatio || '16:9',
        numberOfFrames: 1 // Generiamo una sola immagine per scena
      };
      
      console.log(`Generazione immagine per la scena "${scene.description}":`, payload);
      
      // Chiamata all'API Kling
      const response = await fetch('/api/kling/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Errore nella generazione dell\'immagine');
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Errore nella generazione dell\'immagine');
      }
      
      // Gestisce vari formati di risposta che potrebbe avere il modello
      let imageUrl: string | null = null;
      
      if (Array.isArray(data.result) && data.result.length > 0) {
        // Prendiamo la prima immagine dell'array
        imageUrl = data.result[0];
      } else if (typeof data.result === 'string') {
        // Se è una stringa singola
        imageUrl = data.result;
      } else if (data.result && typeof data.result === 'object') {
        // A volte Replicate potrebbe restituire un oggetto con più output
        const resultObj = data.result;
        
        // Cerca di estrarre un array di immagini dall'oggetto
        const possibleArrays = Object.values(resultObj).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0 && possibleArrays[0].length > 0) {
          // Usa la prima immagine del primo array trovato
          imageUrl = possibleArrays[0][0] as string;
        } else {
          // Se non troviamo array, proviamo a trovare stringhe (URL)
          const possibleUrls = Object.values(resultObj).filter(val => 
            typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))
          );
          
          if (possibleUrls.length > 0) {
            imageUrl = possibleUrls[0] as string;
          }
        }
      }
      
      if (!imageUrl) {
        throw new Error('Nessuna immagine generata o formato di risposta non riconosciuto');
      }
      
      // Aggiorna la scena con l'URL dell'immagine generata
      updateScene(scene.id, { 
        isGenerating: false,
        imageUrl,
        error: undefined
      });
      
      toast({
        title: "Immagine generata",
        description: `Immagine per la scena "${scene.description}" generata con successo.`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('Errore durante la generazione dell\'immagine:', error);
      
      updateScene(scene.id, { 
        isGenerating: false,
        error: error.message || 'Errore sconosciuto'
      });
      
      toast({
        title: "Errore",
        description: error.message || 'Errore durante la generazione dell\'immagine',
        variant: "destructive"
      });
    }
  };

  const completeStoryboard = () => {
    onComplete(scenes);
  };

  return (
    <div className="min-h-screen bg-aida-dark overflow-hidden flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-1">Storyboard Creation</h1>
        <p className="text-aida-light-gray mb-4">
          Visualize each scene of your story "{storyContent.title}" using the {selectedStyle.name} style
        </p>
      </div>

      {/* Scene thumbnails horizontal scroll */}
      <div className="px-6 mb-4 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-4">
          {scenes.map(scene => (
            <div 
              key={scene.id}
              className={`flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                activeSceneId === scene.id ? 'border-aida-blue scale-105' : 'border-transparent'
              }`}
              onClick={() => setActiveSceneId(scene.id)}
            >
              {scene.imageUrl ? (
                <img 
                  src={scene.imageUrl} 
                  alt={scene.description}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-aida-gray/50 flex items-center justify-center">
                  <span className="text-sm text-aida-light-gray">
                    {scene.isGenerating ? 'Generating...' : 'No image yet'}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="text-xs text-white truncate">{scene.description}</div>
              </div>
            </div>
          ))}
          
          <button 
            className="flex-shrink-0 w-40 h-24 rounded-lg border-2 border-dashed border-aida-gray/50 flex items-center justify-center text-aida-gray hover:bg-aida-gray/20"
            onClick={addScene}
          >
            <Plus />
          </button>
        </div>
      </div>

      {/* Active scene edit */}
      <div className="flex-grow bg-aida-gray/30 p-6 rounded-t-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Input
              value={activeScene.description}
              onChange={(e) => updateScene(activeScene.id, { description: e.target.value })}
              className="bg-aida-gray/50 border-aida-gray text-aida-white max-w-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteScene(activeScene.id)}
              disabled={scenes.length <= 1}
              className="text-aida-light-gray hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-aida-light-gray">
            Scene {scenes.findIndex(s => s.id === activeScene.id) + 1} of {scenes.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="order-2 md:order-1">
            <div className="mb-3">
              <label className="text-sm text-aida-light-gray mb-1 block">Image Prompt</label>
              <Textarea
                value={activeScene.prompt}
                onChange={(e) => updateScene(activeScene.id, { prompt: e.target.value })}
                placeholder={`Describe what should be in this scene using ${selectedStyle.name} style...`}
                className="min-h-[120px] bg-aida-gray/50 border-aida-gray text-aida-white resize-none"
              />
            </div>
            
            {/* Notifica se l'API non è disponibile */}
            {klingApiAvailable === false && (
              <div className="bg-red-900/30 border border-red-800 p-3 rounded-md text-red-200 mb-4 text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>API Kling non disponibile</strong>
                  <p className="mt-1 text-xs">{apiError || 'Controlla che il token API REPLICATE_API_TOKEN sia configurato correttamente.'}</p>
                </div>
              </div>
            )}
            
            {/* Mostra eventuali errori della scena */}
            {activeScene.error && (
              <div className="bg-red-900/30 border border-red-800 p-3 rounded-md text-red-200 mb-4 text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Errore nella generazione</strong>
                  <p className="mt-1 text-xs">{activeScene.error}</p>
                </div>
              </div>
            )}
            
            {/* Toggle per le opzioni avanzate */}
            <div className="mb-4">
              <Button 
                variant="ghost" 
                className="text-aida-light-gray px-0 py-1 h-auto"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                <span className="text-xs">
                  {showAdvancedOptions ? '- Nascondi opzioni avanzate' : '+ Mostra opzioni avanzate'}
                </span>
              </Button>
            </div>
            
            {/* Opzioni avanzate */}
            {showAdvancedOptions && (
              <div className="mb-4 space-y-4 border border-aida-gray/30 rounded-md p-3 bg-aida-gray/10">
                <div>
                  <label className="text-sm text-aida-light-gray mb-1 block">Stile visivo</label>
                  <Select
                    value={activeScene.style || 'realistic'}
                    onValueChange={(value) => updateScene(activeScene.id, { style: value })}
                  >
                    <SelectTrigger className="bg-aida-gray/30 border-aida-gray/50 focus:border-aida-blue text-white">
                      <SelectValue placeholder="Seleziona uno stile" />
                    </SelectTrigger>
                    <SelectContent className="bg-aida-gray border-aida-gray/50 text-white">
                      <SelectItem value="realistic">Realistico</SelectItem>
                      <SelectItem value="anime">Anime</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="comic">Fumetto</SelectItem>
                      <SelectItem value="cinematic">Cinematografico</SelectItem>
                      <SelectItem value="3d">3D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-aida-light-gray mb-1 block">Proporzioni</label>
                  <Select
                    value={activeScene.aspectRatio || '16:9'}
                    onValueChange={(value) => updateScene(activeScene.id, { aspectRatio: value })}
                  >
                    <SelectTrigger className="bg-aida-gray/30 border-aida-gray/50 focus:border-aida-blue text-white">
                      <SelectValue placeholder="Seleziona formato" />
                    </SelectTrigger>
                    <SelectContent className="bg-aida-gray border-aida-gray/50 text-white">
                      <SelectItem value="16:9">16:9 - Panoramico</SelectItem>
                      <SelectItem value="4:3">4:3 - Standard</SelectItem>
                      <SelectItem value="1:1">1:1 - Quadrato</SelectItem>
                      <SelectItem value="9:16">9:16 - Verticale</SelectItem>
                      <SelectItem value="2.35:1">2.35:1 - Cinematografico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Pulsante di generazione */}
            <div className="flex justify-between items-center">
              <Badge 
                variant={klingApiAvailable ? "outline" : "destructive"}
                className={klingApiAvailable ? "bg-green-900/20 text-green-300 border-green-800" : ""}
              >
                {klingApiAvailable === null ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : klingApiAvailable ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                <span className="text-xs">
                  {klingApiAvailable === null ? 'Verifica API...' : 
                   klingApiAvailable ? 'API Kling disponibile' : 'API non disponibile'}
                </span>
              </Badge>
              
              <Button
                onClick={() => generateImage(activeScene)}
                disabled={!activeScene.prompt.trim() || activeScene.isGenerating || !klingApiAvailable}
                className="bg-aida-blue text-white"
              >
                {activeScene.isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Genera immagine
                  </>
                )}
              </Button>
            </div>
            <div className="mt-8">
              <label className="text-sm text-aida-light-gray mb-1 block">Style Guidance</label>
              <div className="bg-aida-gray/50 rounded-lg p-3 text-sm text-aida-light-gray">
                <p className="mb-2">
                  <span className="text-aida-blue font-medium">{selectedStyle.name}</span> style characteristics:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {selectedStyle.keywords.map((keyword, idx) => (
                    <li key={idx}>{keyword}</li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  {selectedStyle.colorPalette.map((color, idx) => (
                    <div 
                      key={idx} 
                      className="w-6 h-6 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-aida-gray/20 rounded-lg flex flex-col items-center justify-center p-4 order-1 md:order-2 aspect-video">
            {activeScene.isGenerating ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-2 border-aida-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-aida-light-gray">Generazione immagine in corso...</p>
              </div>
            ) : activeScene.imageUrl ? (
              <>
                <img 
                  src={activeScene.imageUrl} 
                  alt={activeScene.description}
                  className="max-w-full max-h-[85%] object-contain rounded shadow-lg"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-aida-gray/30 hover:bg-aida-gray/40 border-aida-gray/30"
                  >
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {activeScene.aspectRatio || '16:9'}
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-aida-gray/30 hover:bg-aida-gray/40 border-aida-gray/30"
                  >
                    {activeScene.style || 'realistic'}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="text-center">
                <MoveHorizontal className="h-12 w-12 text-aida-gray/50 mx-auto mb-3" />
                <p className="text-aida-light-gray">Scrivi un prompt e genera un'immagine per questa scena</p>
                {!klingApiAvailable && (
                  <p className="text-red-400 text-xs mt-2">
                    <AlertCircle className="h-3 w-3 inline-block mr-1" />
                    API Kling non disponibile
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom actions */}
      <div className="bg-aida-gray/30 p-4 border-t border-aida-gray/20 flex justify-between">
        <div></div>
        <Button
          onClick={completeStoryboard}
          disabled={scenes.some(scene => !scene.imageUrl)}
          className="bg-aida-magenta text-white px-8"
        >
          Complete Storyboard
        </Button>
      </div>
    </div>
  );
};

export default StoryboardPhase;