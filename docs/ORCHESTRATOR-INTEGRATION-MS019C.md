# Orchestrator Integration Guide - MS-019C

## Overview

This guide explains how to integrate MS-019C components into the Orchestrator controller.

**New Components:**
1. `CommandPreprocessor` - Detect explicit commands
2. `Language Detector (Simple)` - IT/EN detection
3. `MessageTemplates` - Localized responses
4. `ImageFlowService` - Conversation flow management
5. `ConversationState` - State machine types

---

## Integration Steps

### 1. Import New Components

```typescript
// In conversational-orchestrator.ts

import { CommandPreprocessor } from '../middleware/command-preprocessor';
import { detectLanguage } from '../utils/language-detector-simple';
import { getTemplate } from '../config/messages';
import { ImageFlowService } from '../services/image-flow.service';
import { ConversationState } from '../types/conversation-state';
```

### 2. Initialize Services

```typescript
class ConversationalOrchestrator {
  private commandPreprocessor: CommandPreprocessor;
  private imageFlowService: ImageFlowService;

  constructor() {
    this.commandPreprocessor = new CommandPreprocessor();
    this.imageFlowService = new ImageFlowService();
    // ... other initializations
  }
}
```

### 3. Message Processing Flow

```typescript
async processMessage(userId: string, message: string) {
  // Step 1: Detect language
  const language = detectLanguage(message);
  
  // Step 2: Check for commands (HIGHEST PRIORITY)
  const commandResult = this.commandPreprocessor.detectCommand(message);
  
  if (commandResult.isCommand) {
    return this.handleCommand(commandResult, language);
  }
  
  // Step 3: Normal conversation flow
  return this.handleConversation(userId, message, language);
}
```

### 4. Command Handling

```typescript
private handleCommand(commandResult: CommandDetectionResult, language: Language) {
  switch (commandResult.commandType) {
    case 'GALLERY':
      // Trigger gallery display
      return {
        action: 'show_gallery',
        message: getTemplate('gallery_proposal', language)
      };
    
    default:
      // Should never happen
      return this.handleConversation(userId, message, language);
  }
}
```

### 5. Image Request Flow

```typescript
private handleImageRequest(userId: string, language: Language) {
  // Use ImageFlowService for state management
  const flowResult = this.imageFlowService.startImageRequest(language);
  
  return {
    state: flowResult.state,
    message: flowResult.message,
    // Store state in conversation context
  };
}
```

### 6. Gallery Selection

```typescript
private handleGallerySelection(srefCodes: string[], language: Language) {
  const flowResult = this.imageFlowService.handleGallerySelection(srefCodes, language);
  
  // Create ProjectBrief with gallery selections
  const projectBrief: ProjectBrief = {
    // ... other fields
    style_preferences: {
      gallery_selected: flowResult.gallerySelections
    }
  };
  
  // Send to Technical Planner
  return this.sendToTechnicalPlanner(projectBrief);
}
```

### 7. Response Templates

```typescript
private formatResponse(templateKey: string, language: Language, variables?: any) {
  return getTemplate(templateKey, language, variables);
}

// Usage examples:
const menu = getTemplate('initial_menu', language);
const starting = getTemplate('generation_started', language, {
  description: 'your image',
  time: '15 seconds',
  cost: '$0.05'
});
```

---

## State Management

### Conversation Context

Store state in conversation context:

```typescript
interface ConversationContext {
  userId: string;
  conversationId: string;
  language: Language;
  flowState: ConversationState;
  flowData?: {
    gallerySelections?: GallerySelection[];
    description?: string;
  };
}
```

### State Transitions

```typescript
private updateFlowState(context: ConversationContext, newState: ConversationState) {
  // Validate transition
  if (!isValidTransition(context.flowState, newState)) {
    throw new Error(`Invalid transition: ${context.flowState} -> ${newState}`);
  }
  
  context.flowState = newState;
  // Persist to database/memory
}
```

---

## ProjectBrief Generation

### With Gallery Selection

