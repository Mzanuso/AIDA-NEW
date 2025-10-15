import { describe, it, expect } from 'vitest'
import {
  analyzeAndRespond,
  detectCognitiveProfile,
  generateResponse
} from '../personality/personality-system'

describe('Orchestrator Personality System', () => {
  
  describe('Tone Adaptation', () => {
    it('should use casual tone for young users', () => {
      const userMessage = "voglio fare un video bellissimo!!!"
      const response = analyzeAndRespond(userMessage)

      // Should detect enthusiasm and young age indicators
      expect(response).toMatch(/figo|wow|spacca|bello/i)
      expect(response).not.toMatch(/cortesemente|gentilmente|pregasi/i)
    })

    it('should use professional tone for business context', () => {
      const userMessage = "Necessito di un video corporate per la presentazione aziendale Q4"
      const response = analyzeAndRespond(userMessage)

      // Should detect formal language and adapt
      expect(response).toMatch(/progetto|realizz|obiettiv/i)
      expect(response).not.toMatch(/figo|spacca|wow/i)
    })
  })

  describe('Critical Personality', () => {
    it('should challenge vague requests', () => {
      const userMessage = "voglio un video"
      const response = analyzeAndRespond(userMessage)

      // Should be critical but constructive
      expect(response).toMatch(/però|aspetta|dimmi di più/i)
      expect(response).not.toMatch(/perfetto|ottimo|fantastico/i)
    })

    it('should avoid being overly compliant', () => {
      const userMessage = "fai un video di gattini kawaii con arcobaleni"
      const response = analyzeAndRespond(userMessage)

      // Should question cliché choices
      expect(response).toMatch(/sicuro|davvero|originale/i)
      expect(response.toLowerCase()).not.toContain("perfetto!")
    })
  })

  describe('Cognitive Detection', () => {
    it('should detect child-like language patterns', () => {
      const profile = detectCognitiveProfile("voglio un draghetto che sputa fuoco fortissimo!!!")
      
      expect(profile.ageGroup).toBe('child')
      expect(profile.complexity).toBe('simple')
    })

    it('should detect expert language patterns', () => {
      const profile = detectCognitiveProfile(
        "Vorrei implementare una narrativa non-lineare con elementi di realismo magico"
      )
      
      expect(profile.ageGroup).toBe('adult')
      expect(profile.expertise).toBe('advanced')
    })
  })

  describe('Response Style', () => {
    it('should never use excessive exclamation marks', () => {
      const response = generateResponse("Voglio un video epico")
      
      const exclamationCount = (response.match(/!/g) || []).length
      expect(exclamationCount).toBeLessThanOrEqual(1)
    })

    it('should include ironic elements without being sarcastic', () => {
      const response = generateResponse("Voglio fare il nuovo Avatar")
      
      // Should be ironic but not mean
      expect(response).toMatch(/ok|vediamo|ambizioso/i)
      expect(response).not.toMatch(/impossibile|ridicolo|assurdo/i)
    })
  })
})
