/**
 * Conversation State Types
 * 
 * Defines clear states for Orchestrator conversation flow.
 * 
 * State machine ensures predictable behavior and easy debugging.
 */

/**
 * Conversation State
 * 
 * Represents current state of image generation conversation.
 */
export type ConversationState =
  | 'NEW_IMAGE_REQUEST'           // User just asked for image
  | 'AWAITING_METHOD_CHOICE'      // Showing initial menu (gallery vs manual)
  | 'AWAITING_STYLE_SELECTION'    // User in gallery, selecting style
  | 'AWAITING_DESCRIPTION'        // User describing manually
  | 'GATHERING_DETAILS'           // Collecting additional details
  | 'GENERATING'                  // Generation in progress
  | 'COMPLETE';                   // Generation complete

/**
 * State Context
 * 
 * Additional data associated with current state.
 */
export interface StateContext {
  /**
   * Current state
   */
  state: ConversationState;

  /**
   * When state was entered
   */
  entered_at: Date;

  /**
   * Previous state (for debugging)
   */
  previous_state?: ConversationState;

  /**
   * Metadata specific to state
   */
  metadata?: Record<string, any>;
}

/**
 * State Transition
 * 
 * Represents a state change with reason.
 */
export interface StateTransition {
  from: ConversationState;
  to: ConversationState;
  reason: string;
  timestamp: Date;
}

/**
 * Check if state transition is valid
 * 
 * @param from - Current state
 * @param to - Target state
 * @returns True if transition is allowed
 */
export function isValidTransition(
  from: ConversationState,
  to: ConversationState
): boolean {
  const validTransitions: Record<ConversationState, ConversationState[]> = {
    NEW_IMAGE_REQUEST: ['AWAITING_METHOD_CHOICE'],
    AWAITING_METHOD_CHOICE: ['AWAITING_STYLE_SELECTION', 'AWAITING_DESCRIPTION'],
    AWAITING_STYLE_SELECTION: ['GATHERING_DETAILS', 'GENERATING'],
    AWAITING_DESCRIPTION: ['GATHERING_DETAILS', 'GENERATING'],
    GATHERING_DETAILS: ['GENERATING'],
    GENERATING: ['COMPLETE'],
    COMPLETE: ['NEW_IMAGE_REQUEST'] // Can start new request
  };

  return validTransitions[from]?.includes(to) || false;
}

/**
 * Get next possible states
 * 
 * @param current - Current state
 * @returns Array of possible next states
 */
export function getNextStates(current: ConversationState): ConversationState[] {
  const transitions: Record<ConversationState, ConversationState[]> = {
    NEW_IMAGE_REQUEST: ['AWAITING_METHOD_CHOICE'],
    AWAITING_METHOD_CHOICE: ['AWAITING_STYLE_SELECTION', 'AWAITING_DESCRIPTION'],
    AWAITING_STYLE_SELECTION: ['GATHERING_DETAILS', 'GENERATING'],
    AWAITING_DESCRIPTION: ['GATHERING_DETAILS', 'GENERATING'],
    GATHERING_DETAILS: ['GENERATING'],
    GENERATING: ['COMPLETE'],
    COMPLETE: ['NEW_IMAGE_REQUEST']
  };

  return transitions[current] || [];
}
