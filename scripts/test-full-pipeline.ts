/**
 * Full Pipeline E2E Test
 *
 * Tests complete video generation pipeline:
 * Brief → Writer Agent → Director Agent (3 concepts)
 *
 * Flow:
 * 1. User provides brief
 * 2. Writer generates script (hook + scenes + CTA)
 * 3. Director generates 3 diverse storyboards from script
 * 4. System recommends best concept
 */

import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// ES module equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const WRITER_URL = 'http://localhost:3006';
const DIRECTOR_URL = 'http://localhost:3007';

// ============================================================================
// TYPES
// ============================================================================

interface WriterRequest {
  brief: string;
  content_type: string;
  target_audience?: string;
  tone?: string;
  duration_seconds?: number;
  key_messages?: string[];
}

interface WriterResponse {
  success: boolean;
  data: {
    content: {
      type: string;
      hook: string;
      scenes: Array<{
        description: string;
        duration: number;
        visual_notes?: string;
        audio_notes?: string;
      }>;
      cta?: string;
    };
    metadata: {
      model: string;
      tokens_used: number;
      generation_time_ms: number;
    };
  };
}

interface DirectorMultiVariantRequest {
  brief: string;
  product?: string;
  target_audience?: string;
  duration?: number;
  script?: {
    hook: string;
    scenes: Array<{ description: string; duration: number }>;
    cta?: string;
  };
  generate_all_variants: boolean;
  synthesize_best?: boolean;
}

// ============================================================================
// SERVER HEALTH CHECKS
// ============================================================================

async function checkWriterHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${WRITER_URL}/health`, { timeout: 2000 });
    if (response.data.status === 'ok') {
      console.log('✅ Writer Agent ready');
      console.log(`   Port: ${response.data.port}`);
      console.log(`   Version: ${response.data.version}`);
      return true;
    }
  } catch (error) {
    console.error('❌ Writer Agent not responding');
  }
  return false;
}

async function checkDirectorHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${DIRECTOR_URL}/health`, { timeout: 2000 });
    if (response.data.status === 'healthy') {
      console.log('✅ Director Agent ready');
      console.log(`   Port: 3007`);
      console.log(`   Model: ${response.data.model}`);
      console.log(`   Philosophies: ${response.data.philosophies.join(', ')}`);
      return true;
    }
  } catch (error) {
    console.error('❌ Director Agent not responding');
  }
  return false;
}

async function waitForServers(): Promise<boolean> {
  console.log('🔄 Checking services...\n');

  const writerReady = await checkWriterHealth();
  const directorReady = await checkDirectorHealth();

  if (!writerReady || !directorReady) {
    console.error('\n❌ Not all services are ready');
    console.error('\nPlease start missing services:');
    if (!writerReady) console.error('  - Writer: npx tsx src/agents/writer/server.ts');
    if (!directorReady) console.error('  - Director: npx tsx scripts/start-director.ts');
    return false;
  }

  console.log('\n✅ All services ready!\n');
  return true;
}

// ============================================================================
// PIPELINE EXECUTION
// ============================================================================

