import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
// @ts-ignore
import SpeechRecognition from 'web-speech-cognitive-services/lib/SpeechRecognition';
import { 
  Bookmark, Paperclip, Video, Image, User, ArrowRight, SlidersHorizontal, BookText, 
  Brush, Users, Layout, BookOpen, Clock, X, Sliders, Sparkles, Type, MessageSquare,
  Palette, Layers, Wand2, Film, ListFilter, Figma, Settings, CreditCard, Brain, 
  LogOut, Folder, Coins, Loader2, Eye, FolderOpen, FileType, ChevronDown, Bell,
  AlignLeft, TrendingUp, FileSearch, Play, Pause, Star, MicVocal, Camera, Send, Mic,
  UserCircle
} from 'lucide-react';
import NewAidaLogoAnimation from '@/components/ui/NewAidaLogoAnimation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModuleType } from '@/types/moduleTypes';
import { TemplateData } from '@/types/templateTypes';
import ModuleCard from '@/components/hub/ModuleCard';
import TemplateCard from '@/components/hub/TemplateCard';
import ProjectCard from '@/components/hub/ProjectCard';
import StyleSelectorModal from '@/components/style/StyleSelectorModal';
import { mockTemplates } from '@/data/mockTemplates';
import { mockModules } from '@/data/mockModules';

interface Project {
  id: number;
  title: string;
  type: string;
  subtype?: string;
  status?: string;
  format?: {
    aspectRatio?: string;
  };
  target?: {
    duration?: number;
    platform?: string[];
  };
  thumbnailUrl?: string;
  updatedAt?: string;
};

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'aida';
  timestamp: Date;
  attachments?: {
    type: 'image' | 'text' | 'audio' | 'video' | 'file';
    url?: string;
    content?: string;
    file?: File;
    audioBlob?: Blob;
    duration?: number;
    isPlaying?: boolean;
    name?: string;
  }[];
};

interface LaunchpadProps {
  userId?: number;
  onCreateProject?: (templateId?: string) => void;
  onContinueProject?: (projectId: number) => void;
  onDuplicateProject?: (projectId: number) => void;
  onDeleteProject?: (projectId: number) => void;
  onModuleSelect?: (moduleType: ModuleType, projectId?: number) => void;
}

// Variants per animazioni
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

// Helper function per convertire le fasi Creative Agency in numeri
const getPhaseNumber = (phase: string): number => {
  switch (phase) {
    case 'briefing': return 1;
    case 'concept': return 2;
    case 'storyboard': return 3;
    case 'production': return 4;
    default: return 1;
  }
};

// Helper function per ottenere il nome della fase
const getPhaseName = (phase: string): string => {
  switch (phase) {
    case 'briefing': return 'Briefing';
    case 'concept': return 'Concept';
    case 'storyboard': return 'Storyboard';
    case 'production': return 'Production';
    default: return 'Briefing';
  }
};

