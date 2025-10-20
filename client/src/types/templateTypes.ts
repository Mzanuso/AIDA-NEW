/**
 * Struttura di un template
 */
export interface TemplateData {
  id: string;
  title: string;
  description: string;
  category: string;        // Categoria principale (per retrocompatibilità)
  categories?: string[];   // Multiple categorie/finalità d'uso
  tags: string[];          // Tag per la ricerca
  thumbnailUrl?: string;   // URL dell'immagine thumbnail
  aspectRatio?: string;    // Aspect ratio (16:9, 9:16, 1:1, 4:5, ecc.)
  duration?: number;       // Durata in secondi
  
  // Target platforms
  platforms?: string[];    // Piattaforme target (TikTok, Instagram, Facebook, LinkedIn, YouTube, ecc.)
  
  // Flags per status
  isNew?: boolean;         // Template nuovo
  isPopular?: boolean;     // Template popolare
  isRecommended?: boolean; // Template raccomandato
  
  // Metadati aggiuntivi
  style?: string;          // Stile visivo (Cinematic, Corporate, Dynamic, Minimal, ecc.)
  targetAudience?: string; // Pubblico target (Gen Z, Business, Educational, ecc.)
  music?: string;          // Tipo di musica
  usageRights?: string;    // Diritti di utilizzo
}