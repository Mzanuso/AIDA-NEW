/**
 * Image Flow Service
 * 
 * Manages conversational flow for image generation requests.
 * Handles state transitions, user choices, and data collection.
 * 
 * Design: Menu-driven, explicit choices, clear state machine.
 */

import { ConversationState, StateContext, isValidTransition } from '../types/conversation-state';
import { Language } from '../utils/language-detector-simple';
import { getTemplate } from '../config/messages';
import { GallerySelection } from '../../../../../shared/types/project-brief.types';
import { createLogger } from '../../../../../utils/logger';

const logger = createLogger('ImageFlowService');

export type MethodChoice = 'gallery' | 'manual';

export interface FlowResult {
  state: ConversationState;
  previousState?: ConversationState;
  message?: string;
  action?: string;
  gallerySelections?: GallerySelection[];
  description?: string;
}

/**
 * Image Flow Service
 * 
 * Stateful service managing image generation conversation flow.
 */
export class ImageFlowService {
  private stateContext: StateContext;

  constructor() {
    this.stateContext = {
      state: 'NEW_IMAGE_REQUEST',
      entered_at: new Date()
    };
  }

  /**
   * Start image request flow
   * Shows initial menu (gallery vs manual)
   * 
   * @param language - User language
   * @returns Flow result with menu message
   */
  startImageRequest(language: Language): FlowResult {
    logger.info('Starting image request flow', { language });

    this.transitionTo('AWAITING_METHOD_CHOICE');

    const message = getTemplate('initial_menu', language);

    return {
      state: this.stateContext.state,
      previousState: this.stateContext.previous_state,
      message
    };
  }

  /**
   * Handle user's method choice
   * 
   * @param choice - Gallery or manual
   * @param language - User language
   * @returns Flow result
   */
  handleMethodChoice(choice: MethodChoice, language: Language): FlowResult {
    logger.info('User chose method', { choice, currentState: this.stateContext.state });

    if (this.stateContext.state !== 'AWAITING_METHOD_CHOICE') {
      throw new Error(`Cannot choose method in state ${this.stateContext.state}`);
    }

    if (choice === 'gallery') {
      this.transitionTo('AWAITING_STYLE_SELECTION');
      
      return {
        state: this.stateContext.state,
        previousState: this.stateContext.previous_state,
        action: 'show_gallery'
      };
    } else if (choice === 'manual') {
      this.transitionTo('AWAITING_DESCRIPTION');
      
      const message = getTemplate('photographic_details', language);
      
      return {
        state: this.stateContext.state,
        previousState: this.stateContext.previous_state,
        message
      };
    } else {
      throw new Error(`Invalid method choice: ${choice}`);
    }
  }

  /**
   * Handle gallery style selection
   * 
   * @param srefCodes - Selected sref codes
   * @param language - User language
   * @returns Flow result with gallery selections
   */
  handleGallerySelection(srefCodes: string[], language: Language): FlowResult {
    logger.info('Gallery selection received', { 
      srefCount: srefCodes.length,
      currentState: this.stateContext.state 
    });

    if (this.stateContext.state !== 'AWAITING_STYLE_SELECTION') {
      throw new Error(`Cannot select styles in state ${this.stateContext.state}`);
    }

    // Create gallery selections with artistic model flag
    const gallerySelections: GallerySelection[] = srefCodes.map(id => ({
      id,
      selection_method: 'gallery',
      requires_artistic_model: true // Gallery always requires artistic model (Midjourney)
    }));

    this.transitionTo('GATHERING_DETAILS');

    const message = getTemplate('photographic_details', language);

    return {
      state: this.stateContext.state,
      previousState: this.stateContext.previous_state,
      gallerySelections,
      message
    };
  }

  /**
   * Handle manual description
   * 
   * @param description - User's image description
   * @param language - User language
   * @returns Flow result with description
   */
  handleDescription(description: string, language: Language): FlowResult {
    logger.info('Description received', { 
      descriptionLength: description.length,
      currentState: this.stateContext.state 
    });

    if (this.stateContext.state !== 'AWAITING_DESCRIPTION' && 
        this.stateContext.state !== 'GATHERING_DETAILS') {
      throw new Error(`Cannot provide description in state ${this.stateContext.state}`);
    }

    this.transitionTo('GENERATING');

    return {
      state: this.stateContext.state,
      previousState: this.stateContext.previous_state,
      description
    };
  }

  /**
   * Transition to new state
   * 
   * @param newState - Target state
   */
  transitionTo(newState: ConversationState): void {
    const currentState = this.stateContext.state;

    if (!isValidTransition(currentState, newState)) {
      throw new Error(`Invalid transition: ${currentState} -> ${newState}`);
    }

    logger.info('State transition', { from: currentState, to: newState });

    this.stateContext = {
      state: newState,
      entered_at: new Date(),
      previous_state: currentState
    };
  }

  /**
   * Get current state
   * 
   * @returns Current state context
   */
  getCurrentState(): StateContext {
    return { ...this.stateContext };
  }

  /**
   * Reset flow to initial state
   */
  reset(): void {
    logger.info('Resetting flow');
    
    this.stateContext = {
      state: 'NEW_IMAGE_REQUEST',
      entered_at: new Date()
    };
  }
}
