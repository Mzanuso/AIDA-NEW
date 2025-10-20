# AIDA Shared Types

Definizioni TypeScript formali dei contratti tra agenti AIDA.

## 📋 Overview

Questo modulo contiene le interfacce condivise che definiscono come gli agenti AIDA comunicano tra loro:

```
Orchestrator → ProjectBrief → Technical Planner
Technical Planner → ExecutionPlan → Execution Agents
Execution Agents → ExecutionResult → Orchestrator
```

## 📁 Files

### `budget-constraints.types.ts`
Definizioni per vincoli di budget:
- `BudgetConstraints`: Limiti e preferenze di budget
- `BudgetType`: hard_limit | soft_preference | none
- `OptimizationPriority`: cost | quality | speed

### `project-brief.types.ts`
Interfaccia principale Orchestrator → Technical Planner:
- `ProjectBrief`: Requisiti progetto estratti da conversazione
- `ContentType`: image | video | audio | multi_asset
- `StylePreferences`: Preferenze stile da Style Selector

### `execution-plan.types.ts`
Interfaccia Technical Planner → Execution Agents:
- `ExecutionPlan`: Piano dettagliato di esecuzione
- `ModelSelection`: Dettagli modello selezionato
- `ExecutionStep`: Singolo step in workflow multi-step
- `ExecutionResult`: Risultato esecuzione (base interface)

## 🎯 Usage

### Import

```typescript
// Import specifici
import { ProjectBrief, ExecutionPlan } from '@shared/types';

// Import namespace completo
import * as AidaTypes from '@shared/types';
```

### Orchestrator Example

```typescript
import { ProjectBrief, BudgetConstraints } from '@shared/types';

// Estrae requisiti da conversazione e crea brief
const brief: ProjectBrief = {
  id: `brief_${Date.now()}`,
  user_id: userId,
  conversation_id: conversationId,
  content_type: 'image',
  requirements: [
    'Create a product photo',
    'Modern smartphone',
    'White background'
  ],
  quality_keywords: ['professional', 'high-quality'],
  budget_constraints: {
    type: 'soft_preference',
    priority: 'quality'
  },
  language: 'en',
  created_at: new Date()
};

// Valida prima di inviare
const validation = validateProjectBrief(brief);
if (!validation.valid) {
  console.error('Invalid brief:', validation.errors);
}
```

### Technical Planner Example

```typescript
import { ProjectBrief, ExecutionPlan, ModelSelection } from '@shared/types';

// Riceve brief da Orchestrator
function createExecutionPlan(brief: ProjectBrief): ExecutionPlan {
  // Analizza requisiti
  const qualityTier = interpretQualityKeywords(brief.quality_keywords);
  
  // Seleziona modello
  const model: ModelSelection = {
    name: 'FLUX Pro',
    model_id: 'fal-ai/flux/pro',
    provider: 'FAL.AI',
    reason: 'Best quality for product photography',
    estimated_cost: 0.055,
    estimated_time: 15
  };

  // Crea piano
  const plan: ExecutionPlan = {
    id: `plan_${Date.now()}`,
    brief_id: brief.id,
    primary_model: model,
    approach: 'single_model',
    prompt: optimizePrompt(brief.requirements),
    quality_tier: qualityTier,
    total_estimated_cost: model.estimated_cost,
    total_estimated_time: model.estimated_time,
    target_agent: 'visual_creator',
    created_at: new Date()
  };

  return plan;
}
```

### Visual Creator Example

```typescript
import { ExecutionPlan, ExecutionResult } from '@shared/types';

// Riceve piano da Technical Planner
async function executeImageGeneration(plan: ExecutionPlan): Promise<ImageGenerationResult> {
  // Esegue con primary_model
  let result;
  try {
    result = await generateImage(
      plan.primary_model.model_id,
      plan.prompt,
      plan.parameters
    );
  } catch (error) {
    // Prova fallback se disponibile
    if (plan.fallback_models && plan.fallback_models.length > 0) {
      result = await generateImage(
        plan.fallback_models[0].model_id,
        plan.prompt,
        plan.parameters
      );
    }
  }

  // Ritorna risultato tipizzato
  return {
    plan_id: plan.id,
    success: true,
    model_used: plan.primary_model.name,
    actual_cost: 0.055,
    actual_time: 14,
    started_at: startTime,
    completed_at: new Date(),
    // Visual Creator specific fields
    image_url: result.url,
    dimensions: result.dimensions
  };
}
```

## 🔄 Data Flow

```
1. USER → Orchestrator (natural language)
   ↓
2. Orchestrator extracts → ProjectBrief
   ↓
3. ProjectBrief → Technical Planner
   ↓
4. Technical Planner analyzes → ExecutionPlan
   ↓
5. ExecutionPlan → Execution Agent (Visual/Video/Audio/etc)
   ↓
6. Execution Agent executes → ExecutionResult
   ↓
7. ExecutionResult → Orchestrator
   ↓
8. Orchestrator presents → USER (natural language)
```

## ✅ Validation

Tutte le interfacce hanno funzioni di validazione:

```typescript
import { validateProjectBrief, validateExecutionPlan } from '@shared/types';

const briefValidation = validateProjectBrief(brief);
if (!briefValidation.valid) {
  console.error(briefValidation.errors);
}

const planValidation = validateExecutionPlan(plan);
if (!planValidation.valid) {
  console.error(planValidation.errors);
}
```

## 🎨 Design Principles

1. **Agent-Agnostic**: ExecutionPlan funziona per TUTTI gli agenti di esecuzione
2. **Clear Separation**: Orchestrator non interpreta quality_keywords, solo Technical Planner
3. **Extensible**: Facile aggiungere nuovi campi senza breaking changes
4. **Type-Safe**: Full TypeScript support con validazione runtime
5. **Well-Documented**: JSDoc completo per ogni tipo e campo

## 📝 Notes

- **Orchestrator**: Passa `quality_keywords` raw, NON interpreta
- **Technical Planner**: Interpreta `quality_keywords` e decide `quality_tier`
- **Execution Agents**: Ricevono tutti ExecutionPlan nello stesso formato
- **Fallback**: Silent recovery, Technical Planner gestisce fallback senza informare user

## 🔗 Related Documentation

- `docs/ORCHESTRATOR-V5.md`: Orchestrator architecture e responsabilità
- `docs/TECHNICAL-PLANNER-V3.md`: Technical Planner decision logic
- `.flow/current.md`: Current development status

---

**Version:** 1.0  
**Created:** 2025-10-19  
**Part of:** MS-019B Interface Formalization
