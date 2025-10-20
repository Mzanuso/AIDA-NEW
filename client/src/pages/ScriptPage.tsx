import React, { useState } from 'react';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import ModuleNavigation from '@/components/ui/ModuleNavigation';
import ModuleContent from '@/components/ui/ModuleContent';
import { Button } from '@/components/ui/button';
import { 
  BookText, 
  MicVocal, 
  SlidersHorizontal, 
  ListFilter, 
  Save,
  Sparkles
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const ScriptPage: React.FC = () => {
  const [voiceStyle, setVoiceStyle] = useState<string>('narrative');
  const [scriptStructure, setScriptStructure] = useState<string>('intro-body-conclusion');
  const [scriptText, setScriptText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Gestione generazione script con AI
  const handleGenerateScript = async () => {
    setIsGenerating(true);
    try {
      // Simuliamo il tempo di generazione
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock di risposta dall'AI
      const generatedText = `# Introduction\n
Welcome to our product showcase. Today, we're excited to introduce you to a revolutionary new way of thinking about everyday problems.\n
# Main Points\n
Our innovative solution addresses three key challenges:\n
1. Time management in the digital age
2. Streamlining complex workflows
3. Delivering measurable results\n
# Conclusion\n
By incorporating our approach into your daily routine, you'll experience increased productivity and reduced stress. Take the first step today.`;
      
      setScriptText(generatedText);
    } catch (error) {
      console.error('Error generating script:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <BackgroundAnimation color="red">
      <ModuleNavigation currentModule="script" />
      <ModuleContent color="red">
        <div className="flex items-center gap-3 mb-6">
          <BookText size={24} className="text-red-400" />
          <h1 className="text-2xl font-light">Script Settings</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna sinistra - Opzioni */}
          <div className="lg:col-span-1 space-y-8">
            {/* Opzioni di stile vocale */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <MicVocal size={16} className="text-red-400" />
                <span>Voice Style</span>
              </h3>
              <RadioGroup defaultValue="narrative" value={voiceStyle} onValueChange={setVoiceStyle}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="conversational" id="conversational" />
                    <Label htmlFor="conversational">Conversational</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional">Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="narrative" id="narrative" />
                    <Label htmlFor="narrative">Narrative</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dramatic" id="dramatic" />
                    <Label htmlFor="dramatic">Dramatic</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            {/* Opzioni di tono */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-red-400" />
                <span>Tone Adjustment</span>
              </h3>
              <div className="space-y-3 p-4 bg-black/30 rounded-md border border-gray-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Formality</span>
                  <div className="flex gap-1">
                    <div className="w-12 h-1.5 rounded-full bg-red-400"></div>
                    <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                    <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Energy</span>
                  <div className="flex gap-1">
                    <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                    <div className="w-12 h-1.5 rounded-full bg-red-400"></div>
                    <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Pacing</span>
                  <div className="flex gap-1">
                    <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                    <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                    <div className="w-12 h-1.5 rounded-full bg-red-400"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Struttura dello script */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <ListFilter size={16} className="text-red-400" />
                <span>Script Structure</span>
              </h3>
              <RadioGroup defaultValue="intro-body-conclusion" value={scriptStructure} onValueChange={setScriptStructure}>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intro-body-conclusion" id="intro-body-conclusion" />
                    <Label htmlFor="intro-body-conclusion">Introduction → Body → Conclusion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="problem-solution-call" id="problem-solution-call" />
                    <Label htmlFor="problem-solution-call">Problem → Solution → Call to Action</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hook-story-offer" id="hook-story-offer" />
                    <Label htmlFor="hook-story-offer">Hook → Story → Offer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom Structure</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            {/* Pulsante di generazione */}
            <Button 
              className="w-full bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600"
              disabled={isGenerating}
              onClick={handleGenerateScript}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Script
                </>
              )}
            </Button>
          </div>
          
          {/* Colonna destra - Editor script */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="editor">
              <TabsList className="mb-4">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="space-y-4">
                <Textarea 
                  placeholder="Write or generate your script here..."
                  className="min-h-[400px] resize-none bg-black/20 border-gray-700 font-mono"
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                />
                
                <div className="flex justify-end">
                  <Button variant="outline" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Script
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="border border-gray-800 rounded-md p-4 min-h-[400px] bg-black/20">
                {scriptText ? (
                  <div className="prose prose-invert max-w-none">
                    {scriptText.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line.startsWith('#') ? (
                          <h3 className="text-red-400">{line.replace('# ', '')}</h3>
                        ) : line.match(/^\d\./) ? (
                          <div className="pl-4">{line}</div>
                        ) : (
                          <p>{line}</p>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Your script preview will appear here</div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ModuleContent>
    </BackgroundAnimation>
  );
};

export default ScriptPage;