const Launchpad: React.FC<LaunchpadProps> = ({
  userId,
  onCreateProject,
  onContinueProject,
  onDuplicateProject,
  onDeleteProject,
  onModuleSelect
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'library' | 'template'>('video');
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateData[]>(mockTemplates);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string>('');
  // Stato per tracciare se il campo input è vuoto o pieno
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [resolution, setResolution] = useState<string>('720p');
  const [duration, setDuration] = useState<string>('30');
  const [activeSettingsPanel, setActiveSettingsPanel] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Stati per Creative Agency System
  const [agencySessionId] = useState(() => `agency-${userId}-${Date.now()}`);
  const [agencyPhase, setAgencyPhase] = useState<string>('briefing');
  const [agencyActive, setAgencyActive] = useState<boolean>(false);
  
  // Inizializza il sistema conversazionale (nuovo orchestrator V2)
  useEffect(() => {
    const initializeAgency = async () => {
      try {
        // Nuovo sistema: non richiede inizializzazione esplicita
        // Il primo messaggio dell'utente creerà automaticamente la sessione
        setAgencyActive(true);
        setAgencyPhase('discovery');

        // Messaggio di benvenuto
        setChatMessages([{
          id: `agency-welcome-${Date.now()}`,
          text: "Ciao! Sono AIDA, la tua assistente creativa. Dimmi, che tipo di contenuto vuoi creare oggi?",
          sender: 'aida',
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Errore inizializzazione:', error);
        setChatMessages([]);
      }
    };

    initializeAgency();
  }, [agencySessionId, userId]);
  
  // Stati per la gestione dei template
  const [showTemplateDetails, setShowTemplateDetails] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [templateFilters, setTemplateFilters] = useState<{
    categories: string[];
    aspectRatio: string[];
    duration: string[];
    sort: 'new' | 'popular' | 'recommended' | 'alphabetical';
  }>({
    categories: [],
    aspectRatio: [],
    duration: [],
    sort: 'new'
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Stati per Kling API
  const [isGeneratingWithKling, setIsGeneratingWithKling] = useState<boolean>(false);
  const [klingApiAvailable, setKlingApiAvailable] = useState<boolean | null>(null);
  const [klingErrorMessage, setKlingErrorMessage] = useState<string>('');
  const [klingResults, setKlingResults] = useState<string[]>([]);
  const [framePrompts, setFramePrompts] = useState<string[]>(['', '', '']);
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const [sceneCount, setSceneCount] = useState<number>(8);
  
  // Stati per la visualizzazione delle immagini e audio
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);

  // Style Selector Modal (trigger HMR update)
  const [isStyleModalOpen, setIsStyleModalOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);

  // Debug: Monitor style modal state changes
  useEffect(() => {
    console.log('🔄 Style modal state changed:', isStyleModalOpen);
  }, [isStyleModalOpen]);

  // Effetti per il caricamento dei progetti
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Simulazione caricamento progetti (normalmente API call)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockProjects: Project[] = [
          {
            id: 1,
            title: "Product Launch Video",
            type: "commercial",
            status: "in-progress",
            format: { aspectRatio: "16:9" },
            target: { duration: 60, platform: ["youtube", "instagram"] },
            updatedAt: "2025-04-15T10:30:00Z"
          },
          {
            id: 2,
            title: "Brand Story",
            type: "corporate",
            status: "completed",
            format: { aspectRatio: "16:9" },
            target: { duration: 120, platform: ["website"] },
            updatedAt: "2025-04-10T15:45:00Z"
          },
          {
            id: 3,
            title: "Social Media Ad",
            type: "commercial",
            subtype: "short",
            status: "draft",
            format: { aspectRatio: "9:16" },
            target: { duration: 15, platform: ["tiktok", "instagram"] },
            updatedAt: "2025-04-20T09:15:00Z"
          }
        ];
        
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'library') {
      fetchProjects();
    }
  }, [activeTab]);
  
  // Funzione per cambiare tab
  const handleTabChange = (tab: 'video' | 'image' | 'library' | 'template') => {
    setActiveTab(tab);
  };
  
  // Funzione per gestire i filtri
  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };
  
  // Gestione template selezionato
  const handleTemplateSelect = (template: TemplateData) => {
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
  };
  
  // Funzione per creare un progetto dal template
  const handleCreateFromTemplate = () => {
    if (selectedTemplate && onCreateProject) {
      onCreateProject(selectedTemplate.id);
      setShowTemplateDetails(false);
    }
  };
  
  // Funzione per filtrare i template
  const applyTemplateFilters = () => {
    let filtered = [...mockTemplates];
    
    // Filtra per query di ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(query) || 
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query)) ||
        template.category.toLowerCase().includes(query) ||
        (template.categories && template.categories.some(cat => cat.toLowerCase().includes(query)))
      );
    }
    
    // Filtra per categorie
    if (templateFilters.categories.length > 0) {
      filtered = filtered.filter(template => {
        // Check categoria principale
        if (templateFilters.categories.includes(template.category)) {
          return true;
        }
        
        // Check categorie multiple se presenti
        if (template.categories && template.categories.some(cat => 
          templateFilters.categories.includes(cat))) {
          return true;
        }
        
        return false;
      });
    }
    
    // Filtra per aspect ratio
    if (templateFilters.aspectRatio.length > 0) {
      filtered = filtered.filter(template => 
        template.aspectRatio && templateFilters.aspectRatio.includes(template.aspectRatio)
      );
    }
    
    // Filtra per durata
    if (templateFilters.duration.length > 0) {
      filtered = filtered.filter(template => {
        if (!template.duration) return false;
        
        return templateFilters.duration.some(durRange => {
          // Range di durata (esempio: "0-30", "30-60", "60-120", "120+")
          const [min, max] = durRange.split('-').map(val => parseInt(val, 10));
          
          if (max) {
            // Range normale (0-30, 30-60, etc.)
            return template.duration! >= min && template.duration! < max;
          } else {
            // Range con "+" (120+)
            return template.duration! >= min;
          }
        });
      });
    }
    
    // Ordinamento
    switch (templateFilters.sort) {
      case 'new':
        filtered = filtered.filter(t => t.isNew).concat(filtered.filter(t => !t.isNew));
        break;
      case 'popular':
        filtered = filtered.filter(t => t.isPopular).concat(filtered.filter(t => !t.isPopular));
        break;
      case 'recommended':
        filtered = filtered.filter(t => t.isRecommended).concat(filtered.filter(t => !t.isRecommended));
        break;
      case 'alphabetical':
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    setFilteredTemplates(filtered);
  };
  
  // Effetto per applicare i filtri quando cambiano
  useEffect(() => {
    if (activeTab === 'template') {
      applyTemplateFilters();
    }
  }, [activeTab, searchQuery, templateFilters, showFilters]);
  
  // Effetto per mantenere sincronizzato lo stato dell'input vuoto
  useEffect(() => {
    setIsInputEmpty(promptText.trim() === '');
  }, [promptText]);
  
  // Funzione per aggiungere/rimuovere un filtro di categoria
  const toggleCategoryFilter = (category: string) => {
    setTemplateFilters(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      
      return { ...prev, categories };
    });
  };
  
  // Funzione per aggiungere/rimuovere un filtro di aspect ratio
  const toggleAspectRatioFilter = (ratio: string) => {
    setTemplateFilters(prev => {
      const aspectRatio = prev.aspectRatio.includes(ratio)
        ? prev.aspectRatio.filter(r => r !== ratio)
        : [...prev.aspectRatio, ratio];
      
      return { ...prev, aspectRatio };
    });
  };
  
  // Funzione per aggiungere/rimuovere un filtro di durata
  const toggleDurationFilter = (duration: string) => {
    setTemplateFilters(prev => {
      const durationValues = prev.duration.includes(duration)
        ? prev.duration.filter(d => d !== duration)
        : [...prev.duration, duration];
      
      return { ...prev, duration: durationValues };
    });
  };
  
  // Funzione per cambiare l'ordinamento
  const changeSortOrder = (sort: 'new' | 'popular' | 'recommended' | 'alphabetical') => {
    setTemplateFilters(prev => ({ ...prev, sort }));
  };
  
  // Gestione del cambiamento del ratio
  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
  };
  
  // Gestione del cambiamento della risoluzione
  const handleResolutionChange = (value: string) => {
    setResolution(value);
  };
  
  // Gestione del cambiamento della durata
  const handleDurationChange = (value: string) => {
    setDuration(value);
  };
  
  // Gestione dell'apertura e chiusura dei pannelli delle impostazioni
  const toggleSettingsPanel = (panelName: string) => {
    // Mappiamo i pannelli alle corrispondenti pagine module
    const panelToModuleMap: Record<string, string> = {
      'style': '/style',
      'script': '/script',
      'cast': '/cast',
      'board': '/board',
      'story': '/story',
      'media': '/media',
      'video': '/video'
    };
    
    // Se il pannello è mappato a una pagina, eseguiamo un redirect
    if (panelToModuleMap[panelName]) {
      // Utilizziamo window.location per garantire un redirectiompnt completo della pagina
      window.location.href = panelToModuleMap[panelName];
      return;
    }
    
    // Per i pannelli che non sono ancora stati migrati a pagine dedicate,
    // manteniamo il comportamento originale
    if (activeSettingsPanel === panelName) {
      setActiveSettingsPanel(null);
    } else {
      setActiveSettingsPanel(panelName);
      
      // Se è il pannello del board, verifica la disponibilità dell'API Kling
      if (panelName === 'board') {
        checkKlingApiStatus();
      }
    }
  };
  
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
  
  // Gestione del cambio di prompt per un frame specifico
  const handleFramePromptChange = (index: number, value: string) => {
    const newFramePrompts = [...framePrompts];
    newFramePrompts[index] = value;
    setFramePrompts(newFramePrompts);
  };

  // Funzione per impostare il frame attivo
  const setFrameAsActive = (index: number) => {
    setActiveFrame(index);
  };

  // Funzione per generare un singolo frame
  const generateSingleFrame = async (frameIndex: number) => {
    if (!klingApiAvailable) {
      setKlingErrorMessage('API Kling non disponibile. Assicurati che il token API sia configurato.');
      return;
    }

    const framePrompt = framePrompts[frameIndex];
    
    if (!framePrompt || framePrompt.length < 10) {
      setKlingErrorMessage(`Inserisci una descrizione per il frame ${frameIndex + 1} di almeno 10 caratteri.`);
      return;
    }

    setIsGeneratingWithKling(true);
    setKlingErrorMessage('');

    try {
      // Per ora simula una risposta di successo visto che Kling 1.6 richiede un'immagine iniziale
      // e dobbiamo aspettare ulteriori istruzioni sul suo utilizzo
      setKlingErrorMessage('Nota: Kling 1.6 richiede immagini iniziali, quindi questa è una simulazione - In attesa di implementazione MidJourney');
      
      // Simula un ritardo per dare l'impressione di generazione
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostra un messaggio informativo invece di un errore
      console.log(`Simulazione generazione frame ${frameIndex + 1} con prompt: ${framePrompt}`);

      // Aggiorniamo comunque lo stato per mostrare che il processo è stato completato
      const result = `https://dummyimage.com/640x360/000/fff.png&text=Frame+${frameIndex + 1}`;
      
      // Aggiorna i risultati inserendo il nuovo URL alla posizione corretta
      const newResults = [...klingResults];
      newResults[frameIndex] = result;
      setKlingResults(newResults);
      
    } catch (error: any) {
      console.error('Error generating frame:', error);
      setKlingErrorMessage(error.message || `Errore nella generazione del frame ${frameIndex + 1}`);
    } finally {
      setIsGeneratingWithKling(false);
    }
  };

  // Funzione per generare tutti i frame (per uso futuro)
  const generateAllFrames = async () => {
    if (!klingApiAvailable) {
      setKlingErrorMessage('API Kling non disponibile. Assicurati che il token API sia configurato.');
      return;
    }
    
    // Controlla che ci sia almeno un prompt valido
    const hasValidPrompt = framePrompts.some(prompt => prompt && prompt.length >= 10);
    if (!hasValidPrompt) {
      setKlingErrorMessage('Inserisci almeno una descrizione di scena valida (minimo 10 caratteri).');
      return;
    }

    setIsGeneratingWithKling(true);
    setKlingErrorMessage('');

    try {
      // Mostra che questa funzionalità sarà supportata in futuro
      setKlingErrorMessage('Generazione multipla di frame sarà supportata in futuro con MidJourney');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error('Error generating all frames:', error);
      setKlingErrorMessage(error.message || 'Errore nella generazione dei frame');
    } finally {
      setIsGeneratingWithKling(false);
    }
  };
  
  // Funzione per aprire il selettore di file quando l'utente clicca sul pulsante '+'
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Funzione per gestire il file selezionato dall'utente
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileAttachment(files[0]);
      
      // Se è un'immagine, mostrarla in preview
      if (files[0].type.startsWith('image/')) {
        setShowImagePreview(true);
      } 
      // Se è un file di testo, mostra anteprima diversa
      else if (files[0].type.startsWith('text/') || 
               files[0].type === 'application/pdf' || 
               files[0].type === 'application/msword' ||
               files[0].type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setShowImagePreview(false);
      }
      
      // Quando è caricato un file, il bottone di invio dovrebbe essere sempre attivo
      setIsInputEmpty(false);
    }
  };
  
  // Stati per la registrazione audio
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const micButtonRef = React.useRef<HTMLButtonElement>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  
  // Funzione per gestire l'inizio della registrazione audio
  const startAudioRecording = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Il tuo browser non supporta la registrazione audio");
      return;
    }
    
    console.log("Avvio registrazione audio...");
    
    // Reset di tutti gli stati relativi alla registrazione
    setIsRecording(true);
    setIsCancelled(false);
    setAudioChunks([]);
    audioChunksRef.current = []; // Reset dell'array di riferimento
    
    navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    })
    .then((stream) => {
      console.log("Stream audio ottenuto con successo");
      setAudioStream(stream);
      
      // Configurazione più robusta di MediaRecorder
      const options = { 
        mimeType: 'audio/webm;codecs=opus',  // Scelta del formato ottimale
        audioBitsPerSecond: 128000           // Qualità audio decente
      };
      
      // Fallback se il tipo MIME non è supportato
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
        console.log("MediaRecorder creato con opzioni specifiche");
      } catch (err) {
        console.log("Formato audio non supportato, utilizzo valori predefiniti");
        recorder = new MediaRecorder(stream);
      }
      
      setMediaRecorder(recorder);
      
      // Gestione più robusta dell'evento dataavailable
      const handleDataAvailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          console.log(`Chunk audio ricevuto: ${e.data.size} bytes`);
          // Salva sempre prima nel ref e poi nello stato
          audioChunksRef.current = [...audioChunksRef.current, e.data];
          setAudioChunks(current => [...current, e.data]);
        }
      };
      
      // Gestione dell'evento stop
      const handleStop = () => {
        console.log(`Registrazione completata, ${audioChunksRef.current.length} chunks raccolti`);
        
        // Verifica con il ref piuttosto che lo stato
        if (!isCancelled && audioChunksRef.current.length > 0) {
          try {
            // Creazione del blob audio
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            console.log(`Audio registrato: ${audioBlob.size} bytes`);
            
            // Crea URL per il playback
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log(`URL audio creato: ${audioUrl}`);
            
            // Calcola la durata in modo più accurato (se possibile)
            let approximateDuration = audioChunksRef.current.length * 0.1;
            if (approximateDuration < 0.1) approximateDuration = 0.1; // Durata minima
            
            // Crea messaggio con l'audio
            const audioAttachment = {
              type: 'audio' as const,
              url: audioUrl,
              audioBlob: audioBlob,
              duration: approximateDuration,
              isPlaying: false
            };
            
            console.log("Creazione messaggio con audio:", audioAttachment);
            
            // Aggiungi messaggio audio alla chat
            const messageId = Date.now().toString();
            const userMessage: ChatMessage = {
              id: messageId,
              text: "",
              sender: 'user',
              timestamp: new Date(),
              attachments: [audioAttachment]
            };
            
            setChatMessages(prevMessages => [...prevMessages, userMessage]);
            console.log(`Messaggio audio aggiunto alla chat, ID: ${messageId}`);
            
            // Messaggio di attesa
            const waitingId = (Date.now() + 1).toString();
            setChatMessages(prevMessages => [
              ...prevMessages, 
              {
                id: waitingId,
                text: "Sto processando il tuo messaggio vocale...",
                sender: 'aida',
                timestamp: new Date()
              }
            ]);
            
            // Tenta di trascrivere l'audio utilizzando il nuovo endpoint
            try {
              console.log("Tentativo di invio audio per trascrizione...");
              
              // Converti audioBlob in base64
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              
              reader.onloadend = async () => {
                try {
                  // Estrai la parte base64 dalla stringa, rendendo visibile il MIME type
                  const base64String = reader.result?.toString() || '';
                  const mimeTypeMatch = base64String.match(/^data:(.*?);base64,/);
                  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'audio/webm';
                  const base64Data = base64String.split(',')[1]; // Rimuove il prefisso data:audio/webm;base64,
                  
                  if (!base64Data) {
                    throw new Error("Impossibile convertire l'audio in base64");
                  }
                  
                  console.log(`Audio convertito in base64, tipo MIME: ${mimeType}, invio al server...`);
                  
                  // Aggiungi il MIME type all'invio
                  const requestData = {
                    audioData: base64Data,
                    mimeType: mimeType
                  };
                  
                  // TODO: Implementare trascrizione audio quando disponibile
                  // Per ora simula trascrizione locale
                  const result = {
                    transcription: "Messaggio vocale ricevuto",
                    confidence: 0.8
                  };

                  /* TEMPORANEAMENTE DISABILITATO - Richiede API trascrizione
                  const response = await fetch('/api/ai-agent/transcribe-audio', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                  });
                  
                  const result = await response.json();
                  */

                  // Continua con il risultato (simulato o reale)
                  if (result && result.transcription) {
                    console.log("Trascrizione ricevuta:", result.transcription);
                    
                    // Aggiorna il messaggio utente con la trascrizione
                    setChatMessages(prevMessages => {
                      const updatedMessages = [...prevMessages];
                      // Trova il messaggio utente con l'allegato audio
                      const userMessageIndex = updatedMessages.findIndex(msg => 
                        msg.sender === 'user' && msg.id === messageId
                      );
                      
                      if (userMessageIndex !== -1) {
                        // Aggiorna il messaggio con la trascrizione
                        updatedMessages[userMessageIndex] = {
                          ...updatedMessages[userMessageIndex],
                          text: result.transcription
                        };
                      }
                      return updatedMessages;
                    });
                    
                    // Invia la trascrizione all'orchestrator conversazionale
                    const chatResponse = await fetch('/api/orchestrator/chat', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        message: result.transcription,
                        userId: userId || 'anonymous',
                        sessionId: `voice-session-${userId}`
                      })
                    });
                    
                    const chatResult = await chatResponse.json();
                    
                    console.log("Risposta chat ricevuta:", chatResult);
                    
                    // Se la trascrizione contiene un comando di generazione immagine
                    // Verifica diversi pattern di richieste di immagini, inclusi:
                    // - comandi diretti (genera, crea, disegna)
                    // - richieste con "ce n'è", "vorrei", ecc.
                    // - riferimenti diretti a "l'immagine di"
                    // - costrutti peculiari come "ce n'era l'immagine"
                    const transcription = result.transcription.trim();
                    console.log("Analisi trascrizione per rilevamento comando immagine:", transcription);
                    
                    // Comando diretto per generare immagini
                    const directImageCommands = /^(genera|crea|disegna|fammi|vorrei|puoi\s+generare|puoi\s+creare|puoi\s+disegnare)\s+(una|un|delle|dei|l['']|lo|la|le|gli|il)\s+(immagine|immagini|foto|fotografia|disegno|illustrazione|grafica|figura|quadro|arte|rappresentazione|visual)/i;
                    
                    // Riferimenti più indiretti a richieste di immagini
                    const indirectImageReferences = /(voglio|vorrei|ce\s+n[']?[eè]|c[']?[eè]|mostra|mostrami|visualizza|mandami|fai|fammi\s+vedere)\s+(una|un|delle|dei|l['']|lo|la|le|gli|il)\s+(immagine|immagini|foto|fotografia|disegno|illustrazione|grafica|figura|quadro|arte|rappresentazione|visual)/i;
                    
                    // Riferimenti diretti al termine "immagine di" 
                    const directImageReferences = /(immagine|immagini|foto|fotografia|disegno|illustrazione|grafica|figura|quadro|arte|rappresentazione|visual)\s+di\s+/i;
                    
                    // Pattern specifici che emergono dalle trascrizioni ("ce n'era l'immagine")
                    const specificPatterns = /(ce\s+n['']?era\s+l['']?immagine|mostrami\s+un['']?immagine|voglio\s+vedere\s+un['']?immagine|fammi\s+vedere\s+com['']?[eè]|come\s+sarebbe)/i;
                    
                    // Controlla se contiene le parole "immagine/i" e "cane/gatto/etc" nello stesso testo
                    const containsImageAndObject = (text: string) => {
                      const hasImageWord = /(immagine|immagini|foto|fotografia|disegno|visual)/i.test(text);
                      const hasCommonObject = /(cane|gatto|casa|montagna|paesaggio|tramonto|albero|persona|uomo|donna|città|mare|fiore|animale)/i.test(text);
                      return hasImageWord && hasCommonObject;
                    };
                    
                    const isImageGenCommand = directImageCommands.test(transcription) || 
                                             indirectImageReferences.test(transcription) || 
                                             directImageReferences.test(transcription) ||
                                             specificPatterns.test(transcription) ||
                                             containsImageAndObject(transcription);
                                             
                    console.log("Rilevamento comando immagine:", isImageGenCommand);
                    
                    if (isImageGenCommand) {
                      // Rimuovi il messaggio di attesa
                      setChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== waitingId));
                      
                      // Invia direttamente alla funzione di generazione immagini
                      try {
                        await handleGenerateImage(result.transcription);
                      } catch (error) {
                        console.error("Errore nella generazione dell'immagine:", error);
                        
                        setChatMessages(prevMessages => 
                          prevMessages.concat({
                            id: (Date.now() + 2).toString(),
                            text: "Mi dispiace, si è verificato un errore durante la generazione dell'immagine.",
                            sender: 'aida',
                            timestamp: new Date()
                          })
                        );
                      }
                    } else {
                      // Gestione conversazionale AIDA Hub per messaggi non legati a immagini
                      setChatMessages(prevMessages => 
                        prevMessages.filter(msg => msg.id !== waitingId).concat({
                          id: (Date.now() + 2).toString(),
                          text: chatResult.success 
                            ? chatResult.data.response 
                            : "Ho ricevuto il tuo messaggio vocale: \"" + result.transcription + 
                              "\". Purtroppo non sono riuscita a elaborare una risposta appropriata.",
                          sender: 'aida',
                          timestamp: new Date()
                        })
                      );
                      
                      // Aggiorna step conversazione se disponibile
                      if (chatResult.success && chatResult.data.currentStep) {
                        setAgencyPhase(chatResult.data.phase);
                      }
                      
                      // TTS per risposta vocale se attivo
                      if (chatResult.success && chatResult.data.voiceResponse && 'speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(chatResult.data.response);
                        utterance.lang = 'it-IT';
                        utterance.rate = 0.9;
                        speechSynthesis.speak(utterance);
                      }
                    }
                  } else {
                    console.error("Errore nella trascrizione:", result);
                    throw new Error("Errore nella trascrizione");
                  }
                } catch (transcriptionError) {
                  console.error("Errore nell'elaborazione della trascrizione:", transcriptionError);
                  
                  // Se c'è un errore, mostra un messaggio generico
                  setChatMessages(prevMessages => 
                    prevMessages.filter(msg => msg.id !== waitingId).concat({
                      id: (Date.now() + 2).toString(),
                      text: "Ho ricevuto il tuo messaggio audio, ma non sono riuscita a trascriverlo. Come posso aiutarti?",
                      sender: 'aida',
                      timestamp: new Date()
                    })
                  );
                }
              };
              
              reader.onerror = () => {
                console.error("Errore nella lettura del file audio");
                // Se non riesce a leggere l'audio, mostra comunque una risposta
                setChatMessages(prevMessages => 
                  prevMessages.filter(msg => msg.id !== waitingId).concat({
                    id: (Date.now() + 2).toString(),
                    text: "Ho ricevuto il tuo messaggio audio. Come posso aiutarti?",
                    sender: 'aida',
                    timestamp: new Date()
                  })
                );
              };
            } catch (err) {
              console.error("Errore generale nella gestione dell'audio:", err);
              // Fallback in caso di errore
              setTimeout(() => {
                setChatMessages(prevMessages => 
                  prevMessages.filter(msg => msg.id !== waitingId).concat({
                    id: (Date.now() + 2).toString(),
                    text: "Ho ricevuto il tuo messaggio audio. Come posso aiutarti?",
                    sender: 'aida',
                    timestamp: new Date()
                  })
                );
              }, 1500);
            }
            
          } catch (error) {
            console.error("Errore nella creazione del blob audio:", error);
            // Mostra messaggio di errore all'utente
            setChatMessages(prevMessages => [
              ...prevMessages, 
              {
                id: Date.now().toString(),
                text: "Mi dispiace, si è verificato un errore durante la registrazione audio.",
                sender: 'aida',
                timestamp: new Date()
              }
            ]);
          }
        } else {
          console.log("Registrazione audio annullata o nessun dato ricevuto");
        }
        
        // Cleanup completo
        if (audioStream) {
          console.log("Chiusura dello stream audio");
          audioStream.getTracks().forEach(track => {
            track.stop();
            console.log(`Track ${track.id} fermata`);
          });
        }
        
        // Reset finale
        setAudioStream(null);
        setMediaRecorder(null);
        setIsRecording(false);
        console.log("Stato di registrazione resettato");
      };
      
      // Aggiungi gli eventi in modo robusto
      recorder.addEventListener('dataavailable', handleDataAvailable);
      recorder.addEventListener('stop', handleStop);
      
      // Aggiungi gestione degli errori
      recorder.addEventListener('error', (event) => {
        console.error("Errore nel MediaRecorder:", event);
        stopAudioRecording(true);
      });
      
      // Inizia la registrazione con un intervallo di dati corto per avere più chunk
      console.log("Avvio della registrazione");
      recorder.start(100); // Raccoglie dati ogni 100ms
    })
    .catch((err) => {
      console.error("Errore nell'accesso al microfono:", err);
      alert("Non è stato possibile accedere al microfono: " + err.message);
      setIsRecording(false);
    });
  };
  
  // Funzione per terminare la registrazione audio
  const stopAudioRecording = (wasCancelled = false) => {
    console.log(`Arresto registrazione audio${wasCancelled ? ' (annullata)' : ''}`);
    
    // Imposta prima lo stato di cancellazione
    setIsCancelled(wasCancelled);
    
    try {
      // Verifica e arresta il mediaRecorder
      if (mediaRecorder) {
        console.log(`Stato attuale del MediaRecorder: ${mediaRecorder.state}`);
        
        if (mediaRecorder.state === 'recording') {
          console.log("Arresto registrazione (stop)");
          mediaRecorder.stop();
        } else if (mediaRecorder.state === 'paused') {
          console.log("Registrazione in pausa, ripristino e arresto");
          mediaRecorder.resume();
          setTimeout(() => mediaRecorder.stop(), 10);
        } else {
          console.log("MediaRecorder non attivo, non serve fermarlo");
        }
      } else {
        console.log("Nessun MediaRecorder trovato");
      }
      
      // Arresta lo stream audio con controllo aggiuntivo di errore
      if (audioStream) {
        console.log(`Chiusura di ${audioStream.getTracks().length} tracce audio`);
        try {
          audioStream.getTracks().forEach(track => {
            try {
              track.stop();
              console.log(`Track ${track.kind} arrestata con successo`);
            } catch (trackErr) {
              console.error(`Errore nell'arresto della traccia ${track.kind}:`, trackErr);
            }
          });
        } catch (streamErr) {
          console.error("Errore nell'arresto delle tracce audio:", streamErr);
        }
      } else {
        console.log("Nessuno stream audio da fermare");
      }
    } catch (e) {
      console.error("Errore durante l'arresto della registrazione:", e);
    } finally {
      // Garantisce che lo stato di registrazione venga sempre resettato
      setIsRecording(false);
      console.log("Registrazione terminata, stato resettato");
    }
  };
  
  // Event handlers per il bottone del microfono
  const handleMicButtonPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPointerDown(true);
    startAudioRecording();
  };
  
  const handleMicButtonPointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isPointerDown) {
      setIsPointerDown(false);
      stopAudioRecording(false); // Registrazione completata
    }
  };
  
  const handleMicButtonPointerLeave = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isPointerDown) {
      setIsPointerDown(false);
      stopAudioRecording(true); // Registrazione annullata
    }
  };
  
  // Funzione principale per la gestione del microfono
  const handleAudioRecording = () => {
    // Questa funzione è ora solo un placeholder, dato che l'attivazione
    // avviene tramite eventi pointerdown/up sul pulsante
    // Non fa nulla perché gli eventi sono gestiti direttamente nel tag Button
  };
  
  // Funzione per inviare un messaggio
  // Stati per la visualizzazione del testo
  const [fullscreenText, setFullscreenText] = useState<{content: string, title: string} | null>(null);

  // Funzione per visualizzare un'immagine a schermo intero
  const handleImageClick = (imageUrl: string) => {
    // Trova tutte le immagini nella chat
    const allImages: string[] = [];
    chatMessages.forEach(message => {
      if (message.attachments) {
        message.attachments.forEach(attachment => {
          if (attachment.type === 'image') {
            if (attachment.url) {
              allImages.push(attachment.url);
            } else if (attachment.file) {
              allImages.push(URL.createObjectURL(attachment.file));
            }
          }
        });
      }
    });
    
    // Se ci sono immagini nella galleria
    if (allImages.length > 0) {
      setImageGallery(allImages);
      const clickedIndex = allImages.indexOf(imageUrl);
      setCurrentImageIndex(clickedIndex >= 0 ? clickedIndex : 0);
      setFullscreenImage(imageUrl);
    }
  };
  
  // Funzione per visualizzare un file di testo
  const handleTextFileClick = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setFullscreenText({
          content: event.target.result.toString(),
          title: file.name
        });
      }
    };
    reader.readAsText(file);
  };
  
  // Funzione per navigare nella galleria di immagini
  const navigateGallery = (direction: 'next' | 'prev') => {
    if (imageGallery.length <= 1) return;
    
    let newIndex = currentImageIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % imageGallery.length;
    } else {
      newIndex = (currentImageIndex - 1 + imageGallery.length) % imageGallery.length;
    }
    
    setCurrentImageIndex(newIndex);
    setFullscreenImage(imageGallery[newIndex]);
  };
  
  // Funzione per generare un'immagine tramite DALL-E
  const handleGenerateImage = async (prompt: string) => {
    console.log("Inizia la richiesta di generazione immagine con prompt:", prompt);
    try {
      console.log("Preparazione della chiamata API di generazione immagine");
      // Chiamata API per generare l'immagine
      const response = await fetch("/api/ai-agent/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          model: "dall-e-3",
          size: "1024x1024"
        })
      });
      
      console.log("Risposta ricevuta con status:", response.status, response.statusText);
      
      if (!response.ok) {
        console.error("Risposta non OK dall'API:", response.status, response.statusText);
        throw new Error(`Errore nella generazione dell'immagine: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Dati della risposta:", data);
      
      if (!data.success || !data.images || data.images.length === 0) {
        console.error("Dati mancanti o non validi nella risposta:", data);
        throw new Error("Nessuna immagine generata");
      }
      
      // Ottieni l'URL dell'immagine generata
      const imageUrl = data.images[0];
      
      // Aggiungi l'immagine generata come messaggio di AIDA
      const imageMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Ecco l'immagine generata in base alla tua richiesta:",
        sender: 'aida',
        timestamp: new Date(),
        attachments: [
          {
            type: 'image',
            url: imageUrl
          }
        ]
      };
      
      setChatMessages(prev => [...prev, imageMessage]);
      
      // Aggiungi un messaggio che offre opzioni per ulteriori elaborazioni
      const optionsMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: "Vuoi che invii questa immagine all'Agente Visuale o Media per ulteriori elaborazioni?",
        sender: 'aida',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, optionsMessage]);
      
      return true;
    } catch (error) {
      console.error("Errore nella generazione dell'immagine:", error);
      
      // Messaggio di errore
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Mi dispiace, si è verificato un errore durante la generazione dell'immagine. Controlla che la tua API key di OpenAI sia configurata correttamente.",
        sender: 'aida',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      
      return false;
    }
  };
  
  const handleSendMessage = async () => {
    if (!promptText.trim() && !fileAttachment) return;
    
    console.log("Analisi del messaggio di testo:", promptText.trim());
    
    // Controlla se è un comando esplicito di generazione immagine
    const isImageGenCommand = promptText.trim().match(/^\/image\s+(.+)$/i) || promptText.trim().match(/^\/genera\s+(.+)$/i);
    console.log("Match comando esplicito:", isImageGenCommand);
    
    // Controlla se è una richiesta implicita di generazione immagine
    const isImplicitImageRequest = promptText.trim().match(/^(genera|crea|disegna|fammi|vorrei|puoi\s+generare|puoi\s+creare|puoi\s+disegnare)\s+(una|un|delle|dei|l['']|lo|la|le|gli|il)\s+(immagine|immagini|foto|fotografia|disegno|illustrazione|grafica|figura|quadro|arte|rappresentazione|visual)/i);
    console.log("Match richiesta implicita:", isImplicitImageRequest);
    
    if (isImageGenCommand || isImplicitImageRequest) {
      console.log("Rilevata richiesta di generazione immagine");
      // Estrai il prompt di generazione immagine
      let imagePrompt;
      
      if (isImageGenCommand) {
        imagePrompt = isImageGenCommand[1];
        console.log("Prompt da comando esplicito:", imagePrompt);
      } else {
        // Nel caso di richiesta implicita, usiamo l'intero testo come prompt
        imagePrompt = promptText.trim();
        console.log("Prompt da richiesta implicita:", imagePrompt);
      }
      
      // Crea un nuovo messaggio dell'utente
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: promptText,
        sender: 'user',
        timestamp: new Date()
      };
      
      // Aggiunge il messaggio dell'utente alla chat
      setChatMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Messaggio di attesa
      const waitingId = (Date.now() + 1).toString();
      setChatMessages(prevMessages => [
        ...prevMessages, 
        {
          id: waitingId,
          text: "Sto generando l'immagine richiesta, ci vorrà qualche secondo...",
          sender: 'aida',
          timestamp: new Date()
        }
      ]);
      
      // Reimposta lo stato
      setPromptText('');
      setFileAttachment(null);
      setShowImagePreview(false);
      setIsInputEmpty(true); // Ripristina l'icona del microfono
      
      try {
        // Genera l'immagine
        await handleGenerateImage(imagePrompt);
        
        // Rimuovi il messaggio di attesa
        setChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== waitingId));
      } catch (error) {
        console.error("Errore nella generazione dell'immagine:", error);
        
        // Rimuovi il messaggio di attesa e mostra l'errore
        setChatMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== waitingId).concat({
            id: (Date.now() + 2).toString(),
            text: "Mi dispiace, si è verificato un errore durante la generazione dell'immagine.",
            sender: 'aida',
            timestamp: new Date()
          })
        );
      }
      
      return;
    }
    
    const attachments = [];
    
    if (fileAttachment) {
      // Determina il tipo di allegato in base al MIME type
      let fileType: 'image' | 'text' = 'text';
      if (fileAttachment.type.startsWith('image/')) {
        fileType = 'image';
      }
      attachments.push({
        type: fileType,
        file: fileAttachment
      });
    }
    
    // Crea un nuovo messaggio dell'utente
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: promptText,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments as ChatMessage['attachments'] : undefined
    };
    
    // Aggiunge il messaggio dell'utente alla chat
    setChatMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Messaggio di attesa con tre puntini
    const waitingId = (Date.now() + 1).toString();
    setChatMessages(prevMessages => [
      ...prevMessages, 
      {
        id: waitingId,
        text: "typing-indicator",
        sender: 'aida',
        timestamp: new Date()
      }
    ]);
    
    // Reimposta lo stato
    const currentPrompt = promptText || (fileAttachment ? `File allegato: ${fileAttachment.name}` : "");
    setPromptText('');
    setFileAttachment(null);
    setShowImagePreview(false);
    setIsInputEmpty(true); // Ripristina l'icona del microfono
    
    try {
      console.log('🔀 Checking message type...');
      console.log('🔀 Has fileAttachment:', !!fileAttachment);
      console.log('🔀 Is image:', fileAttachment?.type.startsWith('image/'));

      // Se c'è un'immagine, usiamo l'API di analisi immagine
      if (fileAttachment && fileAttachment.type.startsWith('image/')) {
        console.log('🖼️ Entering image analysis path');

        const reader = new FileReader();
        reader.readAsDataURL(fileAttachment);
        
        reader.onload = async () => {
          try {
            const base64Image = reader.result?.toString().split(',')[1];
            
            // Chiamata all'API di analisi immagine
            const response = await fetch('/api/ai-agent/analyze-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                image: base64Image,
                prompt: promptText.trim() || "Descrivi questa immagine e dimmi cosa vedi."
              })
            });
            
            const data = await response.json();
            
            if (data.success) {
              // Rimuove il messaggio di attesa e aggiunge la risposta
              setChatMessages(prevMessages => 
                prevMessages.filter(msg => msg.id !== waitingId).concat({
                  id: (Date.now() + 2).toString(),
                  text: data.analysis,
                  sender: 'aida',
                  timestamp: new Date()
                })
              );
            } else {
              throw new Error(data.message || "Errore nell'analisi dell'immagine");
            }
          } catch (error: any) {
            // Gestione errore
            console.error("Error analyzing image:", error);
            setChatMessages(prevMessages => 
              prevMessages.filter(msg => msg.id !== waitingId).concat({
                id: (Date.now() + 2).toString(),
                text: `Mi dispiace, non sono riuscita ad analizzare l'immagine: ${error.message}`,
                sender: 'aida',
                timestamp: new Date()
              })
            );
          }
        };
        
        reader.onerror = () => {
          // Gestione errore
          setChatMessages(prevMessages => 
            prevMessages.filter(msg => msg.id !== waitingId).concat({
              id: (Date.now() + 2).toString(),
              text: "Mi dispiace, non sono riuscita a leggere l'immagine.",
              sender: 'aida',
              timestamp: new Date()
            })
          );
        };
      } else {
        // Per messaggi di testo o file di testo
        console.log('📤 Preparing to send text message to orchestrator');
        console.log('📤 Current prompt:', currentPrompt);
        console.log('📤 Has file attachment:', !!fileAttachment);

        let messageToSend = currentPrompt || "Ciao";

        // Se c'è un file di testo allegato, leggiamo il suo contenuto
        if (fileAttachment && !fileAttachment.type.startsWith('image/')) {
          try {
            // Leggi il contenuto del file di testo
            const fileContent = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target && event.target.result) {
                  resolve(event.target.result.toString());
                } else {
                  reject(new Error("Impossibile leggere il contenuto del file"));
                }
              };
              reader.onerror = () => reject(new Error("Errore durante la lettura del file"));
              reader.readAsText(fileAttachment);
            });
            
            // Aggiungi il contenuto del file al messaggio
            messageToSend = `${messageToSend}\n\nContenuto del file "${fileAttachment.name}":\n\n${fileContent}`;
            
            console.log("File di testo letto con successo, lunghezza:", fileContent.length);
          } catch (fileError) {
            console.error("Errore nella lettura del file di testo:", fileError);
            messageToSend += `\n\nHo cercato di leggere il tuo file "${fileAttachment.name}" ma si è verificato un errore.`;
          }
        }

        console.log('🚀 About to call orchestrator API');
        console.log('🚀 Message to send:', messageToSend);

        // Chiamata all'API Orchestrator conversazionale (porta 3003)
        const response = await fetch('http://localhost:3003/api/orchestrator/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: (userId || 'anonymous').toString(),
            message: messageToSend,
            sessionId: currentSessionId || undefined // Use saved sessionId or let backend create new one
          })
        });

        const data = await response.json();
        console.log('📩 Orchestrator response:', data);
        console.log('📩 Full response structure:', JSON.stringify(data, null, 2));

        // Gestione risposta Orchestrator conversazionale
        if (data.success && data.data.message) {
          // 🔑 SAVE SESSION ID for conversation persistence
          if (data.data.sessionId && !currentSessionId) {
            console.log('💾 Saving sessionId for conversation persistence:', data.data.sessionId);
            setCurrentSessionId(data.data.sessionId);
          }

          const aidaMessage: ChatMessage = {
            id: Date.now().toString(),
            text: data.data.message,
            sender: 'aida',
            timestamp: new Date()
          };

          // Rimuove il messaggio di attesa e aggiunge la risposta
          setChatMessages(prevMessages =>
            prevMessages.filter(msg => msg.id !== waitingId).concat(aidaMessage)
          );

          // 🔑 Check if orchestrator wants to show style modal
          console.log('🔍 Checking metadata:', data.data.metadata);
          console.log('🔍 showStyleModal value:', data.data.metadata?.showStyleModal);
          console.log('🔍 showStyleModal type:', typeof data.data.metadata?.showStyleModal);
          console.log('🔍 Current isStyleModalOpen state:', isStyleModalOpen);

          if (data.data.metadata?.showStyleModal) {
            console.log('✅ Orchestrator triggered style selector modal - OPENING NOW!');
            console.log('✅ About to call setIsStyleModalOpen(true)');
            setIsStyleModalOpen(true);
            console.log('✅ setIsStyleModalOpen(true) called - state should update');
          } else {
            console.log('❌ No showStyleModal flag found in metadata');
            console.log('❌ metadata object:', data.data.metadata);
          }
        } else {
          throw new Error(data.error || 'Risposta non valida dall\'orchestrator');
        }
      }
    } catch (error: any) {
      console.error("Errore chiamata Orchestrator:", error);

      // Messaggio di errore strutturato
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "⚠️ Si è verificato un errore nella generazione del video. Riprova.",
        sender: 'aida',
        timestamp: new Date()
      };

      // Rimuove il messaggio di attesa e aggiunge il messaggio di errore
      setChatMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== waitingId).concat(errorMessage)
      );
    }
  };
  
  // Funzione per gestire l'invio del messaggio con tasto Invio
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle style selection from modal
  const handleStyleSelect = async (style: any) => {
    console.log('Style selected:', style);

    // Add user message showing selected style
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Ho selezionato lo stile: ${style.name} (${style.code})`,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Send selected style to orchestrator
    try {
      const response = await fetch('http://localhost:3003/api/orchestrator/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: (userId || 'anonymous').toString(),
          message: `Ho scelto lo stile "${style.name}" con codice ${style.code}`,
          sessionId: `hub-session-${userId || 'anonymous'}`,
          metadata: {
            selectedStyle: style
          }
        })
      });

      const data = await response.json();

      if (data.success && data.data.message) {
        const aidaMessage: ChatMessage = {
          id: Date.now().toString(),
          text: data.data.message,
          sender: 'aida',
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, aidaMessage]);
      }
    } catch (error) {
      console.error('Error sending style selection:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white w-full">
      {/* Visualizzatore immagine a schermo intero */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setFullscreenImage(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={fullscreenImage} 
              alt="Full screen" 
              className="max-w-full max-h-[90vh] object-contain" 
              onClick={(e) => e.stopPropagation()}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setFullscreenImage(null)}
            >
              <X size={16} />
            </Button>
            
            {imageGallery.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1/2 -left-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateGallery('prev');
                  }}
                >
                  <ArrowRight size={16} className="rotate-180" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1/2 -right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateGallery('next');
                  }}
                >
                  <ArrowRight size={16} />
                </Button>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                  {currentImageIndex + 1} / {imageGallery.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Visualizzatore testo a schermo intero */}
      {fullscreenText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setFullscreenText(null)}>
          <div 
            className="relative w-[90vw] h-[90vh] bg-gray-900/80 rounded-lg p-6 border border-gray-700/50 overflow-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-900/90 py-2 backdrop-blur-sm z-10">
              <h3 className="text-xl font-medium text-white flex items-center gap-2">
                <FileType size={18} className="text-aida-blue" />
                {fullscreenText.title}
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setFullscreenText(null)}
              >
                <X size={16} />
              </Button>
            </div>
            <div className="whitespace-pre-wrap font-mono text-sm text-gray-300 overflow-auto">
              {fullscreenText.content}
            </div>
          </div>
        </div>
      )}
      {/* Finestre modali sovrapposte a schermo intero per i vari moduli */}
      <AnimatePresence mode="wait">
        {/* Finestra Script */}
        {activeSettingsPanel === 'script' && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-6 pt-16 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border border-gray-700 bg-black/50"
                onClick={() => setActiveSettingsPanel(null)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <BookText size={24} className="text-aida-blue" />
                <h2 className="text-2xl font-light text-white">Script Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colonna sinistra */}
                <div className="space-y-6">
                  {/* Opzioni di stile vocale */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <MicVocal size={16} className="text-aida-blue" />
                      <span>Voice Style</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-blue/20">
                        Conversational
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-blue/20">
                        Professional
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-aida-blue/20 border-aida-blue/50 text-white">
                        Narrative
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-blue/20">
                        Dramatic
                      </Button>
                    </div>
                  </div>
                  
                  {/* Opzioni di tono */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <SlidersHorizontal size={16} className="text-aida-blue" />
                      <span>Tone Adjustment</span>
                    </h3>
                    <div className="space-y-3 p-4 bg-black/30 rounded-md border border-gray-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Formality</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-aida-blue"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Energy</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-aida-blue"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Pacing</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-aida-blue"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Colonna destra */}
                <div className="space-y-6">
                  {/* Esempi di struttura */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <ListFilter size={16} className="text-aida-blue" />
                      <span>Script Structure</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-blue/20">
                        Introduction → Body → Conclusion
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-aida-blue/20 border-aida-blue/50 text-white">
                        Problem → Solution → Call to Action
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-blue/20">
                        Question → Answer → Explanation
                      </Button>
                    </div>
                  </div>
                  
                  {/* Audio Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <SlidersHorizontal size={16} className="text-aida-blue" />
                      <span>Audio Settings</span>
                    </h3>
                    <div className="p-4 bg-black/30 rounded-md border border-gray-800/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Background Music</span>
                        <div>
                          <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-aida-blue/20 border-aida-blue/50 text-white">
                            Enabled
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Sound Effects</span>
                        <div>
                          <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-blue/20">
                            Disabled
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button className="bg-aida-blue hover:bg-aida-blue/80 text-white px-6" onClick={() => setActiveSettingsPanel(null)}>
                  Apply Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Finestra Style */}
        {activeSettingsPanel === 'style' && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-3 sm:p-6 pt-14 sm:pt-16 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border border-gray-700 bg-black/50"
                onClick={() => setActiveSettingsPanel(null)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-5 sm:mb-8">
                <Brush size={24} className="text-aida-magenta" />
                <h2 className="text-xl sm:text-2xl font-light text-white">Style Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                {/* Colonna sinistra */}
                <div className="space-y-6">
                  {/* Visual style selector */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Palette size={16} className="text-aida-magenta" />
                      <span>Visual Style</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="relative aspect-video rounded-md overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        <div className="absolute inset-0 border-2 border-aida-magenta rounded-md"></div>
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <span className="text-xs text-white">Cinematic</span>
                        </div>
                      </div>
                      <div className="relative aspect-video rounded-md overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        <div className="absolute inset-0 border-2 border-transparent rounded-md opacity-0 group-hover:opacity-100 group-hover:border-white/30"></div>
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <span className="text-xs text-white">Animation</span>
                        </div>
                      </div>
                      <div className="relative aspect-video rounded-md overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        <div className="absolute inset-0 border-2 border-transparent rounded-md opacity-0 group-hover:opacity-100 group-hover:border-white/30"></div>
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <span className="text-xs text-white">Graphic</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color scheme */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-aida-magenta" />
                      <span>Color Palette</span>
                    </h3>
                    <div className="p-4 bg-black/30 rounded-md border border-gray-800/50">
                      <div className="flex gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-blue-500 border border-white/25 shadow-sm"></div>
                        <div className="h-8 w-8 rounded-full bg-amber-500 border border-white/25 shadow-sm"></div>
                        <div className="h-8 w-8 rounded-full bg-indigo-700 border border-white/25 shadow-sm"></div>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-black/50 border border-white/25 shadow-sm cursor-pointer">
                          <Paperclip size={16} className="text-white/70" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full justify-center bg-black/50 border-gray-800/50 hover:bg-aida-magenta/20 hover:border-aida-magenta/50">
                        Generate Palette
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Colonna destra */}
                <div className="space-y-6">
                  {/* Mood */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Wand2 size={16} className="text-aida-magenta" />
                      <span>Mood & Atmosphere</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-aida-magenta/20 border-aida-magenta/50 text-white">
                        Professional
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-magenta/20">
                        Upbeat
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-magenta/20">
                        Dramatic
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-magenta/20">
                        Minimalist
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-magenta/20">
                        Nostalgic
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-aida-magenta/20">
                        Futuristic
                      </Button>
                    </div>
                  </div>
                  
                  {/* Effects */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-aida-magenta" />
                      <span>Visual Effects</span>
                    </h3>
                    <div className="p-4 bg-black/30 rounded-md border border-gray-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Depth of Field</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-aida-magenta"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Lighting Intensity</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-aida-magenta"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Film Grain</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-aida-magenta"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button className="bg-aida-magenta hover:bg-aida-magenta/80 text-white px-6" onClick={() => setActiveSettingsPanel(null)}>
                  Apply Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Finestra Cast */}
        {activeSettingsPanel === 'cast' && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-3 sm:p-6 pt-14 sm:pt-16 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border border-gray-700 bg-black/50"
                onClick={() => setActiveSettingsPanel(null)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-5 sm:mb-8">
                <Users size={24} className="text-emerald-500" />
                <h2 className="text-xl sm:text-2xl font-light text-white">Character Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                {/* Colonna sinistra */}
                <div className="space-y-6">
                  {/* Character type */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <User size={16} className="text-emerald-500" />
                      <span>Character Type</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-emerald-500/20 border-emerald-500/50 text-white">
                        Human
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-emerald-500/20">
                        Animated
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-emerald-500/20">
                        Abstract
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-emerald-500/20">
                        Symbolic
                      </Button>
                    </div>
                  </div>
                  
                  {/* Character generations */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-500" />
                        <span>Character Models</span>
                      </h3>
                      <Button variant="outline" size="sm" className="h-7 bg-black/30 border-gray-800/50 hover:bg-emerald-500/20 hover:border-emerald-500/50">
                        Generate New
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative aspect-square rounded-md overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        <div className="absolute inset-0 border-2 border-emerald-500 rounded-md"></div>
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-[10px] text-white">Male Presenter</span>
                        </div>
                      </div>
                      <div className="relative aspect-square rounded-md overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        <div className="absolute inset-0 border-2 border-transparent rounded-md opacity-0 group-hover:opacity-100 group-hover:border-white/30"></div>
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-[10px] text-white">Female Executive</span>
                        </div>
                      </div>
                      <div className="relative aspect-square rounded-md overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        <div className="absolute inset-0 border-2 border-transparent rounded-md opacity-0 group-hover:opacity-100 group-hover:border-white/30"></div>
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-[10px] text-white">Digital Avatar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Colonna destra */}
                <div className="space-y-6">
                  {/* Character roles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Type size={16} className="text-emerald-500" />
                        <span>Characters</span>
                      </h3>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-emerald-400 bg-black/30 border-gray-800/50 hover:bg-emerald-500/20 hover:border-emerald-500/50">
                        <Paperclip size={12} className="mr-1" />
                        Add Character
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-black/30 rounded-md p-3 border border-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Main Character</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                              <Sliders size={12} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                              <X size={12} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Professional business presenter, male, 30-40 years</p>
                      </div>
                      
                      <div className="bg-black/30 rounded-md p-3 border border-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Supporting Character</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                              <Sliders size={12} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                              <X size={12} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Customer representative, female, 25-35 years</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button className="bg-emerald-500 hover:bg-emerald-500/80 text-white px-6" onClick={() => setActiveSettingsPanel(null)}>
                  Apply Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Finestra Board */}
        {activeSettingsPanel === 'board' && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-3 sm:p-6 pt-14 sm:pt-16 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border border-gray-700 bg-black/50"
                onClick={() => setActiveSettingsPanel(null)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-5 sm:mb-8">
                <Layout size={24} className="text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-light text-white">Storyboard Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-5 sm:gap-8">
                {/* Scene frames con impostazioni e input */}
                <div className="space-y-6">
                  {/* Impostazioni generali */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Aspect Ratio */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Layers size={16} className="text-amber-500" />
                        <span>Aspect Ratio</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" size="sm" 
                          className={`justify-start px-3 ${aspectRatio === '16:9' ? 'bg-amber-500/20 border-amber-500/50 text-white' : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-amber-500/20'}`}
                          onClick={() => setAspectRatio('16:9')}
                        >
                          16:9
                        </Button>
                        <Button variant="outline" size="sm" 
                          className={`justify-start px-3 ${aspectRatio === '9:16' ? 'bg-amber-500/20 border-amber-500/50 text-white' : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-amber-500/20'}`}
                          onClick={() => setAspectRatio('9:16')}
                        >
                          9:16
                        </Button>
                        <Button variant="outline" size="sm" 
                          className={`justify-start px-3 ${aspectRatio === '1:1' ? 'bg-amber-500/20 border-amber-500/50 text-white' : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-amber-500/20'}`}
                          onClick={() => setAspectRatio('1:1')}
                        >
                          1:1
                        </Button>
                      </div>
                    </div>
                    
                    {/* Durata */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Clock size={16} className="text-amber-500" />
                        <span>Duration</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" size="sm" 
                          className={`justify-start px-3 ${duration === '15' ? 'bg-amber-500/20 border-amber-500/50 text-white' : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-amber-500/20'}`}
                          onClick={() => setDuration('15')}
                        >
                          15s
                        </Button>
                        <Button variant="outline" size="sm" 
                          className={`justify-start px-3 ${duration === '30' ? 'bg-amber-500/20 border-amber-500/50 text-white' : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-amber-500/20'}`}
                          onClick={() => setDuration('30')}
                        >
                          30s
                        </Button>
                        <Button variant="outline" size="sm" 
                          className={`justify-start px-3 ${duration === '60' ? 'bg-amber-500/20 border-amber-500/50 text-white' : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-amber-500/20'}`}
                          onClick={() => setDuration('60')}
                        >
                          60s
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messaggio di errore per Kling */}
                  {klingErrorMessage && (
                    <div className="bg-red-900/30 border border-red-800 p-2 rounded-md text-red-200 text-xs">
                      {klingErrorMessage}
                    </div>
                  )}
                  
                  {/* Titolo per la sezione frames */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Film size={16} className="text-amber-500" />
                      <span>Scene Frames ({sceneCount})</span>
                    </h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 flex items-center justify-center text-gray-400 bg-black/20"
                        onClick={() => setSceneCount(Math.max(3, sceneCount - 1))}
                        disabled={sceneCount <= 3}
                      >
                        -
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 flex items-center justify-center text-gray-400 bg-black/20"
                        onClick={() => setSceneCount(Math.min(12, sceneCount + 1))}
                        disabled={sceneCount >= 12}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  
                  {/* Grid di frames con input sotto ciascuno */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Frame 1 */}
                    <div className="space-y-2">
                      <div 
                        className={`relative aspect-video rounded-md overflow-hidden cursor-pointer ${activeFrame === 0 ? 'ring-2 ring-amber-500' : ''}`}
                        onClick={() => setFrameAsActive(0)}
                      >
                        {klingResults[0] ? (
                          <img src={klingResults[0]} alt="Frame 1" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        )}
                        <div className={`absolute inset-0 border-2 ${activeFrame === 0 ? 'border-amber-500' : 'border-transparent'} rounded-md ${activeFrame !== 0 ? 'opacity-0 hover:opacity-100 hover:border-white/30' : ''}`}></div>
                        <div className="absolute top-1 left-2 text-[10px] text-white bg-black/50 px-1 rounded">1</div>
                        {isGeneratingWithKling && activeFrame === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                          </div>
                        )}
                      </div>
                      <textarea
                        className="w-full p-2 h-16 bg-black/40 border border-gray-800 rounded-md text-xs text-white resize-none"
                        placeholder="Descrivi la scena..."
                        value={framePrompts[0]}
                        onChange={(e) => handleFramePromptChange(0, e.target.value)}
                        disabled={isGeneratingWithKling && activeFrame === 0}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-7 bg-black/30 border-gray-800/50 hover:bg-amber-500/20 hover:border-amber-500/50"
                        disabled={isGeneratingWithKling || !framePrompts[0] || framePrompts[0].length < 10}
                        onClick={() => generateSingleFrame(0)}
                      >
                        {isGeneratingWithKling && activeFrame === 0 ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : "Generate Frame"}
                      </Button>
                    </div>
                    
                    {/* Frame 2 */}
                    <div className="space-y-2">
                      <div 
                        className={`relative aspect-video rounded-md overflow-hidden cursor-pointer ${activeFrame === 1 ? 'ring-2 ring-amber-500' : ''}`}
                        onClick={() => setFrameAsActive(1)}
                      >
                        {klingResults[1] ? (
                          <img src={klingResults[1]} alt="Frame 2" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        )}
                        <div className={`absolute inset-0 border-2 ${activeFrame === 1 ? 'border-amber-500' : 'border-transparent'} rounded-md ${activeFrame !== 1 ? 'opacity-0 hover:opacity-100 hover:border-white/30' : ''}`}></div>
                        <div className="absolute top-1 left-2 text-[10px] text-white bg-black/50 px-1 rounded">2</div>
                        {isGeneratingWithKling && activeFrame === 1 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                          </div>
                        )}
                      </div>
                      <textarea
                        className="w-full p-2 h-16 bg-black/40 border border-gray-800 rounded-md text-xs text-white resize-none"
                        placeholder="Descrivi la scena..."
                        value={framePrompts[1]}
                        onChange={(e) => handleFramePromptChange(1, e.target.value)}
                        disabled={isGeneratingWithKling && activeFrame === 1}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-7 bg-black/30 border-gray-800/50 hover:bg-amber-500/20 hover:border-amber-500/50"
                        disabled={isGeneratingWithKling || !framePrompts[1] || framePrompts[1].length < 10}
                        onClick={() => generateSingleFrame(1)}
                      >
                        {isGeneratingWithKling && activeFrame === 1 ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : "Generate Frame"}
                      </Button>
                    </div>
                    
                    {/* Frame 3 */}
                    <div className="space-y-2">
                      <div 
                        className={`relative aspect-video rounded-md overflow-hidden cursor-pointer ${activeFrame === 2 ? 'ring-2 ring-amber-500' : ''}`}
                        onClick={() => setFrameAsActive(2)}
                      >
                        {klingResults[2] ? (
                          <img src={klingResults[2]} alt="Frame 3" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                        )}
                        <div className={`absolute inset-0 border-2 ${activeFrame === 2 ? 'border-amber-500' : 'border-transparent'} rounded-md ${activeFrame !== 2 ? 'opacity-0 hover:opacity-100 hover:border-white/30' : ''}`}></div>
                        <div className="absolute top-1 left-2 text-[10px] text-white bg-black/50 px-1 rounded">3</div>
                        {isGeneratingWithKling && activeFrame === 2 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                          </div>
                        )}
                      </div>
                      <textarea
                        className="w-full p-2 h-16 bg-black/40 border border-gray-800 rounded-md text-xs text-white resize-none"
                        placeholder="Descrivi la scena..."
                        value={framePrompts[2]}
                        onChange={(e) => handleFramePromptChange(2, e.target.value)}
                        disabled={isGeneratingWithKling && activeFrame === 2}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-7 bg-black/30 border-gray-800/50 hover:bg-amber-500/20 hover:border-amber-500/50"
                        disabled={isGeneratingWithKling || !framePrompts[2] || framePrompts[2].length < 10}
                        onClick={() => generateSingleFrame(2)}
                      >
                        {isGeneratingWithKling && activeFrame === 2 ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : "Generate Frame"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button className="bg-amber-500 hover:bg-amber-500/80 text-white px-6" onClick={() => setActiveSettingsPanel(null)}>
                  Apply Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Finestra AIDA AI Hub */}
        {activeSettingsPanel === 'aida' && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-3 sm:p-6 pt-14 sm:pt-16 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border border-gray-700 bg-black/50"
                onClick={() => setActiveSettingsPanel(null)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-5 sm:mb-8">
                <Sparkles size={24} className="text-purple-500" />
                <h2 className="text-xl sm:text-2xl font-light text-white">AIDA AI Hub</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                {/* Colonna sinistra */}
                <div className="space-y-6">
                  {/* Modalità di interazione */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <MessageSquare size={16} className="text-purple-500" />
                      <span>Interaction Mode</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-purple-500/20 border-purple-500/50 text-white">
                        Conversational
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-purple-500/20">
                        Direct Commands
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-purple-500/20">
                        Guided Flow
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-purple-500/20">
                        Expert Mode
                      </Button>
                    </div>
                  </div>
                  
                  {/* Personalità */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <UserCircle size={16} className="text-purple-500" />
                      <span>AI Personality</span>
                    </h3>
                    <div className="p-4 bg-black/30 rounded-md border border-gray-800/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Creativity Level</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-purple-500"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Helpfulness</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Technical Details</span>
                        <div className="flex gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-purple-500"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Colonna destra */}
                <div className="space-y-6">
                  {/* Notifiche da altri agenti */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Bell size={16} className="text-purple-500" />
                      <span>Agent Notifications</span>
                    </h3>
                    <div className="p-4 bg-black/30 rounded-md border border-gray-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-cyan-500" />
                          <span className="text-sm text-gray-300">Story Agent</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brush size={14} className="text-aida-magenta" />
                          <span className="text-sm text-gray-300">Style Agent</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-emerald-500" />
                          <span className="text-sm text-gray-300">Cast Agent</span>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookText size={14} className="text-aida-blue" />
                          <span className="text-sm text-gray-300">Script Agent</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layout size={14} className="text-amber-500" />
                          <span className="text-sm text-gray-300">Board Agent</span>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image size={14} className="text-indigo-500" />
                          <span className="text-sm text-gray-300">Media Agent</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  {/* Memory settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Brain size={16} className="text-purple-500" />
                      <span>Memory Settings</span>
                    </h3>
                    <div className="p-4 bg-black/30 rounded-md border border-gray-800/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Conversation Memory</span>
                        <div>
                          <Select defaultValue="medium">
                            <SelectTrigger className="w-32 h-8 bg-black/50 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="short">Short</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="long">Long</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Project Memory</span>
                        <div>
                          <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-purple-500/20 border-purple-500/50 text-white">
                            Always On
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button className="bg-purple-500 hover:bg-purple-500/80 text-white px-6" onClick={() => setActiveSettingsPanel(null)}>
                  Apply Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Finestra Story */}
        {activeSettingsPanel === 'story' && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-3 sm:p-6 pt-14 sm:pt-16 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border border-gray-700 bg-black/50"
                onClick={() => setActiveSettingsPanel(null)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-5 sm:mb-8">
                <BookOpen size={24} className="text-cyan-500" />
                <h2 className="text-xl sm:text-2xl font-light text-white">Storytelling Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                {/* Colonna sinistra */}
                <div className="space-y-6">
                  {/* Story structure */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Layers size={16} className="text-cyan-500" />
                      <span>Narrative Structure</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-cyan-500/20 border-cyan-500/50 text-white">
                        Classic (Intro → Conflict → Resolution)
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-cyan-500/20">
                        AIDA (Attention → Interest → Desire → Action)
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-cyan-500/20">
                        Hero's Journey (Abbreviated)
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-cyan-500/20">
                        Problem-Solution-Result
                      </Button>
                    </div>
                  </div>
                  
                  {/* Key themes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-cyan-500" />
                        <span>Key Themes</span>
                      </h3>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-cyan-400 bg-black/30 border-gray-800/50 hover:bg-cyan-500/20 hover:border-cyan-500/50">
                        <Paperclip size={12} className="mr-1" />
                        Add Theme
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-black/30 rounded-md border border-gray-800/50">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="bg-cyan-500/20 text-white text-xs px-2 py-1 rounded-full border border-cyan-500/50 flex items-center">
                          Innovation
                          <X size={10} className="ml-1 cursor-pointer" />
                        </div>
                        <div className="bg-cyan-500/20 text-white text-xs px-2 py-1 rounded-full border border-cyan-500/50 flex items-center">
                          Sustainability
                          <X size={10} className="ml-1 cursor-pointer" />
                        </div>
                        <div className="bg-cyan-500/20 text-white text-xs px-2 py-1 rounded-full border border-cyan-500/50 flex items-center">
                          Growth
                          <X size={10} className="ml-1 cursor-pointer" />
                        </div>
                      </div>
                      <div className="relative">
                        <Input 
                          className="bg-black/30 border-gray-800 text-white placeholder-gray-500 text-sm"
                          placeholder="Add a new theme..."
                        />
                        <Button variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0">
                          <Paperclip size={14} className="text-cyan-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Colonna destra */}
                <div className="space-y-6">
                  {/* Pacing */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <SlidersHorizontal size={16} className="text-cyan-500" />
                      <span>Pacing</span>
                    </h3>
                    <div className="p-4 bg-black/30 rounded-md border border-gray-800/50 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Speed</span>
                          <div className="flex gap-1">
                            <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                            <div className="w-12 h-1.5 rounded-full bg-cyan-500"></div>
                            <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Complexity</span>
                          <div className="flex gap-1">
                            <div className="w-12 h-1.5 rounded-full bg-cyan-500"></div>
                            <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                            <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Emotional Intensity</span>
                          <div className="flex gap-1">
                            <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                            <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                            <div className="w-12 h-1.5 rounded-full bg-cyan-500"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Audience */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Users size={16} className="text-cyan-500" />
                      <span>Target Audience</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-cyan-500/20 border-cyan-500/50 text-white">
                        Professionals
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-cyan-500/20">
                        General Public
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-cyan-500/20">
                        Technical
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-cyan-500/20">
                        Investors
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-cyan-500/20">
                        Customers
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start px-3 bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-white hover:bg-cyan-500/20">
                        Employees
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button className="bg-cyan-500 hover:bg-cyan-500/80 text-white px-6" onClick={() => setActiveSettingsPanel(null)}>
                  Apply Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header con logo e navigazione */}
      <motion.header 
        className="flex justify-between items-center h-14 px-2 sm:px-4 border-b border-gray-800 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo AIDA animato con link alla home */}
        <motion.div 
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/" className="flex items-center">
            <NewAidaLogoAnimation size={32} className="p-0.5" />
          </Link>
        </motion.div>
        
        {/* Tabs centrali VIDEO/IMAGE/LIBRARY/TEMPLATE con effetti luce e testo sottile */}
        <div className="flex items-center justify-center absolute left-0 right-0 mx-auto z-10 w-full max-w-[320px] sm:max-w-[420px]">
          <div className="flex items-center justify-center w-full">
            <Button
              variant="ghost"
              className={`px-2 sm:px-3 md:px-4 py-2 hover:bg-gray-900/30 rounded-none transition-all ${activeTab === 'video' ? 'border-b-2 border-white text-white' : 'border-transparent text-gray-500'}`}
              onClick={() => handleTabChange('video')}
            >
              <Video className="h-4 w-4 sm:mr-1" />
              <span className="font-light text-xs tracking-wide hidden sm:inline">VIDEO</span>
            </Button>
            <Button
              variant="ghost"
              className={`px-2 sm:px-3 md:px-4 py-2 hover:bg-gray-900/30 rounded-none transition-all ${activeTab === 'image' ? 'border-b-2 border-white text-white' : 'border-transparent text-gray-500'}`}
              onClick={() => handleTabChange('image')}
            >
              <Image className="h-4 w-4 sm:mr-1" />
              <span className="font-light text-xs tracking-wide hidden sm:inline">IMAGE</span>
            </Button>
            <Button
              variant="ghost"
              className={`px-2 sm:px-3 md:px-4 py-2 hover:bg-gray-900/30 rounded-none transition-all ${activeTab === 'template' ? 'border-b-2 border-white text-white' : 'border-transparent text-gray-500'}`}
              onClick={() => handleTabChange('template')}
            >
              <FileType className="h-4 w-4 sm:mr-1" />
              <span className="font-light text-xs tracking-wide hidden sm:inline">TEMPLATE</span>
            </Button>
            <Button
              variant="ghost"
              className={`px-2 sm:px-3 md:px-4 py-2 hover:bg-gray-900/30 rounded-none transition-all ${activeTab === 'library' ? 'border-b-2 border-white text-white' : 'border-transparent text-gray-500'}`}
              onClick={() => handleTabChange('library')}
            >
              <Folder className="h-4 w-4 sm:mr-1" />
              <span className="font-light text-xs tracking-wide hidden sm:inline">LIBRARY</span>
            </Button>
          </div>
        </div>

        {/* Credits e profilo utente */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto mr-1 sm:mr-4">
          <Link href="/plan">
            <Badge 
              className="bg-gradient-to-r from-red-500 to-aida-magenta border-0 text-white rounded-full px-2 sm:px-3 font-light text-xs hover:from-red-600 hover:to-aida-magenta/90 transition-all cursor-pointer shadow-sm hover:shadow-aida-magenta/20 flex items-center gap-1"
            >
              <Coins size={12} className="mr-0.5" />
              262
            </Badge>
          </Link>
          
          {/* User Button con dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="rounded-full h-8 w-8 p-0 border border-gray-800/50 bg-black/30 hover:bg-black/50 hover:border-gray-700 transition-all group"
              >
                <span className="sr-only">User menu</span>
                <User size={14} className="text-gray-400 group-hover:text-white transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-40 mr-4 bg-black/90 backdrop-blur-md border-gray-800 text-gray-200">
              <DropdownMenuLabel className="text-xs font-normal text-gray-400">Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="gap-2 text-sm hover:bg-gray-800/80 cursor-pointer">
                <User size={14} className="text-gray-400" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm hover:bg-gray-800/80 cursor-pointer">
                <Settings size={14} className="text-gray-400" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm hover:bg-gray-800/80 cursor-pointer">
                <CreditCard size={14} className="text-gray-400" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="gap-2 text-sm hover:bg-gray-800/80 cursor-pointer">
                <LogOut size={14} className="text-gray-400" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      {/* Alone luminoso animato in background - opacità ulteriormente ridotta */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vh] -translate-x-1/2 -translate-y-1/2 ambient-glow opacity-ultra-low">
          <div className="absolute inset-0 rounded-full bg-[#0092E3] blur-[180px]"></div>
          <div className="absolute inset-0 rounded-full bg-[#DD39B0] blur-[220px] mix-blend-screen opacity-70"></div>
        </div>
      </div>
      
      {/* Main Content - layout 100% schermo, completamente responsive */}
      <main className="h-[calc(100vh-56px)] w-full overflow-y-auto relative px-0 no-scrollbar bg-transparent overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab !== 'library' ? (
            <motion.div
              key={activeTab === 'video' ? "video-creation" : activeTab === 'image' ? "image-creation" : "template-selection"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-end min-h-[calc(100vh-56px)] pb-16"
            >
              {/* Contenuto centrato verticalmente e orizzontalmente */}
              {activeTab === 'template' ? (
                <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
                  {/* Intestazione e controlli */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                    <h2 className="text-xl font-light flex items-center gap-2">
                      <FileType className="text-yellow-400" />
                      Template Gallery
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-60 bg-black/30 border-gray-800/50 placeholder-gray-500 text-sm"
                      />
                      
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-black/30 border-gray-800/50 hover:bg-black/50">
                              {templateFilters.sort === 'new' && 'Newest'}
                              {templateFilters.sort === 'popular' && 'Popular'}
                              {templateFilters.sort === 'recommended' && 'Recommended'}
                              {templateFilters.sort === 'alphabetical' && 'A-Z'}
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40 bg-black/80 backdrop-blur-md border-gray-800">
                            <DropdownMenuItem onClick={() => changeSortOrder('new')} className="text-sm focus:bg-gray-900/60">
                              <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
                              <span>Newest</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeSortOrder('popular')} className="text-sm focus:bg-gray-900/60">
                              <TrendingUp className="mr-2 h-4 w-4 text-red-400" />
                              <span>Popular</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeSortOrder('recommended')} className="text-sm focus:bg-gray-900/60">
                              <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                              <span>Recommended</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeSortOrder('alphabetical')} className="text-sm focus:bg-gray-900/60">
                              <AlignLeft className="mr-2 h-4 w-4 text-gray-400" />
                              <span>Alphabetical</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`bg-black/30 border-gray-800/50 hover:bg-black/50 ${showFilters ? 'border-aida-blue text-aida-blue' : ''}`}
                          onClick={handleFilterToggle}
                        >
                          <SlidersHorizontal size={16} className="mr-1" />
                          Filters
                          {(templateFilters.categories.length > 0 || 
                            templateFilters.aspectRatio.length > 0 || 
                            templateFilters.duration.length > 0) && (
                            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-aida-blue text-white">
                              {templateFilters.categories.length + 
                               templateFilters.aspectRatio.length + 
                               templateFilters.duration.length}
                            </Badge>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtri avanzati (visibili solo se attivati) */}
                  {showFilters && (
                    <div className="mb-6 p-4 rounded-md bg-black/30 border border-gray-800/50 backdrop-blur-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Colonna 1: Categorie */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Categories</h3>
                          <div className="flex flex-wrap gap-2">
                            {['commercial', 'social', 'educational', 'corporate', 'documentary'].map((category) => (
                              <Badge 
                                key={category}
                                variant={templateFilters.categories.includes(category) ? 'default' : 'outline'}
                                className={`cursor-pointer ${templateFilters.categories.includes(category) 
                                  ? 'bg-aida-blue hover:bg-aida-blue/80' 
                                  : 'bg-black/30 hover:bg-gray-900/50'}`}
                                onClick={() => toggleCategoryFilter(category)}
                              >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Colonna 2: Aspect Ratio */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Aspect Ratio</h3>
                          <div className="flex flex-wrap gap-2">
                            {['16:9', '9:16', '1:1', '4:5'].map((ratio) => (
                              <Badge 
                                key={ratio}
                                variant={templateFilters.aspectRatio.includes(ratio) ? 'default' : 'outline'}
                                className={`cursor-pointer ${templateFilters.aspectRatio.includes(ratio) 
                                  ? 'bg-purple-600 hover:bg-purple-600/80' 
                                  : 'bg-black/30 hover:bg-gray-900/50'}`}
                                onClick={() => toggleAspectRatioFilter(ratio)}
                              >
                                {ratio}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Colonna 3: Durata */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Duration</h3>
                          <div className="flex flex-wrap gap-2">
                            {['0-30', '30-60', '60-120', '120-300', '300-600', '600-'].map((duration) => (
                              <Badge 
                                key={duration}
                                variant={templateFilters.duration.includes(duration) ? 'default' : 'outline'}
                                className={`cursor-pointer ${templateFilters.duration.includes(duration) 
                                  ? 'bg-amber-600 hover:bg-amber-600/80' 
                                  : 'bg-black/30 hover:bg-gray-900/50'}`}
                                onClick={() => toggleDurationFilter(duration)}
                              >
                                {duration === '0-30' && 'Under 30s'}
                                {duration === '30-60' && '30s - 1min'}
                                {duration === '60-120' && '1-2 mins'}
                                {duration === '120-300' && '2-5 mins'}
                                {duration === '300-600' && '5-10 mins'}
                                {duration === '600-' && '10+ mins'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Pulsanti azione filtri */}
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-black/30 border-gray-800/50 hover:bg-black/50 mr-2"
                          onClick={() => {
                            setTemplateFilters({
                              categories: [],
                              aspectRatio: [],
                              duration: [],
                              sort: 'new'
                            });
                            setSearchQuery('');
                          }}
                        >
                          Reset All
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-aida-blue hover:bg-aida-blue/80"
                          onClick={() => setShowFilters(false)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Layout template cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    {filteredTemplates.length > 0 ? (
                      filteredTemplates.map((template) => (
                        <TemplateCard 
                          key={template.id}
                          template={template}
                          onClick={() => handleTemplateSelect(template)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-12">
                        <FileSearch className="h-16 w-16 text-gray-500 mb-4" />
                        <p className="text-gray-400 text-center">No templates found matching your criteria</p>
                        <Button 
                          variant="link" 
                          className="mt-2 text-aida-blue"
                          onClick={() => {
                            setTemplateFilters({
                              categories: [],
                              aspectRatio: [],
                              duration: [],
                              sort: 'new'
                            });
                            setSearchQuery('');
                          }}
                        >
                          Clear all filters
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Dettaglio template in modale */}
                  {showTemplateDetails && selectedTemplate && (
                    <Dialog open={showTemplateDetails} onOpenChange={setShowTemplateDetails}>
                      <DialogContent className="sm:max-w-4xl bg-gray-950/80 backdrop-blur-lg border-gray-800 p-0 overflow-hidden">
                        <div className="grid md:grid-cols-5 h-full">
                          {/* Preview lato sinistro */}
                          <div className="md:col-span-3 bg-gradient-to-br from-black to-gray-900">
                            {selectedTemplate.thumbnailUrl ? (
                              <div className="w-full h-full min-h-[300px] relative">
                                <img 
                                  src={selectedTemplate.thumbnailUrl} 
                                  alt={selectedTemplate.title} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <h3 className="text-xl font-medium text-white">{selectedTemplate.title}</h3>
                                  <p className="text-sm text-gray-300 mt-1">{selectedTemplate.description}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full min-h-[300px] bg-black flex items-center justify-center">
                                <FileType className="h-16 w-16 text-gray-700" />
                              </div>
                            )}
                          </div>

                          {/* Dettagli lato destro */}
                          <div className="md:col-span-2 p-5 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-5">
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Categories</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTemplate.categories ? 
                                    selectedTemplate.categories.map((cat, i) => (
                                      <Badge key={`${cat}-${i}`} className="bg-gray-800/70">
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                      </Badge>
                                    )) : 
                                    <Badge className="bg-gray-800/70">
                                      {selectedTemplate.category.charAt(0).toUpperCase() + selectedTemplate.category.slice(1)}
                                    </Badge>
                                  }
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Specifications</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedTemplate.aspectRatio && (
                                    <div className="rounded bg-gray-900/50 border border-gray-800/60 px-3 py-2">
                                      <div className="text-xs text-gray-500">Aspect Ratio</div>
                                      <div className="text-sm">{selectedTemplate.aspectRatio}</div>
                                    </div>
                                  )}
                                  {selectedTemplate.duration && (
                                    <div className="rounded bg-gray-900/50 border border-gray-800/60 px-3 py-2">
                                      <div className="text-xs text-gray-500">Duration</div>
                                      <div className="text-sm">
                                        {selectedTemplate.duration < 60 
                                          ? `${selectedTemplate.duration}s` 
                                          : `${Math.floor(selectedTemplate.duration / 60)}m ${selectedTemplate.duration % 60}s`}
                                      </div>
                                    </div>
                                  )}
                                  {selectedTemplate.style && (
                                    <div className="rounded bg-gray-900/50 border border-gray-800/60 px-3 py-2">
                                      <div className="text-xs text-gray-500">Style</div>
                                      <div className="text-sm">{selectedTemplate.style}</div>
                                    </div>
                                  )}
                                  {selectedTemplate.targetAudience && (
                                    <div className="rounded bg-gray-900/50 border border-gray-800/60 px-3 py-2">
                                      <div className="text-xs text-gray-500">Target</div>
                                      <div className="text-sm">{selectedTemplate.targetAudience}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {selectedTemplate.platforms && selectedTemplate.platforms.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-400 mb-1">Optimized For</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedTemplate.platforms.map((platform, i) => (
                                      <Badge key={`${platform}-${i}`} variant="outline" className="bg-transparent">
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-400 mb-1">Tags</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedTemplate.tags.map((tag, i) => (
                                      <Badge key={`${tag}-${i}`} variant="outline" className="bg-transparent text-xs">
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="pt-4">
                                <Button
                                  className="w-full bg-aida-blue hover:bg-aida-blue/90 text-white"
                                  onClick={handleCreateFromTemplate}
                                >
                                  <Video className="mr-2 h-4 w-4" />
                                  Use This Template
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ) : activeTab === 'image' ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full">
                  <div className="w-20 h-20 mb-6 opacity-30">
                    <Image size={80} strokeWidth={1} className="text-gray-500" />
                  </div>
                  <h2 className="text-2xl font-light text-center mb-4">Image Generation</h2>
                  <p className="text-gray-500 text-lg">Coming soon...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-end h-full px-4 sm:px-0">
                  
                  {/* Area della chat - più compatta e spostata in alto per fare spazio alla barra e ai moduli in basso */}
                  <div className="w-full max-w-5xl px-4 overflow-y-auto flex-1 flex flex-col mb-20">
                    {chatMessages.length > 0 ? (
                      <div className="space-y-2 py-3 flex-1">
                        {chatMessages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[85%] sm:max-w-[70%] rounded-md px-3 py-2 ${
                                message.sender === 'user' 
                                  ? 'bg-gradient-to-br from-aida-magenta/30 to-aida-blue/30 border border-gray-800/50 backdrop-blur-sm' 
                                  : 'bg-black/30 border border-gray-800/50 backdrop-blur-sm'
                              }`}
                            >
                              {message.text === "typing-indicator" ? (
                                <div className="typing-indicator text-xs sm:text-sm text-gray-400"></div>
                              ) : (
                                <p className="text-xs sm:text-sm">{message.text}</p>
                              )}
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2">
                                  {message.attachments.map((attachment, index) => (
                                    <div key={index} className="mt-2">
                                      {attachment.type === 'image' && attachment.url && (
                                        <img 
                                          src={attachment.url} 
                                          alt="User uploaded" 
                                          className="max-w-full max-h-48 object-contain rounded-md border border-gray-700/50 cursor-pointer"
                                          onClick={() => handleImageClick(attachment.url || '')}
                                        />
                                      )}
                                      {attachment.type === 'image' && attachment.file && !attachment.url && (
                                        <img 
                                          src={URL.createObjectURL(attachment.file)} 
                                          alt="User uploaded" 
                                          className="max-w-full max-h-48 object-contain rounded-md border border-gray-700/50 cursor-pointer" 
                                          onClick={() => attachment.file && handleImageClick(URL.createObjectURL(attachment.file))}
                                        />
                                      )}
                                      {attachment.type === 'text' && (
                                        <div 
                                          className="border border-gray-700/50 rounded-md p-1.5 text-xs bg-black/20 flex items-center gap-1.5 cursor-pointer hover:bg-gray-800/40 transition-colors"
                                          onClick={() => attachment.file && handleTextFileClick(attachment.file)}
                                        >
                                          <FileType size={14} className="text-aida-blue flex-shrink-0" />
                                          <div className="line-clamp-1 flex-1">
                                            {attachment.content || attachment.file?.name}
                                          </div>
                                          {attachment.file && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-5 w-5 rounded-full bg-gray-800/50 hover:bg-gray-700/50"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleTextFileClick(attachment.file!);
                                              }}
                                            >
                                              <Eye size={10} />
                                            </Button>
                                          )}
                                        </div>
                                      )}
                                      {attachment.type === 'audio' && (
                                        <div className="flex items-center gap-1.5 bg-gray-800/60 backdrop-blur-sm rounded-md p-1.5">
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className={`h-6 w-6 rounded-full ${attachment.isPlaying ? 'bg-red-500' : 'bg-aida-blue'} text-white p-0`}
                                            onClick={() => {
                                              // Toggle audio playback
                                              const newAttachments = [...(message.attachments || [])];
                                              newAttachments[index] = {
                                                ...newAttachments[index],
                                                isPlaying: !attachment.isPlaying
                                              };
                                              
                                              // Trova l'audio element e gestisci play/pause
                                              const audioId = `audio-${message.id}-${index}`;
                                              const audioElement = document.getElementById(audioId) as HTMLAudioElement;
                                              
                                              if (audioElement) {
                                                if (attachment.isPlaying) {
                                                  audioElement.pause();
                                                } else {
                                                  audioElement.play();
                                                }
                                              }
                                              
                                              // Aggiorna lo stato
                                              setChatMessages(prev => 
                                                prev.map(m => m.id === message.id ? {...m, attachments: newAttachments} : m)
                                              );
                                            }}
                                          >
                                            {attachment.isPlaying ? <Pause size={12} /> : <Play size={12} />}
                                          </Button>
                                          
                                          <div className="flex-1">
                                            {/* Waveform simulata più piccola */}
                                            <div className="h-4 w-full flex items-center justify-center">
                                              {[...Array(16)].map((_, i) => (
                                                <div 
                                                  key={i} 
                                                  className="h-0.5 w-0.5 mx-px rounded-full bg-aida-blue opacity-70"
                                                  style={{
                                                    height: `${Math.max(1, Math.min(10, 2 + Math.sin(i * 0.8) * 4 + Math.random() * 2))}px`
                                                  }}
                                                ></div>
                                              ))}
                                            </div>
                                          </div>
                                          
                                          <div className="text-[10px] text-gray-400 min-w-[20px] text-right">
                                            {attachment.duration ? `${Math.round(attachment.duration)}s` : ''}
                                          </div>
                                          
                                          {/* Audio element hidden */}
                                          <audio 
                                            id={`audio-${message.id}-${index}`}
                                            src={attachment.url} 
                                            onEnded={() => {
                                              // Reset state when audio completes
                                              const newAttachments = [...(message.attachments || [])];
                                              newAttachments[index] = {
                                                ...newAttachments[index],
                                                isPlaying: false
                                              };
                                              setChatMessages(prev => 
                                                prev.map(m => m.id === message.id ? {...m, attachments: newAttachments} : m)
                                              );
                                            }}
                                            className="hidden"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1"></div>
                    )}
                  </div>
                  
                  {/* Container principale per la barra e i box dei moduli - posizionati in basso */}
                  <div className="w-full max-w-5xl mx-auto mt-auto fixed bottom-6 left-1/2 -translate-x-1/2 px-4">
                    {/* Indicatore progresso conversazionale AIDA Hub */}
                    {agencyActive && (
                      <div className="w-full mb-3 flex justify-center">
                        <div className="bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-full px-4 py-2 flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Brain size={14} className="text-purple-400" />
                            <span className="text-xs text-purple-400 font-medium">AIDA Hub</span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(step => (
                              <div
                                key={step}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  step < getPhaseNumber(agencyPhase)
                                    ? 'bg-green-400' 
                                    : step === getPhaseNumber(agencyPhase)
                                      ? 'bg-purple-400 animate-pulse' 
                                      : 'bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {getPhaseName(agencyPhase)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Barra di prompt sopra i box dei moduli */}
                    <div className="w-full mb-2">
                      <div className="relative mx-auto">
                        <Input 
                          value={promptText}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setPromptText(newValue);
                            setIsInputEmpty(newValue.trim() === '');
                          }}
                          onKeyDown={handleKeyDown}
                          className="w-full h-12 bg-black/30 border-gray-800/50 text-white placeholder-gray-400 pl-4 pr-24 py-2 rounded-full backdrop-blur-sm"
                          placeholder=""
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full text-gray-400 hover:text-white"
                            onClick={() => {
                              if (fileInputRef.current) {
                                fileInputRef.current.accept = "image/*";
                                fileInputRef.current.click();
                              }
                            }}
                          >
                            <Camera size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full text-gray-400 hover:text-white"
                            onClick={handleFileButtonClick}
                          >
                            <Paperclip size={16} />
                          </Button>
                          <Button 
                            ref={micButtonRef}
                            variant="ghost" 
                            size="icon"
                            className={`h-10 w-10 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-aida-blue'} text-white hover:bg-aida-blue/80 ml-1`}
                            onClick={!isInputEmpty || fileAttachment ? handleSendMessage : undefined}
                            onPointerDown={isInputEmpty && !fileAttachment ? handleMicButtonPointerDown : undefined}
                            onPointerUp={isInputEmpty && !fileAttachment ? handleMicButtonPointerUp : undefined}
                            onPointerLeave={isInputEmpty && !fileAttachment ? handleMicButtonPointerLeave : undefined}
                          >
                            {!isInputEmpty || fileAttachment ? <Send size={18} /> : <Mic size={18} />}
                          </Button>
                        </div>
                        
                        {/* Input file invisibile */}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/*,text/*"
                        />
                        
                        {/* Mostra l'anteprima dell'immagine caricata */}
                        {fileAttachment && fileAttachment.type.startsWith('image/') && showImagePreview && (
                          <div className="absolute left-0 -top-32 p-2 bg-gray-900/70 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <div className="relative">
                              <img 
                                src={URL.createObjectURL(fileAttachment)} 
                                alt="Preview" 
                                className="max-h-24 max-w-[200px] object-contain rounded-md"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                                onClick={() => {
                                  setFileAttachment(null);
                                  setShowImagePreview(false);
                                  setIsInputEmpty(promptText.trim() === '');
                                }}
                              >
                                <X size={10} />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Mostra l'anteprima di file di testo */}
                        {fileAttachment && (fileAttachment.type.startsWith('text/') || 
                            fileAttachment.type === 'application/pdf' || 
                            fileAttachment.type === 'application/msword' ||
                            fileAttachment.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                          <div className="absolute left-0 -top-20 p-2 bg-gray-900/70 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <div className="relative flex items-center gap-2 p-1 max-w-[220px]">
                              <FileType size={18} className="text-aida-blue flex-shrink-0" />
                              <div className="truncate text-sm text-gray-300">{fileAttachment.name}</div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex-shrink-0"
                                onClick={() => {
                                  setFileAttachment(null);
                                  setIsInputEmpty(promptText.trim() === '');
                                }}
                              >
                                <X size={10} />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Mostra l'allegato selezionato se presente e non è né un'immagine né un file di testo riconosciuto */}
                        {fileAttachment && !fileAttachment.type.startsWith('image/') && 
                          !fileAttachment.type.startsWith('text/') && 
                          fileAttachment.type !== 'application/pdf' && 
                          fileAttachment.type !== 'application/msword' &&
                          fileAttachment.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
                          <div className="absolute left-4 -bottom-8 text-xs text-gray-400 flex items-center gap-1">
                            <span>Allegato: {fileAttachment.name}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-full hover:bg-red-500/20"
                              onClick={() => setFileAttachment(null)}
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Box dei moduli (7 box in fila) in stile icone ridotte */}
                    <div className="w-full flex justify-between items-center space-x-1">
                      {/* AIDA AI Hub Box - Agente centrale */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-800/50 bg-black/30 backdrop-blur-sm hover:border-purple-500/50 hover:bg-black/50 hover:text-purple-500 transition-all"
                        onClick={() => toggleSettingsPanel('aida')}
                      >
                        <Sparkles size={16} className="text-gray-300" />
                      </Button>

                      {/* Story Box */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-800/50 bg-black/30 backdrop-blur-sm hover:border-cyan-500/50 hover:bg-black/50 hover:text-cyan-500 transition-all"
                        onClick={() => toggleSettingsPanel('story')}
                      >
                        <BookOpen size={16} className="text-gray-300" />
                      </Button>
                      
                      {/* Style Box */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-800/50 bg-black/30 backdrop-blur-sm hover:border-aida-magenta/50 hover:bg-black/50 hover:text-aida-magenta transition-all"
                        onClick={() => toggleSettingsPanel('style')}
                      >
                        <Brush size={16} className="text-gray-300" />
                      </Button>
                      
                      {/* Cast Box */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-800/50 bg-black/30 backdrop-blur-sm hover:border-emerald-500/50 hover:bg-black/50 hover:text-emerald-500 transition-all"
                        onClick={() => toggleSettingsPanel('cast')}
                      >
                        <Users size={16} className="text-gray-300" />
                      </Button>
                      
                      {/* Script Box */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-800/50 bg-black/30 backdrop-blur-sm hover:border-aida-blue/50 hover:bg-black/50 hover:text-aida-blue transition-all"
                        onClick={() => toggleSettingsPanel('script')}
                      >
                        <BookText size={16} className="text-gray-300" />
                      </Button>
                      
                      {/* Board Box */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-800/50 bg-black/30 backdrop-blur-sm hover:border-amber-500/50 hover:bg-black/50 hover:text-amber-500 transition-all"
                        onClick={() => toggleSettingsPanel('board')}
                      >
                        <Layout size={16} className="text-gray-300" />
                      </Button>
                      
                      {/* Media Box */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-800/50 bg-black/30 backdrop-blur-sm hover:border-indigo-500/50 hover:bg-black/50 hover:text-indigo-500 transition-all"
                        onClick={() => toggleSettingsPanel('media')}
                      >
                        <Image size={16} className="text-gray-300" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="library"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full px-4 py-4"
            >
              {/* Library/Projects Section */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 mt-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Bookmark className="text-red-400" />
                  My Library
                </h2>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white"
                    onClick={handleFilterToggle}  
                  >
                    <SlidersHorizontal size={18} />
                  </Button>
                  <Badge className="bg-red-500">{filteredProjects.length} projects</Badge>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : filteredProjects.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredProjects.map((project: Project, index: number) => (
                    <motion.div 
                      key={project.id} 
                      variants={itemVariants}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800/30 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-red-900/20 transition-shadow"
                    >
                      <ProjectCard
                        project={project}
                        onContinue={onContinueProject || (() => {})}
                        onDuplicate={onDuplicateProject || (() => {})}
                        onDelete={onDeleteProject || (() => {})}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 mb-2">No projects found. Create a new project or try different filters.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Style Selector Modal */}
      <StyleSelectorModal
        open={isStyleModalOpen}
        onOpenChange={setIsStyleModalOpen}
        onStyleSelect={handleStyleSelect}
      />
    </div>
  );
};

export default Launchpad;