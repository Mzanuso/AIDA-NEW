// personality-system.ts
export interface CognitiveProfile {
  ageGroup: 'child' | 'teen' | 'adult'
  complexity: 'simple' | 'medium' | 'advanced'
  expertise?: 'beginner' | 'intermediate' | 'advanced'
}

export function detectCognitiveProfile(message: string): CognitiveProfile {
  // Indicatori per bambini
  const childIndicators = [
    /!!!/g,
    /bellissim[oa]/i,
    /fortissim[oa]/i,
    /draghett[oi]/i,
    /super/i
  ]

  // Indicatori per esperti
  const expertIndicators = [
    /implementare/i,
    /narrativa/i,
    /framework/i,
    /architettura/i,
    /non-lineare/i,
    /realismo magico/i
  ]

  const childScore = childIndicators.filter(ind => ind.test(message)).length
  const expertScore = expertIndicators.filter(ind => ind.test(message)).length

  if (childScore >= 2) {
    return { ageGroup: 'child', complexity: 'simple' }
  }

  if (expertScore >= 2) {
    return { ageGroup: 'adult', complexity: 'advanced', expertise: 'advanced' }
  }

  // Default
  return { ageGroup: 'adult', complexity: 'medium', expertise: 'intermediate' }
}

export function analyzeAndRespond(message: string): string {
  const profile = detectCognitiveProfile(message)

  // Risposte base per testing
  if (profile.ageGroup === 'child') {
    return "Wow, che idea figa! Dimmi di più su questo progetto spacca!"
  }

  if (message.includes('corporate') || message.includes('aziendale')) {
    return "Capisco il progetto. Definiamo gli obiettivi principali per realizzare il video."
  }

  if (message.length < 20) {
    return "Aspetta però, dimmi di più. Così non posso aiutarti davvero."
  }

  if (message.includes('gattini') && message.includes('kawaii')) {
    return "Sicuro? Non è un po' troppo visto? Proviamo qualcosa di più originale?"
  }

  return "Ok, ci sto. Anche se forse c'è un modo più figo per farlo..."
}

export function generateResponse(prompt: string): string {
  // Evita eccesso di esclamativi
  let response = analyzeAndRespond(prompt)

  // Rimuovi esclamativi multipli
  response = response.replace(/!+/g, '!')

  // Massimo 1 esclamativo
  const exclamations = response.match(/!/g) || []
  if (exclamations.length > 1) {
    response = response.replace(/!/g, '.')
    response = response.replace(/\.$/, '!')  // Solo uno alla fine
  }

  return response
}
