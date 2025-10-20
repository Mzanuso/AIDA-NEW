/**
 * Message Templates - Localized (IT + EN)
 * 
 * All user-facing messages from Orchestrator.
 * 
 * Design principles:
 * - Model-agnostic language (no "Midjourney", "FLUX", etc.)
 * - Focus on RESULTS, not technology
 * - Warm, helpful, conversational tone
 * - Clear timing and cost transparency
 */

import { Language } from '../utils/language-detector-simple';

export interface MessageTemplates {
  initial_menu: string;
  gallery_proposal: string;
  generation_started: string;
  generation_complete: string;
  artistic_model_unavailable: string;
  photographic_details: string;
}

type TemplateKey = keyof MessageTemplates;

interface TemplateVariables {
  description?: string;
  cost?: string;
  time?: string;
  url?: string;
  [key: string]: any;
}

/**
 * Italian Templates
 */
const IT_TEMPLATES: MessageTemplates = {
  initial_menu: `Perfetto! Come preferisci iniziare?

📸 **Scegli uno stile dalla gallery**
   Stili artistici e creativi già pronti
   ⏱️ ~20 secondi | 💰 ~€0.06

✍️ **Descrivi cosa vuoi**
   Massima flessibilità
   ⏱️ ~15 secondi | 💰 ~€0.05`,

  gallery_proposal: `Vuoi dare un'occhiata alla **gallery di stili**? 

Trovi stili artistici, fotografici e creativi già pronti. Ti bastano pochi secondi per scegliere quello che preferisci.

Usa il comando \`/gallery\` o \`mostra stili\` quando vuoi! 🎨`,

  generation_started: `Perfetto! Sto generando {{description}}...

⏱️ Tempo stimato: {{time}}
💰 Costo: {{cost}}

Ti avviso appena è pronto! ⚡`,

  generation_complete: `✨ **Fatto!** La tua {{description}} è pronta.

Ecco il risultato 👇`,

  artistic_model_unavailable: `⚠️ Gli stili artistici avanzati non sono al momento disponibili.

Posso comunque creare la tua immagine con qualità fotografica professionale. Procedo?`,

  photographic_details: `Perfetto! Dammi qualche dettaglio in più:

• Soggetto principale
• Ambiente/sfondo  
• Stile fotografico (es: professionale, naturale, drammatico)
• Particolari importanti

Più dettagli = risultato più preciso! 📸`
};

/**
 * English Templates
 */
const EN_TEMPLATES: MessageTemplates = {
  initial_menu: `Perfect! How would you like to start?

📸 **Choose a style from the gallery**
   Artistic and creative styles ready to use
   ⏱️ ~20 seconds | 💰 ~$0.06

✍️ **Describe what you want**
   Maximum flexibility
   ⏱️ ~15 seconds | 💰 ~$0.05`,

  gallery_proposal: `Want to check out the **style gallery**?

You'll find artistic, photographic, and creative styles ready to use. Just takes a few seconds to choose your favorite.

Use the \`/gallery\` or \`show styles\` command anytime! 🎨`,

  generation_started: `Perfect! Generating your {{description}}...

⏱️ Estimated time: {{time}}
💰 Cost: {{cost}}

I'll let you know when it's ready! ⚡`,

  generation_complete: `✨ **Done!** Your {{description}} is ready.

Here's the result 👇`,

  artistic_model_unavailable: `⚠️ Advanced artistic styles are currently unavailable.

I can still create your image with professional photographic quality. Shall I proceed?`,

  photographic_details: `Perfect! Give me a few more details:

• Main subject
• Environment/background
• Photographic style (e.g., professional, natural, dramatic)
• Important details

More details = more precise result! 📸`
};

/**
 * Get localized template
 * 
 * @param key - Template key
 * @param language - Language (it or en)
 * @param variables - Variables to interpolate
 * @returns Localized message with variables interpolated
 */
export function getTemplate(
  key: TemplateKey,
  language: Language = 'it',
  variables?: TemplateVariables
): string {
  // Get template collection
  const templates = language === 'en' ? EN_TEMPLATES : IT_TEMPLATES;
  
  // Get specific template
  let template = templates[key];
  
  // If template not found, return empty string
  if (!template) {
    return '';
  }

  // Interpolate variables
  if (variables) {
    Object.keys(variables).forEach(varKey => {
      const placeholder = `{{${varKey}}}`;
      const value = variables[varKey] || '';
      template = template.replace(new RegExp(placeholder, 'g'), value);
    });
  }

  return template;
}

/**
 * Get all templates for a language
 * 
 * @param language - Language
 * @returns All templates
 */
export function getAllTemplates(language: Language = 'it'): MessageTemplates {
  return language === 'en' ? EN_TEMPLATES : IT_TEMPLATES;
}

/**
 * Check if template exists
 * 
 * @param key - Template key
 * @returns True if template exists
 */
export function hasTemplate(key: string): boolean {
  return key in IT_TEMPLATES;
}
