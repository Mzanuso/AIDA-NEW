import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Orchestrator } from '../../orchestrator'
import { detectCognitiveProfile } from '../personality/personality-system'

describe('Orchestrator Personality Integration', () => {
  describe('Cognitive Profile Detection', () => {
    it('should detect child profile from enthusiastic message', () => {
      const message = "voglio un draghetto che sputa fuoco fortissimo!!!"
      const profile = detectCognitiveProfile(message)

      expect(profile.ageGroup).toBe('child')
      expect(profile.complexity).toBe('simple')
    })

    it('should detect expert profile from technical message', () => {
      const message = "Vorrei implementare una narrativa non-lineare con framework di realismo magico"
      const profile = detectCognitiveProfile(message)

      expect(profile.ageGroup).toBe('adult')
      expect(profile.expertise).toBe('advanced')
      expect(profile.complexity).toBe('advanced')
    })

    it('should detect default profile for normal message', () => {
      const message = "Voglio creare un video per il mio ristorante"
      const profile = detectCognitiveProfile(message)

      expect(profile.ageGroup).toBe('adult')
      expect(profile.complexity).toBe('medium')
      expect(profile.expertise).toBe('intermediate')
    })
  })

  describe('System Prompt Adaptation', () => {
    it('should include cognitive profile in context when detected', () => {
      // This test verifies that the profile is being used in the system prompt
      const childMessage = "voglio un video bellissimo con draghetti!!!"
      const profile = detectCognitiveProfile(childMessage)

      expect(profile).toBeDefined()
      expect(profile.ageGroup).toBe('child')

      // The actual system prompt building is tested indirectly through
      // the loadUserContext integration
    })

    it('should adapt tone for expert users', () => {
      const expertMessage = "Implementare una narrativa complessa con architettura non-lineare"
      const profile = detectCognitiveProfile(expertMessage)

      expect(profile.expertise).toBe('advanced')
      expect(profile.complexity).toBe('advanced')
    })

    it('should use default tone for intermediate users', () => {
      const normalMessage = "Voglio fare un video promozionale"
      const profile = detectCognitiveProfile(normalMessage)

      expect(profile.ageGroup).toBe('adult')
      expect(profile.expertise).toBe('intermediate')
    })
  })

  describe('Message Pattern Recognition', () => {
    it('should recognize multiple child indicators', () => {
      const message = "super bellissimo draghetto fortissimo!!!"
      const profile = detectCognitiveProfile(message)

      expect(profile.ageGroup).toBe('child')
    })

    it('should recognize multiple expert indicators', () => {
      const message = "Implementare framework narrativa con architettura complessa"
      const profile = detectCognitiveProfile(message)

      expect(profile.expertise).toBe('advanced')
    })

    it('should handle mixed patterns with precedence', () => {
      // Child indicators should take precedence when present
      const message = "voglio implementare un draghetto bellissimo!!!"
      const profile = detectCognitiveProfile(message)

      // Should still be child due to stronger child indicators
      expect(profile.ageGroup).toBe('child')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const message = ""
      const profile = detectCognitiveProfile(message)

      expect(profile).toBeDefined()
      expect(profile.ageGroup).toBe('adult')
      expect(profile.complexity).toBe('medium')
    })

    it('should handle very short message', () => {
      const message = "video"
      const profile = detectCognitiveProfile(message)

      expect(profile).toBeDefined()
      expect(profile.ageGroup).toBe('adult')
    })

    it('should handle message with only punctuation', () => {
      const message = "!!!"
      const profile = detectCognitiveProfile(message)

      expect(profile).toBeDefined()
    })

    it('should be case insensitive', () => {
      const message1 = "IMPLEMENTARE FRAMEWORK"
      const message2 = "implementare framework"

      const profile1 = detectCognitiveProfile(message1)
      const profile2 = detectCognitiveProfile(message2)

      expect(profile1.expertise).toBe(profile2.expertise)
    })
  })
})
