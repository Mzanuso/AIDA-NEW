import React, { useState } from 'react';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import ModuleNavigation from '@/components/ui/ModuleNavigation';
import ModuleContent from '@/components/ui/ModuleContent';
import { Button } from '@/components/ui/button';
import { 
  BookText, 
  Sparkles, 
  Save, 
  ThumbsUp, 
  ThumbsDown, 
  Plus,
  RotateCcw
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface StoryIdea {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  approach: 'emotional' | 'factual' | 'narrative' | 'persuasive';
  liked?: boolean;
}

const StoryPage: React.FC = () => {
  const [storyBrief, setStoryBrief] = useState<string>('');
  const [storyIdeas, setStoryIdeas] = useState<StoryIdea[]>([
    {
      id: '1',
      title: "Transformazione Digitale nel Mondo Moderno",
      content: "Il video inizia con una serie di scene che mostrano la rapida evoluzione della tecnologia negli ultimi decenni. Vediamo come le aziende che hanno abbracciato la trasformazione digitale hanno prosperato, mentre quelle che hanno resistito al cambiamento hanno faticato. Il messaggio principale è che la trasformazione digitale non è solo un'opzione, ma una necessità per la sopravvivenza e la crescita nel panorama aziendale contemporaneo.",
      keyPoints: [
        "Evoluzione della tecnologia negli ultimi decenni",
        "Contrasto tra aziende digitalmente trasformate e tradizionali",
        "Vantaggi competitivi dell'adozione della tecnologia"
      ],
      approach: 'factual'
    },
    {
      id: '2',
      title: "Il Viaggio dell'Innovazione",
      content: "La storia segue il percorso di un'azienda immaginaria che parte dalle umili origini di start-up fino a diventare leader di mercato grazie all'adozione di tecnologie innovative. Attraverso le sfide e i trionfi di questa azienda, il pubblico viene guidato attraverso le fasi della trasformazione digitale, creando un coinvolgente arco narrativo che rispecchia il potenziale viaggio di qualsiasi organizzazione verso l'innovazione.",
      keyPoints: [
        "Viaggio della start-up verso il successo",
        "Sfide superate attraverso l'innovazione",
        "Lezioni apprese applicabili a qualsiasi organizzazione"
      ],
      approach: 'narrative'
    }
  ]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>('1');
  const [targetAudience, setTargetAudience] = useState<string>('business');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Ottenere l'idea selezionata
  const selectedIdea = selectedIdeaId ? storyIdeas.find(idea => idea.id === selectedIdeaId) : null;
  
  // Generare nuove idee di storia
  const handleGenerateIdeas = async () => {
    if (!storyBrief || storyBrief.length < 10) {
      alert('Please provide a brief description of your story (at least 10 characters)');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Simuliamo il tempo di elaborazione
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock di nuove idee generate
      const newIdeas: StoryIdea[] = [
        {
          id: Date.now().toString(),
          title: "Innovazione al Servizio delle Persone",
          content: "Questo video narrerà di come la tecnologia, quando implementata correttamente, possa migliorare significativamente la vita quotidiana delle persone. Attraverso esempi reali di aziende che hanno messo l'esperienza umana al centro dei loro processi di trasformazione digitale, esploreremo come l'innovazione tecnologica possa creare valore non solo economico, ma anche sociale e personale.",
          keyPoints: [
            "Impatto umano della trasformazione digitale",
            "Casi studio di implementazioni centrate sull'utente",
            "Equilibrio tra efficienza tecnologica e bisogni umani"
          ],
          approach: 'emotional'
        },
        {
          id: (Date.now() + 1).toString(),
          title: "Tecnologia come Acceleratore di Business",
          content: "Il video presenterà un'analisi dettagliata di come specifiche tecnologie digitali possono accelerare diversi aspetti del business. Dall'automazione che riduce i costi operativi, all'intelligenza artificiale che migliora il servizio clienti, fino al cloud computing che aumenta la scalabilità. Ogni segmento includerà dati concreti e metriche per dimostrare il ROI dell'implementazione tecnologica.",
          keyPoints: [
            "Analisi dei benefici quantificabili delle tecnologie digitali",
            "Metriche di ROI per diversi tipi di implementazioni",
            "Strategie pratiche per l'integrazione tecnologica"
          ],
          approach: 'persuasive'
        }
      ];
      
      setStoryIdeas(prev => [...newIdeas, ...prev]);
      setSelectedIdeaId(newIdeas[0].id);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Gestire il "like" di un'idea
  const handleLikeIdea = (ideaId: string, liked: boolean) => {
    setStoryIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, liked } : idea
    ));
  };

  return (
    <BackgroundAnimation color="purple">
      <ModuleNavigation currentModule="story" />
      <ModuleContent color="purple">
        <div className="flex items-center gap-3 mb-6">
          <BookText size={24} className="text-purple-400" />
          <h1 className="text-2xl font-light">Story Creator</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonna sinistra - Input e generazione */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-black/20 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Story Brief</CardTitle>
                <CardDescription>Describe what your story should be about</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Textarea
                  placeholder="Describe your story idea, theme, or message..."
                  className="min-h-[120px] resize-none bg-black/30 border-gray-700"
                  value={storyBrief}
                  onChange={(e) => setStoryBrief(e.target.value)}
                />
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <Label className="text-sm text-gray-400">Target Audience</Label>
              <RadioGroup defaultValue="business" value={targetAudience} onValueChange={setTargetAudience}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Business</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consumer" id="consumer" />
                    <Label htmlFor="consumer">Consumer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="technical" id="technical" />
                    <Label htmlFor="technical">Technical</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="educational" id="educational" />
                    <Label htmlFor="educational">Educational</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 mt-2"
              disabled={isGenerating || !storyBrief || storyBrief.length < 10}
              onClick={handleGenerateIdeas}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Story Ideas
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                disabled={!selectedIdea}
              >
                <Plus className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
            </div>
          </div>
          
          {/* Colonna destra - Visualizzazione idee */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs defaultValue="ideas">
              <TabsList className="mb-4">
                <TabsTrigger value="ideas">Generated Ideas</TabsTrigger>
                <TabsTrigger value="editor">Story Editor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ideas" className="space-y-6">
                {storyIdeas.length > 0 ? (
                  storyIdeas.map(idea => (
                    <Card 
                      key={idea.id} 
                      className={`cursor-pointer transition-all duration-200 hover:border-purple-500/50 ${
                        selectedIdeaId === idea.id 
                          ? 'bg-black/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                          : 'bg-black/20 border-gray-800'
                      }`}
                      onClick={() => setSelectedIdeaId(idea.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">{idea.title}</CardTitle>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-7 w-7 ${
                                idea.liked === true ? 'text-green-500' : 'text-gray-500 hover:text-gray-400'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeIdea(idea.id, true);
                              }}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-7 w-7 ${
                                idea.liked === false ? 'text-red-500' : 'text-gray-500 hover:text-gray-400'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeIdea(idea.id, false);
                              }}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-900/60 text-purple-300 uppercase">
                            {idea.approach}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm">{idea.content}</p>
                        
                        <div className="mt-4">
                          <h4 className="text-xs text-gray-400 mb-2">Key Points:</h4>
                          <ul className="list-disc pl-4 text-sm space-y-1">
                            {idea.keyPoints.map((point, index) => (
                              <li key={index} className="text-gray-300">{point}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs bg-purple-900/20 text-purple-400 hover:bg-purple-900/40 hover:text-purple-300 border-purple-800/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Feature coming soon: Story Editor with this idea');
                          }}
                        >
                          Edit This Story
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-64 text-gray-500">
                    <BookText size={48} className="mb-4 opacity-20" />
                    <p className="mb-2">No story ideas generated yet</p>
                    <p className="text-sm">Fill in the story brief and click 'Generate Story Ideas'</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="editor">
                {selectedIdea ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-medium">{selectedIdea.title}</h2>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Story
                      </Button>
                    </div>
                    
                    <Separator className="bg-gray-800" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-400">Story Outline</h3>
                        <Textarea
                          value={selectedIdea.content}
                          onChange={() => {}} // In una versione reale, aggiorneremmo lo stato
                          className="min-h-[200px] resize-none bg-black/30 border-gray-700"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-400">Key Points</h3>
                        {selectedIdea.keyPoints.map((point, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <div className="w-6 h-6 rounded-full bg-purple-900/60 flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <input
                              type="text"
                              value={point}
                              onChange={() => {}} // In una versione reale, aggiorneremmo lo stato
                              className="flex-1 bg-black/30 border border-gray-700 rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                        ))}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2 mt-2"
                        >
                          <Plus className="h-3 w-3" />
                          Add Key Point
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-64 text-gray-500">
                    <BookText size={48} className="mb-4 opacity-20" />
                    <p className="mb-2">No story selected</p>
                    <p className="text-sm">Generate or select a story idea first</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ModuleContent>
    </BackgroundAnimation>
  );
};

export default StoryPage;