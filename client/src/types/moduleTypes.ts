/**
 * Tipi di modulo disponibili in AIDA
 */
export type ModuleType = 
  | 'style'
  | 'storytelling'
  | 'characters'
  | 'media'
  | 'storyboard'
  | 'video'
  | 'audio'
  | 'text'
  | 'templates';

/**
 * Struttura di un modulo
 */
export interface ModuleInfo {
  type: ModuleType;
  title: string;
  description: string;
  icon?: string;
  progress?: number;
  isActive: boolean;
  isDisabled: boolean;
  isCompleted: boolean;
}