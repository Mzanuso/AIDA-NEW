import React, { useState } from 'react';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import ModuleNavigation from '@/components/ui/ModuleNavigation';
import ModuleContent from '@/components/ui/ModuleContent';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Trash2, PencilLine, Save, MicVocal, Settings, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  personalityTraits: string[];
  voiceStyle?: string;
  avatarUrl?: string;
}

const CastPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      role: 'Protagonist',
      description: 'A tech entrepreneur with a vision to change the world.',
      personalityTraits: ['ambitious', 'innovative', 'determined'],
      voiceStyle: 'confident',
      avatarUrl: 'https://dummyimage.com/100x100/4a4a4a/ffffff&text=AJ'
    },
    {
      id: '2',
      name: 'Dr. Sarah Chen',
      role: 'Expert',
      description: 'Leading researcher in the field with over 15 years of experience.',
      personalityTraits: ['analytical', 'precise', 'authoritative'],
      voiceStyle: 'professional',
      avatarUrl: 'https://dummyimage.com/100x100/4a4a4a/ffffff&text=SC'
    }
  ]);
  
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>('1');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Ottenere il personaggio attualmente selezionato
  const activeCharacter = activeCharacterId ? characters.find(c => c.id === activeCharacterId) : null;
  
  // Iniziare la modifica di un personaggio
  const handleEditCharacter = () => {
    if (activeCharacter) {
      setEditingCharacter({...activeCharacter});
      setIsEditing(true);
    }
  };
  
  // Salvare le modifiche a un personaggio
  const handleSaveCharacter = () => {
    if (editingCharacter) {
      if (editingCharacter.id) {
        // Aggiornamento personaggio esistente
        setCharacters(prev => prev.map(c => 
          c.id === editingCharacter.id ? editingCharacter : c
        ));
      } else {
        // Creazione nuovo personaggio
        const newCharacter = {
          ...editingCharacter,
          id: Date.now().toString()
        };
        setCharacters(prev => [...prev, newCharacter]);
        setActiveCharacterId(newCharacter.id);
      }
      setIsEditing(false);
      setEditingCharacter(null);
    }
  };
  
  // Cancellare un personaggio
  const handleDeleteCharacter = () => {
    if (activeCharacterId) {
      setCharacters(prev => prev.filter(c => c.id !== activeCharacterId));
      setActiveCharacterId(characters.length > 1 ? characters[0].id : null);
    }
  };
  
  // Creare un nuovo personaggio
  const handleCreateCharacter = () => {
    const newCharacter: Character = {
      id: '',
      name: 'New Character',
      role: 'Supporting',
      description: '',
      personalityTraits: [],
    };
    setEditingCharacter(newCharacter);
    setIsEditing(true);
  };
  
  // Generare un personaggio con AI
  const handleGenerateCharacter = async () => {
    setIsGenerating(true);
    try {
      // Simuliamo l'elaborazione
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock di un personaggio generato
      const generatedCharacter: Character = {
        id: '',
        name: 'Jamie Rivera',
        role: 'Customer',
        description: 'A professional in their mid-30s who represents the target audience for the product. They face daily challenges that the product aims to solve.',
        personalityTraits: ['practical', 'busy', 'tech-savvy'],
        voiceStyle: 'conversational'
      };
      
      setEditingCharacter(generatedCharacter);
      setIsEditing(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <BackgroundAnimation color="green">
      <ModuleNavigation currentModule="cast" />
      <ModuleContent color="green">
        <div className="flex items-center gap-3 mb-6">
          <Users size={24} className="text-green-400" />
          <h1 className="text-2xl font-light">Character Settings</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Lista personaggi */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-medium">Characters</h2>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                  onClick={handleCreateCharacter}
                >
                  <UserPlus size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                  onClick={handleGenerateCharacter}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {characters.map(character => (
                <div 
                  key={character.id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${activeCharacterId === character.id ? 'bg-green-900/30 border border-green-700/50' : 'hover:bg-black/30'}`}
                  onClick={() => setActiveCharacterId(character.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-green-800/50 flex items-center justify-center overflow-hidden">
                    {character.avatarUrl ? (
                      <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium">
                        {character.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{character.name}</div>
                    <div className="text-xs text-gray-400 truncate">{character.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Content - Dettagli personaggio */}
          <div className="lg:col-span-9 bg-black/20 rounded-xl overflow-hidden border border-white/5 p-4">
            {isEditing ? (
              /* Form di modifica */
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">{editingCharacter?.id ? 'Edit Character' : 'New Character'}</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditingCharacter(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSaveCharacter}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Character
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Character Name</Label>
                      <Input 
                        id="name"
                        value={editingCharacter?.name || ''}
                        onChange={(e) => setEditingCharacter(prev => prev ? {...prev, name: e.target.value} : null)}
                        className="bg-black/30 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={editingCharacter?.role}
                        onValueChange={(value) => setEditingCharacter(prev => prev ? {...prev, role: value} : null)}
                      >
                        <SelectTrigger className="bg-black/30 border-gray-700">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Protagonist">Protagonist</SelectItem>
                          <SelectItem value="Supporting">Supporting</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                          <SelectItem value="Customer">Customer</SelectItem>
                          <SelectItem value="Narrator">Narrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="voiceStyle">Voice Style</Label>
                      <Select 
                        value={editingCharacter?.voiceStyle}
                        onValueChange={(value) => setEditingCharacter(prev => prev ? {...prev, voiceStyle: value} : null)}
                      >
                        <SelectTrigger className="bg-black/30 border-gray-700">
                          <SelectValue placeholder="Select voice style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confident">Confident</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description"
                        value={editingCharacter?.description || ''}
                        onChange={(e) => setEditingCharacter(prev => prev ? {...prev, description: e.target.value} : null)}
                        className="bg-black/30 border-gray-700 h-32 resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="traits">Personality Traits (comma separated)</Label>
                      <Input
                        id="traits"
                        value={editingCharacter?.personalityTraits.join(', ') || ''}
                        onChange={(e) => setEditingCharacter(prev => prev ? {
                          ...prev, 
                          personalityTraits: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        } : null)}
                        className="bg-black/30 border-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Visualizzazione dettagli */
              activeCharacter ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-800/50 flex items-center justify-center overflow-hidden">
                        {activeCharacter.avatarUrl ? (
                          <img src={activeCharacter.avatarUrl} alt={activeCharacter.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-medium">
                            {activeCharacter.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-medium">{activeCharacter.name}</h2>
                        <div className="text-sm text-gray-400">{activeCharacter.role}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50"
                        onClick={handleDeleteCharacter}
                      >
                        <Trash2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50"
                        onClick={handleEditCharacter}
                      >
                        <PencilLine size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="profile">
                    <TabsList>
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="voice">Voice</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile" className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-400">Description</h3>
                        <p className="text-md">{activeCharacter.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-400">Personality Traits</h3>
                        <div className="flex flex-wrap gap-2">
                          {activeCharacter.personalityTraits.map(trait => (
                            <span 
                              key={trait} 
                              className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="voice" className="space-y-6 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MicVocal size={18} className="text-green-400" />
                          <h3 className="text-md font-medium">Voice Style: <span className="text-green-400">{activeCharacter.voiceStyle}</span></h3>
                        </div>
                        
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Settings size={14} />
                          Customize Voice
                        </Button>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4 border border-gray-800/50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-400">Voice Sample</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs bg-green-900/20 text-green-400 hover:bg-green-900/40 hover:text-green-300"
                          >
                            <span>Generate Sample</span>
                          </Button>
                        </div>
                        
                        <div className="h-20 flex items-center justify-center border border-dashed border-gray-700 rounded-md">
                          <span className="text-gray-500 text-sm">Voice sample will appear here</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p>No character selected</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                    onClick={handleCreateCharacter}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Create Character
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </ModuleContent>
    </BackgroundAnimation>
  );
};

export default CastPage;