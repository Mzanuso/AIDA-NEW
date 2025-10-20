import React, { useState, useEffect } from 'react';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import ModuleNavigation from '@/components/ui/ModuleNavigation';
import ModuleContent from '@/components/ui/ModuleContent';
import { Button } from '@/components/ui/button';
import { Layout, Wand2, Plus, Trash2, Save, Info, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SceneData {
  id: string;
  prompt: string;
  imageUrl?: string;
  status: 'empty' | 'generating' | 'generated' | 'error';
  error?: string;
}

const BoardPage: React.FC = () => {
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [klingApiAvailable, setKlingApiAvailable] = useState<boolean | null>(null);
  const [klingErrorMessage, setKlingErrorMessage] = useState<string>('');
  const [sceneCount, setSceneCount] = useState<number>(8);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<'prompt' | 'settings'>('prompt');
  
  // Impostazioni generali storyboard
  const [boardSettings, setBoardSettings] = useState({
    aspectRatio: '16:9',
    stylePrompt: '',
    negativePrompt: '',
    seed: '',
  });
  
  // Inizializzazione delle scene
  useEffect(() => {
    // Creazione delle scene iniziali con ID unici
    const initialScenes = Array.from({ length: sceneCount }, (_, index) => ({
      id: `scene-${index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      prompt: '',
      status: 'empty' as const
    }));
    
    setScenes(initialScenes);
    
    if (initialScenes.length > 0) {
      setActiveSceneId(initialScenes[0].id);
    }
    
    // Verifica disponibilità API Kling
    checkKlingApiStatus();
  }, []);
  
  // Aggiornamento numero di scene
  useEffect(() => {
    if (sceneCount > scenes.length) {
      // Aggiungiamo nuove scene con ID unici usando timestamp
      const newScenes = Array.from(
        { length: sceneCount - scenes.length }, 
        (_, index) => ({
          id: `scene-${scenes.length + index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          prompt: '',
          status: 'empty' as const
        })
      );
      
      setScenes(prev => [...prev, ...newScenes]);
    } else if (sceneCount < scenes.length) {
      // Rimuoviamo scene in eccesso
      setScenes(prev => prev.slice(0, sceneCount));
      
      // Se la scena attiva è tra quelle rimosse, impostiamo la prima scena come attiva
      if (activeSceneId) {
        const sceneNumber = parseInt(activeSceneId.split('-')[1]);
        if (isNaN(sceneNumber) || sceneNumber > sceneCount) {
          setActiveSceneId(scenes[0]?.id || null);
        }
      }
    }
  }, [sceneCount]);
  
  // Ottieni la scena attiva
  const activeScene = activeSceneId ? scenes.find(scene => scene.id === activeSceneId) : null;
  
  // Verifica lo stato dell'API Kling
  const checkKlingApiStatus = async () => {
    try {
      const response = await fetch('/api/kling/status');
      const data = await response.json();
      setKlingApiAvailable(data.available);
      if (!data.available) {
        setKlingErrorMessage(data.message || 'API Kling non disponibile');
      }
    } catch (error) {
      console.error('Error checking Kling API status:', error);
      setKlingApiAvailable(false);
      setKlingErrorMessage('Impossibile verificare lo stato dell\'API Kling');
    }
  };
  
  // Funzione per aggiornare il prompt della scena attiva
  const handleUpdatePrompt = (value: string) => {
    if (activeSceneId) {
      setScenes(prev => prev.map(scene => 
        scene.id === activeSceneId ? { ...scene, prompt: value } : scene
      ));
    }
  };
  
  // Funzione per generare l'immagine di una singola scena
  const generateSceneImage = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene || !klingApiAvailable) {
      return;
    }
    
    if (!scene.prompt || scene.prompt.length < 10) {
      setKlingErrorMessage(`Inserisci una descrizione per la scena ${sceneId.split('-')[1]} di almeno 10 caratteri.`);
      return;
    }
    
    // Aggiorna lo stato della scena a "generazione in corso"
    setScenes(prev => prev.map(s => 
      s.id === sceneId ? { ...s, status: 'generating' } : s
    ));
    
    try {
      // Costruiamo un prompt completo che incorpora le impostazioni di stile
      let fullPrompt = scene.prompt;
      if (boardSettings.stylePrompt) {
        fullPrompt += `, ${boardSettings.stylePrompt}`;
      }
      
      const requestBody = {
        prompt: fullPrompt,
        negative_prompt: boardSettings.negativePrompt || undefined,
        seed: boardSettings.seed ? parseInt(boardSettings.seed) : undefined,
        aspect_ratio: boardSettings.aspectRatio.replace(':', 'x')
      };
      
      // Chiamata all'API Kling per generare l'immagine
      const response = await fetch('/api/kling/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.id) {
        // Polling per ottenere il risultato
        let resultData = null;
        let attempts = 0;
        const maxAttempts = 30; // 30 secondi al massimo
        
        while (!resultData && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 secondo di attesa
          attempts++;
          
          const predictionResponse = await fetch(`/api/kling/prediction/${data.id}`);
          const predictionData = await predictionResponse.json();
          
          if (predictionData.status === 'succeeded' && predictionData.output) {
            resultData = predictionData.output;
            break;
          } else if (predictionData.status === 'failed') {
            throw new Error('Generazione fallita: ' + (predictionData.error || 'Errore sconosciuto'));
          }
        }
        
        if (resultData) {
          // Aggiorna lo stato della scena con l'URL dell'immagine generata
          setScenes(prev => prev.map(s => 
            s.id === sceneId ? { 
              ...s, 
              status: 'generated',
              imageUrl: Array.isArray(resultData) ? resultData[0] : resultData
            } : s
          ));
        } else {
          throw new Error('Timeout nella generazione dell\'immagine');
        }
      } else {
        throw new Error('Risposta non valida dal server');
      }
      
    } catch (error: any) {
      console.error('Error generating image:', error);
      setScenes(prev => prev.map(s => 
        s.id === sceneId ? { 
          ...s, 
          status: 'error',
          error: error.message || 'Errore nella generazione dell\'immagine'
        } : s
      ));
    }
  };
  
  // Funzione per generare tutte le immagini
  const generateAllImages = async () => {
    if (!klingApiAvailable) {
      setKlingErrorMessage('API Kling non disponibile. Assicurati che il token API sia configurato.');
      return;
    }
    
    // Verifica che ci sia almeno un prompt valido
    const hasValidPrompt = scenes.some(scene => scene.prompt && scene.prompt.length >= 10);
    if (!hasValidPrompt) {
      setKlingErrorMessage('Inserisci almeno una descrizione di scena valida (minimo 10 caratteri).');
      return;
    }
    
    setIsGeneratingAll(true);
    setKlingErrorMessage('');
    
    try {
      // Genera le immagini per tutte le scene che hanno un prompt valido
      for (const scene of scenes) {
        if (scene.prompt && scene.prompt.length >= 10) {
          await generateSceneImage(scene.id);
        }
      }
    } finally {
      setIsGeneratingAll(false);
    }
  };

  return (
    <BackgroundAnimation color="orange">
      <ModuleNavigation currentModule="board" />
      <ModuleContent color="orange">
        <div className="flex items-center gap-3 mb-6">
          <Layout size={24} className="text-orange-400" />
          <h1 className="text-2xl font-light">Storyboard Generator</h1>
        </div>
        
        {/* Avviso API Kling */}
        {klingApiAvailable === false && (
          <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>API Kling non disponibile</AlertTitle>
            <AlertDescription>
              {klingErrorMessage || "Assicurati che il token API di Replicate sia configurato. Verifica che REPLICATE_API_TOKEN sia impostato correttamente nelle variabili d'ambiente."}
            </AlertDescription>
          </Alert>
        )}
        
        {klingErrorMessage && klingApiAvailable !== false && (
          <Alert className="mb-6 bg-amber-900/20 border-amber-800">
            <Info className="h-4 w-4" />
            <AlertTitle>Informazione</AlertTitle>
            <AlertDescription>
              {klingErrorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline delle scene */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-md font-medium">Scenes</h2>
                <div className="bg-black/30 text-xs px-2 py-0.5 rounded-full">
                  {sceneCount}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                  onClick={() => setSceneCount(Math.max(1, sceneCount - 1))}
                >
                  <Trash2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                  onClick={() => setSceneCount(Math.min(16, sceneCount + 1))}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 pr-1 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                    activeSceneId === scene.id
                      ? 'bg-orange-900/30 border border-orange-700/50'
                      : 'hover:bg-black/30'
                  }`}
                  onClick={() => setActiveSceneId(scene.id)}
                >
                  <div className="w-14 h-14 rounded-md bg-black/40 flex items-center justify-center overflow-hidden relative">
                    {scene.status === 'generating' ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-orange-500"></div>
                    ) : scene.imageUrl ? (
                      <img src={scene.imageUrl} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-medium text-orange-500/50">
                        {index + 1}
                      </span>
                    )}
                    
                    {scene.status === 'error' && (
                      <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-300" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">Scene {index + 1}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {scene.prompt ? scene.prompt.substring(0, 25) + '...' : 'No description yet'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Generate All Button */}
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              disabled={isGeneratingAll || klingApiAvailable === false}
              onClick={generateAllImages}
            >
              {isGeneratingAll ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate All Scenes
                </>
              )}
            </Button>
          </div>
          
          {/* Editor della scena attiva */}
          <div className="lg:col-span-9">
            {activeScene ? (
              <div className="space-y-6">
                <Tabs defaultValue="prompt" onValueChange={(value) => setEditorMode(value as 'prompt' | 'settings')}>
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="prompt">Prompt</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    
                    {editorMode === 'prompt' && (
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                        disabled={
                          !activeScene.prompt || 
                          activeScene.prompt.length < 10 || 
                          activeScene.status === 'generating' ||
                          klingApiAvailable === false
                        }
                        onClick={() => generateSceneImage(activeScene.id)}
                      >
                        {activeScene.status === 'generating' ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate Image
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <TabsContent value="prompt" className="space-y-4">
                    <div>
                      <Label htmlFor="prompt" className="text-sm text-gray-400">Scene Description</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Describe what should happen in this scene... (min. 10 characters)"
                        className="h-32 resize-none bg-black/20 border-gray-700"
                        value={activeScene.prompt}
                        onChange={(e) => handleUpdatePrompt(e.target.value)}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500">
                          Be detailed and specific about what should be in the scene
                        </span>
                        <span className={`${activeScene.prompt.length < 10 ? 'text-red-400' : 'text-gray-500'}`}>
                          {activeScene.prompt.length}/500
                        </span>
                      </div>
                    </div>
                    
                    <div className="aspect-video w-full bg-black/40 rounded-md overflow-hidden border border-gray-800/30 flex items-center justify-center">
                      {activeScene.status === 'generating' ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-gray-400">Generating image...</p>
                        </div>
                      ) : activeScene.imageUrl ? (
                        <img 
                          src={activeScene.imageUrl} 
                          alt={`Generated scene ${activeScene.id.split('-')[1]}`} 
                          className="w-full h-full object-contain"
                        />
                      ) : activeScene.status === 'error' ? (
                        <div className="text-center text-red-400 p-4">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                          <p className="font-medium">Generation Error</p>
                          <p className="text-sm">{activeScene.error || 'An error occurred'}</p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <Layout className="h-16 w-16 mx-auto mb-2 opacity-20" />
                          <p>No image generated yet</p>
                          <p className="text-xs mt-1">Add a description and click "Generate Image"</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {['16:9', '4:3', '1:1', '9:16', '3:4'].map(ratio => (
                              <Button
                                key={ratio}
                                type="button"
                                variant="outline"
                                size="sm"
                                className={`${
                                  boardSettings.aspectRatio === ratio
                                    ? 'bg-orange-900/30 border-orange-500/50 text-orange-400'
                                    : 'bg-black/20 hover:bg-orange-900/10'
                                }`}
                                onClick={() => setBoardSettings(prev => ({ ...prev, aspectRatio: ratio }))}
                              >
                                {ratio}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="stylePrompt">Style Prompts (appended to all scenes)</Label>
                          <Textarea
                            id="stylePrompt"
                            placeholder="cinematic, professional lighting, high detail..."
                            className="h-24 resize-none bg-black/20 border-gray-700"
                            value={boardSettings.stylePrompt}
                            onChange={(e) => setBoardSettings(prev => ({ ...prev, stylePrompt: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="negativePrompt">Negative Prompt (elements to avoid)</Label>
                          <Textarea
                            id="negativePrompt"
                            placeholder="bad quality, blurry, distorted..."
                            className="h-24 resize-none bg-black/20 border-gray-700"
                            value={boardSettings.negativePrompt}
                            onChange={(e) => setBoardSettings(prev => ({ ...prev, negativePrompt: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="seed">Seed (optional, for consistency)</Label>
                          <Input
                            id="seed"
                            type="number"
                            placeholder="Random seed if empty"
                            className="bg-black/20 border-gray-700"
                            value={boardSettings.seed}
                            onChange={(e) => setBoardSettings(prev => ({ ...prev, seed: e.target.value }))}
                          />
                          <p className="text-xs text-gray-500">Use the same seed across scenes for consistent style</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Layout size={48} className="mb-4 opacity-20" />
                <p>No scene selected</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="mt-8 flex justify-end">
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Storyboard
          </Button>
        </div>
      </ModuleContent>
    </BackgroundAnimation>
  );
};

export default BoardPage;