/**
 * Test Manuale SmartRouter
 *
 * Esegui con: npx tsx test-smart-router-manual.ts
 */

import { SmartRouter } from './src/shared/coordination/smart-router';
import type { ProjectBrief } from './src/shared/types/project-brief.types';

console.log('🧪 Test Manuale SmartRouter\n');

const router = new SmartRouter();

// Test 1: Logo vettoriale
console.log('📌 Test 1: Logo vettoriale');
const brief1: ProjectBrief = {
  id: 'test_001',
  user_id: 'demo_user',
  conversation_id: 'demo_conv',
  content_type: 'image',
  requirements: ['Crea un logo per azienda tech', 'Formato vettoriale'],
  quality_keywords: ['professionale'],
  language: 'it',
  created_at: new Date(),
  special_requirements: ['vectorOutput']
};

const strategy1 = router.selectModel(brief1);
console.log('   Modello selezionato:', strategy1.primaryModel.name);
console.log('   Costo stimato: $', strategy1.costBreakdown.totalEstimated);
console.log('   Motivo:', strategy1.reasoning.modelChoice);
console.log('   Workflow:', strategy1.workflow);
console.log('');

// Test 2: Budget limitato
console.log('📌 Test 2: Budget limitato ($0.005 max)');
const brief2: ProjectBrief = {
  id: 'test_002',
  user_id: 'demo_user',
  conversation_id: 'demo_conv',
  content_type: 'image',
  requirements: ['Foto prodotto'],
  quality_keywords: ['premium'],
  budget_constraints: {
    type: 'hard_limit',
    max_cost: 0.005,
    priority: 'cost'
  },
  language: 'it',
  created_at: new Date()
};

const strategy2 = router.selectModel(brief2);
console.log('   Modello selezionato:', strategy2.primaryModel.name);
console.log('   Costo stimato: $', strategy2.costBreakdown.totalEstimated);
console.log('   Dentro budget?', strategy2.costBreakdown.withinBudget ? '✅ Sì' : '❌ No');
console.log('   Tradeoffs:', strategy2.reasoning.tradeoffs);
console.log('');

// Test 3: Personaggio consistente
console.log('📌 Test 3: Personaggio in scene multiple');
const brief3: ProjectBrief = {
  id: 'test_003',
  user_id: 'demo_user',
  conversation_id: 'demo_conv',
  content_type: 'image',
  requirements: ['Stesso personaggio in 5 scene diverse'],
  quality_keywords: ['professionale'],
  language: 'it',
  created_at: new Date(),
  special_requirements: ['characterConsistency', 'multipleScenes']
};

const strategy3 = router.selectModel(brief3);
console.log('   Modello selezionato:', strategy3.primaryModel.name);
console.log('   Workflow:', strategy3.workflow);
console.log('   Numero step:', strategy3.steps?.length || 1);
console.log('   Motivo:', strategy3.reasoning.modelChoice);
console.log('');

// Test 4: Alta qualità, nessun vincolo
console.log('📌 Test 4: Ritratto professionale premium');
const brief4: ProjectBrief = {
  id: 'test_004',
  user_id: 'demo_user',
  conversation_id: 'demo_conv',
  content_type: 'image',
  requirements: ['Ritratto professionale CEO', 'Illuminazione studio'],
  quality_keywords: ['premium', 'high-quality', 'photorealistic'],
  language: 'it',
  created_at: new Date()
};

const strategy4 = router.selectModel(brief4);
console.log('   Modello selezionato:', strategy4.primaryModel.name);
console.log('   Costo stimato: $', strategy4.costBreakdown.totalEstimated);
console.log('   Qualità attesa:', strategy4.reasoning.qualityExpectation);
console.log('   Fallback:', strategy4.fallbackModel?.name);
console.log('');

console.log('✅ Tutti i test manuali completati!\n');