```typescript
function createProjectBriefWithGallery(
  userId: string,
  conversationId: string,
  language: Language,
  gallerySelections: GallerySelection[],
  description: string
): ProjectBrief {
  return {
    id: `brief_${Date.now()}`,
    user_id: userId,
    conversation_id: conversationId,
    content_type: 'image',
    requirements: [description],
    quality_keywords: [], // Orchestrator doesn't interpret
    style_preferences: {
      gallery_selected: gallerySelections // With requires_artistic_model flag
    },
    language,
    created_at: new Date()
  };
}
```

### Without Gallery (Manual)

```typescript
function createProjectBriefManual(
  userId: string,
  conversationId: string,
  language: Language,
  description: string
): ProjectBrief {
  return {
    id: `brief_${Date.now()}`,
    user_id: userId,
    conversation_id: conversationId,
    content_type: 'image',
    requirements: [description],
    quality_keywords: [], // Extracted separately
    style_preferences: {
      style_description: description
    },
    language,
    created_at: new Date()
  };
}
```

---

## Testing Integration

### Unit Tests

Test each integration point separately:

```typescript
describe('Orchestrator Integration', () => {
  it('should detect and handle gallery command', async () => {
    const orchestrator = new ConversationalOrchestrator();
    const result = await orchestrator.processMessage('user_123', '/gallery');
    
    expect(result.action).toBe('show_gallery');
  });

  it('should create ProjectBrief with artistic model flag', async () => {
    const orchestrator = new ConversationalOrchestrator();
    // ... simulate flow
    const brief = orchestrator.createProjectBrief(/* ... */);
    
    expect(brief.style_preferences?.gallery_selected?.[0].requires_artistic_model).toBe(true);
  });
});
```

### Integration Tests

Test full conversation flows:

```typescript
describe('Full Image Generation Flow', () => {
  it('should complete gallery flow', async () => {
    const orchestrator = new ConversationalOrchestrator();
    
    // 1. User requests image
    await orchestrator.processMessage('user_123', 'voglio un\'immagine');
    
    // 2. User chooses gallery
    await orchestrator.processMessage('user_123', '/gallery');
    
    // 3. User selects style
    await orchestrator.handleGallerySelection(['sref_001']);
    
    // 4. Verify ProjectBrief sent to TP
    // Assert...
  });
});
```

---

## Migration Notes

### Deprecations

- Old `LanguageDetector` (5 languages) → Use `detectLanguage` (IT/EN only)
- Keyword-based gallery detection → Use `CommandPreprocessor`
- Hardcoded messages → Use `getTemplate()`

### Backward Compatibility

If needed, keep old code with deprecation warnings:

```typescript
// @deprecated Use detectLanguage from language-detector-simple
import { LanguageDetector as OldDetector } from './old-language-detector';
```

---

## Performance Considerations

1. **CommandPreprocessor**: O(1) - exact matching, very fast
2. **Language Detection**: O(1) - checks first 3 words only
3. **State Machine**: O(1) - simple state lookups
4. **Templates**: O(1) - direct object access

**Total overhead**: < 1ms per message

---

## Debugging

### Enable Detailed Logging

```typescript
// Set LOG_LEVEL=debug in .env
process.env.LOG_LEVEL = 'debug';
```

### Check State Transitions

```typescript
const state = imageFlowService.getCurrentState();
console.log('Current state:', state);
console.log('Previous state:', state.previous_state);
console.log('Entered at:', state.entered_at);
```

### Validate ProjectBrief

```typescript
import { validateProjectBrief } from '@shared/types';

const validation = validateProjectBrief(brief);
if (!validation.valid) {
  console.error('Invalid brief:', validation.errors);
}
```

---

## Checklist

Before deploying integration:

- [ ] CommandPreprocessor initialized
- [ ] Language detection using simple version
- [ ] All responses use templates
- [ ] ImageFlowService manages state
- [ ] ProjectBrief includes gallery selections correctly
- [ ] State transitions validated
- [ ] Tests passing (unit + integration)
- [ ] Logging enabled for debugging
- [ ] Backward compatibility handled

---

**Created:** 2025-10-19  
**Part of:** MS-019C  
**For:** Claude Code Implementation