async function testFullPipeline() {
  console.log('═'.repeat(70));
  console.log('🎬 FULL PIPELINE TEST: Brief → Writer → Director');
  console.log('═'.repeat(70));

  // Step 1: User Brief
  const brief = 'Create a 30-second video ad for RunFree Pro running shoes. Target audience: active parents aged 30-45 who value family time. Emphasize comfort, durability, and the joy of running together. The ad should inspire parents to make running a fun family activity.';

  console.log('\n📝 USER BRIEF:');
  console.log('─'.repeat(70));
  console.log(brief);

  // Step 2: Writer Agent - Generate Script
  console.log('\n\n🖊️  STEP 1: Writer Agent - Generating Script...');
  console.log('─'.repeat(70));

  const writerRequest: WriterRequest = {
    brief,
    content_type: 'video_script', // Valid: video_script, marketing_copy, social_media, blog_post, product_description, ad_copy
    target_audience: 'Active parents, 30-45',
    tone: 'inspirational', // Valid: professional, casual, energetic, calm, humorous, serious, inspirational, educational
    duration_seconds: 30,
    key_messages: ['Family bonding', 'Quality time', 'Comfortable shoes', 'Fun running'],
  };

  let writerResult: WriterResponse;
  let writerStartTime = Date.now();

  try {
    const response = await axios.post<WriterResponse>(
      `${WRITER_URL}/api/write`,
      writerRequest,
      { timeout: 60000 }
    );
    writerResult = response.data;
    const writerTime = Date.now() - writerStartTime;

    console.log(`✅ Script generated in ${writerTime}ms\n`);
    console.log('📄 SCRIPT:');
    console.log(`   Hook: "${writerResult.data.content.hook}"`);
    console.log(`   Scenes: ${writerResult.data.content.scenes.length}`);
    writerResult.data.content.scenes.forEach((scene, i) => {
      console.log(`     ${i + 1}. ${scene.description} (${scene.duration}s)`);
    });
    if (writerResult.data.content.cta) {
      console.log(`   CTA: "${writerResult.data.content.cta}"`);
    }
    console.log(`\n   Tokens: ${writerResult.data.metadata.tokens_used}`);
    console.log(`   Model: ${writerResult.data.metadata.model}`);
  } catch (error) {
    console.error('❌ Writer failed:', error);
    throw error;
  }

  // Step 3: Director Agent - Generate 3 Diverse Storyboards
  console.log('\n\n🎬 STEP 2: Director Agent - Generating 3 Concepts...');
  console.log('─'.repeat(70));

  const directorRequest: DirectorMultiVariantRequest = {
    brief,
    product: 'RunFree Pro',
    target_audience: 'Active parents, 30-45',
    duration: 30,
    script: {
      hook: writerResult.data.content.hook,
      scenes: writerResult.data.content.scenes.map((s) => ({
        description: s.description,
        duration: s.duration,
      })),
      cta: writerResult.data.content.cta,
    },
    generate_all_variants: true,
    synthesize_best: false,
  };

  let directorStartTime = Date.now();

  try {
    const response = await axios.post(
      `${DIRECTOR_URL}/generate/multi-variant`,
      directorRequest,
      { timeout: 120000 }
    );

    const directorResult = response.data;
    const directorTime = Date.now() - directorStartTime;

    console.log(`✅ 3 concepts generated in ${directorTime}ms\n`);

    // Display all 3 concepts
    console.log('\n🎭 EMOTIONAL CONCEPT:');
    console.log('─'.repeat(70));
    console.log(`Summary: ${directorResult.variants.emotional.concept_summary}`);
    console.log(`Scenes: ${directorResult.variants.emotional.storyboard.scenes.length}`);
    console.log(`Impact: Emotional ${directorResult.variants.emotional.estimated_impact.emotional_score}/10, ` +
      `Original ${directorResult.variants.emotional.estimated_impact.originality_score}/10, ` +
      `Feasible ${directorResult.variants.emotional.estimated_impact.feasibility_score}/10`);

    console.log('\n💥 DISRUPTIVE CONCEPT:');
    console.log('─'.repeat(70));
    console.log(`Summary: ${directorResult.variants.disruptive.concept_summary}`);
    console.log(`Scenes: ${directorResult.variants.disruptive.storyboard.scenes.length}`);
    console.log(`Impact: Emotional ${directorResult.variants.disruptive.estimated_impact.emotional_score}/10, ` +
      `Original ${directorResult.variants.disruptive.estimated_impact.originality_score}/10, ` +
      `Feasible ${directorResult.variants.disruptive.estimated_impact.feasibility_score}/10`);

    console.log('\n📊 DATA-DRIVEN CONCEPT:');
    console.log('─'.repeat(70));
    console.log(`Summary: ${directorResult.variants.dataDriven.concept_summary}`);
    console.log(`Scenes: ${directorResult.variants.dataDriven.storyboard.scenes.length}`);
    console.log(`Impact: Emotional ${directorResult.variants.dataDriven.estimated_impact.emotional_score}/10, ` +
      `Original ${directorResult.variants.dataDriven.estimated_impact.originality_score}/10, ` +
      `Feasible ${directorResult.variants.dataDriven.estimated_impact.feasibility_score}/10`);

    // Recommendation
    if (directorResult.recommendation) {
      console.log('\n🏆 AUTOMATIC RECOMMENDATION:');
      console.log('─'.repeat(70));
      console.log(`Best Variant: ${directorResult.recommendation.best_variant.toUpperCase()}`);
      console.log(`Reason: ${directorResult.recommendation.reason}`);
    }

    // Pipeline summary
    console.log('\n\n📊 PIPELINE SUMMARY:');
    console.log('═'.repeat(70));
    console.log(`Total Time: ${writerTime + directorTime}ms (${((writerTime + directorTime) / 1000).toFixed(2)}s)`);
    console.log(`  - Writer: ${writerTime}ms`);
    console.log(`  - Director: ${directorTime}ms (3 concepts in parallel)`);
    console.log(`\nTotal Tokens: ${writerResult.data.metadata.tokens_used + (directorResult.variants.emotional.tokens_used?.input || 0) + (directorResult.variants.emotional.tokens_used?.output || 0) + (directorResult.variants.disruptive.tokens_used?.input || 0) + (directorResult.variants.disruptive.tokens_used?.output || 0) + (directorResult.variants.dataDriven.tokens_used?.input || 0) + (directorResult.variants.dataDriven.tokens_used?.output || 0)}`);

    // Estimated cost (Sonnet 4.5 pricing)
    const writerInputTokens = writerResult.data.metadata.tokens_used * 0.3; // Estimate 30% input
    const writerOutputTokens = writerResult.data.metadata.tokens_used * 0.7; // Estimate 70% output

    const directorInputTokens = (directorResult.variants.emotional.tokens_used?.input || 0) +
      (directorResult.variants.disruptive.tokens_used?.input || 0) +
      (directorResult.variants.dataDriven.tokens_used?.input || 0);

    const directorOutputTokens = (directorResult.variants.emotional.tokens_used?.output || 0) +
      (directorResult.variants.disruptive.tokens_used?.output || 0) +
      (directorResult.variants.dataDriven.tokens_used?.output || 0);

    const totalInputTokens = writerInputTokens + directorInputTokens;
    const totalOutputTokens = writerOutputTokens + directorOutputTokens;

    const totalCost = (totalInputTokens / 1_000_000) * 3 + (totalOutputTokens / 1_000_000) * 15;

    console.log(`Estimated Cost: $${totalCost.toFixed(4)} (~${Math.round(totalCost * 100)} cents)`);
    console.log(`\nOutput:`);
    console.log(`  - 1 Writer script (hook + ${writerResult.data.content.scenes.length} scenes + CTA)`);
    console.log(`  - 3 Director storyboards (${directorResult.variants.emotional.storyboard.scenes.length + directorResult.variants.disruptive.storyboard.scenes.length + directorResult.variants.dataDriven.storyboard.scenes.length} total scenes)`);
    console.log(`  - 1 Automatic recommendation`);

    console.log('\n✅ FULL PIPELINE TEST SUCCESSFUL!');
    console.log('═'.repeat(70));

    return {
      writer: writerResult,
      director: directorResult,
      timing: {
        writer_ms: writerTime,
        director_ms: directorTime,
        total_ms: writerTime + directorTime,
      },
    };
  } catch (error) {
    console.error('❌ Director failed:', error);
    throw error;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n🚀 Starting Full Pipeline Test\n');

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    process.exit(1);
  }

  // Wait for services
  const servicesReady = await waitForServers();
  if (!servicesReady) {
    process.exit(1);
  }

  // Run pipeline test
  await testFullPipeline();

  console.log('\n✨ Next steps:');
  console.log('  • Integrate with Visual Creator for scene generation');
  console.log('  • Test synthesis feature (4th concept)');
  console.log('  • Implement Feature 4: Feedback Loop\n');
}

// Run
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

export { testFullPipeline };
