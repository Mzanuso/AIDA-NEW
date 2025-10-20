import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Image as ImageIcon, RefreshCw, ZoomIn, Copy, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Definizione dei tipi
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

interface TaskResult {
  image_url?: string;
  progress?: string;
  status: TaskStatus;
  task_id: string;
  estimated_completion_time?: string;
}

interface GenerationTask {
  id: string;
  prompt: string;
  styleRef?: string;
  status: TaskStatus;
  result?: TaskResult;
  createdAt: Date;
  pollingInterval?: number;
}

export default function MidjourneyTester() {
  // Stati del componente
  const [prompt, setPrompt] = useState('');
  const [styleRef, setStyleRef] = useState('');
  const [processMode, setProcessMode] = useState('fast');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [apiConfig, setApiConfig] = useState<any>(null);
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const { toast } = useToast();

  // Caricamento della configurazione API all'avvio
  useEffect(() => {
    async function loadApiConfig() {
      try {
        const response = await fetch('/api/ai-image/config');
        if (response.ok) {
          const config = await response.json();
          setApiConfig(config);
          setIsConfigLoaded(true);
        } else {
          toast({
            title: 'Errore',
            description: 'Impossibile caricare la configurazione del servizio',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Errore nel caricamento della configurazione:', error);
        toast({
          title: 'Errore di connessione',
          description: 'Verifica la connessione al server',
          variant: 'destructive'
        });
      }
    }

    loadApiConfig();
  }, []);

  // Polling degli stati dei task attivi
  useEffect(() => {
    // Avvia il polling solo per i task non completati
    const activeTasks = tasks.filter(task => 
      task.status !== 'completed' && task.status !== 'failed'
    );

    // Setup degli intervalli di polling per ogni task attivo
    activeTasks.forEach(task => {
      if (!task.pollingInterval) {
        const intervalId = window.setInterval(() => {
          checkTaskStatus(task.id);
        }, 5000); // Controlla ogni 5 secondi

        // Aggiorna il task con l'ID dell'intervallo
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id ? { ...t, pollingInterval: intervalId } : t
          )
        );
      }
    });

    // Cleanup degli intervalli quando il componente viene smontato
    return () => {
      activeTasks.forEach(task => {
        if (task.pollingInterval) {
          clearInterval(task.pollingInterval);
        }
      });
    };
  }, [tasks]);

  // Verifica lo stato di un task
  async function checkTaskStatus(taskId: string) {
    try {
      const response = await fetch(`/api/ai-image/tasks/${taskId}`);
      
      if (!response.ok) {
        throw new Error('Errore nel recupero dello stato del task');
      }
      
      const data = await response.json();
      
      // Aggiorna lo stato del task
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            // Se il task è completato, interrompi il polling
            if (data.status === 'completed' || data.status === 'failed') {
              if (task.pollingInterval) {
                clearInterval(task.pollingInterval);
              }
              
              // Notifica di completamento
              if (data.status === 'completed') {
                toast({
                  title: 'Immagine generata',
                  description: 'La generazione è stata completata con successo',
                });
              } else if (data.status === 'failed') {
                toast({
                  title: 'Generazione fallita',
                  description: 'Si è verificato un errore durante la generazione',
                  variant: 'destructive'
                });
              }
            }
            
            return { 
              ...task, 
              status: data.status, 
              result: data,
              pollingInterval: (data.status === 'completed' || data.status === 'failed') ? undefined : task.pollingInterval
            };
          }
          return task;
        })
      );
      
    } catch (error) {
      console.error('Errore durante il controllo dello stato:', error);
    }
  }

  // Genera una nuova immagine
  async function generateImage() {
    if (!prompt) {
      toast({
        title: 'Prompt mancante',
        description: 'Inserisci un prompt testuale per generare un\'immagine',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai-image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          styleRef: styleRef || undefined,
          processMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nella generazione dell\'immagine');
      }

      const data = await response.json();
      
      // Crea un nuovo task
      const newTask: GenerationTask = {
        id: data.task_id,
        prompt,
        styleRef: styleRef || undefined,
        status: data.status || 'pending',
        result: data,
        createdAt: new Date()
      };
      
      // Aggiungi il task alla lista e imposta come attivo
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setActiveTaskId(newTask.id);
      
      toast({
        title: 'Generazione avviata',
        description: 'La richiesta è stata inviata con successo'
      });
      
    } catch (error) {
      console.error('Errore nella generazione:', error);
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Si è verificato un errore imprevisto',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  }

  // Upscale di un'immagine
  async function upscaleImage(taskId: string, index: number) {
    try {
      const response = await fetch('/api/ai-image/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId, index })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nell\'upscale dell\'immagine');
      }

      const data = await response.json();
      
      // Crea un nuovo task per l'upscale
      const originalTask = tasks.find(task => task.id === taskId);
      
      if (!originalTask) return;
      
      const newTask: GenerationTask = {
        id: data.task_id,
        prompt: `Upscale di "${originalTask.prompt.substring(0, 30)}${originalTask.prompt.length > 30 ? '...' : ''}" (indice: ${index})`,
        status: data.status || 'pending',
        result: data,
        createdAt: new Date()
      };
      
      // Aggiungi il task alla lista e imposta come attivo
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setActiveTaskId(newTask.id);
      
      toast({
        title: 'Upscale avviato',
        description: 'La richiesta è stata inviata con successo'
      });
      
    } catch (error) {
      console.error('Errore nell\'upscale:', error);
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Si è verificato un errore imprevisto',
        variant: 'destructive'
      });
    }
  }

  // Genera variazioni di un'immagine
  async function generateVariations(taskId: string, index: number) {
    try {
      const response = await fetch('/api/ai-image/variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId, index })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nella generazione delle variazioni');
      }

      const data = await response.json();
      
      // Crea un nuovo task per le variazioni
      const originalTask = tasks.find(task => task.id === taskId);
      
      if (!originalTask) return;
      
      const newTask: GenerationTask = {
        id: data.task_id,
        prompt: `Variazioni di "${originalTask.prompt.substring(0, 30)}${originalTask.prompt.length > 30 ? '...' : ''}" (indice: ${index})`,
        status: data.status || 'pending',
        result: data,
        createdAt: new Date()
      };
      
      // Aggiungi il task alla lista e imposta come attivo
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setActiveTaskId(newTask.id);
      
      toast({
        title: 'Generazione variazioni avviata',
        description: 'La richiesta è stata inviata con successo'
      });
      
    } catch (error) {
      console.error('Errore nella generazione delle variazioni:', error);
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Si è verificato un errore imprevisto',
        variant: 'destructive'
      });
    }
  }

  // Copia l'URL dell'immagine negli appunti
  function copyImageUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(url);
      setTimeout(() => setCopySuccess(null), 2000);
      
      toast({
        title: 'URL copiato',
        description: 'L\'URL dell\'immagine è stato copiato negli appunti'
      });
    }).catch(err => {
      console.error('Errore nella copia negli appunti:', err);
      toast({
        title: 'Errore',
        description: 'Impossibile copiare l\'URL negli appunti',
        variant: 'destructive'
      });
    });
  }

  // Formatta la data
  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }

  // Calcola il tempo stimato rimanente
  function calculateRemainingTime(task: GenerationTask) {
    if (!task.result?.estimated_completion_time) return 'Sconosciuto';
    
    const estimatedTime = new Date(task.result.estimated_completion_time);
    const now = new Date();
    
    if (estimatedTime <= now) return 'In completamento...';
    
    const diffMs = estimatedTime.getTime() - now.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs} secondi`;
    return `${Math.floor(diffSecs / 60)} minuti e ${diffSecs % 60} secondi`;
  }

  // Ottiene la descrizione dello stato
  function getStatusDescription(status: TaskStatus) {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'in-progress': return 'In elaborazione';
      case 'completed': return 'Completato';
      case 'failed': return 'Fallito';
      default: return 'Sconosciuto';
    }
  }

  // Ottiene il colore del badge in base allo stato
  function getStatusColor(status: TaskStatus) {
    switch (status) {
      case 'pending': return 'default';
      case 'in-progress': return 'secondary';
      case 'completed': return 'success';
      case 'failed': return 'destructive';
      default: return 'default';
    }
  }

  // Stato corrente del task attivo
  const activeTask = activeTaskId ? tasks.find(task => task.id === activeTaskId) : tasks[0];

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AIDA AI Image Service - Test Midjourney</CardTitle>
          <CardDescription>
            Genera immagini con Midjourney tramite l'API GoAPI.ai
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConfigLoaded ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Caricamento configurazione...</span>
            </div>
          ) : !apiConfig?.apiKeyConfigured ? (
            <div className="bg-destructive/20 p-4 rounded-md mb-4">
              <h3 className="font-semibold text-destructive">GOAPI_API_KEY non configurata</h3>
              <p className="text-sm">
                Per utilizzare questo servizio, è necessaria una chiave API di GoAPI. 
                Configura la variabile d'ambiente GOAPI_API_KEY per continuare.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Descrivi l'immagine che desideri generare..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="styleRef">Codice SREF (opzionale)</Label>
                  <Input
                    id="styleRef"
                    placeholder="Es. 96616859"
                    value={styleRef}
                    onChange={(e) => setStyleRef(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Codice di riferimento per uno stile specifico
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="processMode">Modalità di elaborazione</Label>
                  <Select value={processMode} onValueChange={setProcessMode}>
                    <SelectTrigger id="processMode">
                      <SelectValue placeholder="Seleziona modalità" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast (Default)</SelectItem>
                      <SelectItem value="relax">Relax (Qualità maggiore)</SelectItem>
                      <SelectItem value="turbo">Turbo (Più veloce)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Determina il bilanciamento tra velocità e qualità
                  </p>
                </div>
              </div>
              
              <div className="bg-primary/10 p-3 rounded-md mb-4">
                <h3 className="text-sm font-medium">Stato servizio:</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline">{apiConfig.serviceInfo.name}</Badge>
                  <Badge variant="outline">{apiConfig.serviceInfo.provider}</Badge>
                  <Badge variant="outline">v{apiConfig.serviceInfo.version}</Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">API Key: Configurata</Badge>
                  <Badge variant="outline">Modalità: {apiConfig.serviceMode}</Badge>
                  {apiConfig.pollingRequired && (
                    <Badge variant="secondary">Polling richiesto</Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Ricarica
          </Button>
          <Button 
            onClick={generateImage} 
            disabled={isGenerating || !isConfigLoaded || !apiConfig?.apiKeyConfigured || !prompt}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generazione in corso...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Genera Immagine
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {tasks.length > 0 && (
        <Tabs defaultValue="results" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Risultati</TabsTrigger>
            <TabsTrigger value="history">Cronologia ({tasks.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Risultato</span>
                  {activeTask && (
                    <Badge variant={getStatusColor(activeTask.status) as any}>
                      {getStatusDescription(activeTask.status)}
                    </Badge>
                  )}
                </CardTitle>
                {activeTask && (
                  <CardDescription>
                    Prompt: {activeTask.prompt}
                    {activeTask.styleRef && <span className="ml-2 font-medium">(Style: {activeTask.styleRef})</span>}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                {!activeTask ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nessun risultato</h3>
                    <p className="text-sm text-muted-foreground">
                      Genera un'immagine per vedere i risultati qui
                    </p>
                  </div>
                ) : activeTask.status === 'pending' || activeTask.status === 'in-progress' ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium">Generazione in corso</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tempo stimato: {calculateRemainingTime(activeTask)}
                    </p>
                    {activeTask.result?.progress && (
                      <Badge variant="secondary" className="text-xs">
                        Progresso: {activeTask.result.progress}
                      </Badge>
                    )}
                  </div>
                ) : activeTask.status === 'failed' ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center bg-destructive/10 rounded-md">
                    <h3 className="text-lg font-medium text-destructive">Generazione fallita</h3>
                    <p className="text-sm text-muted-foreground">
                      Si è verificato un errore durante la generazione
                    </p>
                  </div>
                ) : activeTask.result?.image_url ? (
                  <div className="flex flex-col items-center">
                    <div className="relative bg-primary/5 p-1 rounded-md mb-4 max-w-full">
                      <img 
                        src={activeTask.result.image_url} 
                        alt={activeTask.prompt} 
                        className="max-w-full rounded" 
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                        onClick={() => copyImageUrl(activeTask.result!.image_url!)}
                      >
                        {copySuccess === activeTask.result.image_url ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copia URL
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 w-full mt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => upscaleImage(activeTask.id, 0)}
                      >
                        <ZoomIn className="mr-2 h-4 w-4" />
                        Upscale
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => generateVariations(activeTask.id, 0)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Variazioni
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-primary/10 p-4 rounded-md">
                    <p className="text-sm">
                      Task completato ma nessuna immagine disponibile.
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="text-xs text-muted-foreground">
                {activeTask && (
                  <div className="w-full flex justify-between">
                    <span>ID: {activeTask.id}</span>
                    <span>Creato: {formatDate(activeTask.createdAt)}</span>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Cronologia generazioni</CardTitle>
                <CardDescription>
                  Lista delle generazioni effettuate in questa sessione
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {tasks.map((task, index) => (
                    <AccordionItem key={task.id} value={task.id}>
                      <AccordionTrigger className="hover:bg-primary/5 px-2 rounded-md">
                        <div className="flex items-center justify-between w-full text-left mr-4">
                          <div className="flex items-center">
                            <Badge variant={getStatusColor(task.status) as any} className="mr-2">
                              {getStatusDescription(task.status)}
                            </Badge>
                            <span className="text-sm font-medium truncate max-w-[250px]">
                              {task.prompt}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground hidden md:inline">
                            {formatDate(task.createdAt)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent>
                        <div className="pt-2 pb-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs">ID: {task.id}</span>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-xs p-0 h-auto"
                              onClick={() => setActiveTaskId(task.id)}
                            >
                              Visualizza dettagli
                            </Button>
                          </div>
                          
                          <Separator />
                          
                          {task.result?.image_url && (
                            <div className="relative bg-primary/5 p-1 rounded-md">
                              <img 
                                src={task.result.image_url} 
                                alt={task.prompt} 
                                className="max-w-full rounded h-auto max-h-40 object-contain mx-auto" 
                              />
                            </div>
                          )}
                          
                          {task.status === 'pending' || task.status === 'in-progress' ? (
                            <div className="flex items-center justify-center p-4 text-center">
                              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                              <span className="text-sm">
                                Tempo stimato: {calculateRemainingTime(task)}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}