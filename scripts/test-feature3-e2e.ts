/**
 * Feature 3 End-to-End Test Script
 *
 * Tests Multi-Agent Creative Debate with real Anthropic API:
 * 1. Start Director server
 * 2. Generate 3 concepts with different philosophies
 * 3. Measure performance metrics
 * 4. Analyze results
 */

import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// ES module equivalents of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const DIRECTOR_URL = 'http://localhost:3007';

interface TestResult {
  success: boolean;
  brief: string;
  variants: {
    emotional: any;
    disruptive: any;
    dataDriven: any;
  };
  recommendation?: {
    best_variant: string;
    reason: string;
  };
  total_generation_time_ms: number;
  metrics: {
    total_tokens: number;
    total_cost_usd: number;
    avg_generation_time_ms: number;
  };
}

/**
 * Wait for Director server to be ready
 */
async function waitForServer(maxAttempts = 10): Promise<boolean> {
  console.log('🔄 Waiting for Director server...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${DIRECTOR_URL}/health`, {
        timeout: 2000,
      });

      if (response.data.status === 'healthy') {
        console.log('✅ Director server is ready');
        console.log(`   Model: ${response.data.model}`);
        console.log(`   Philosophies: ${response.data.philosophies.join(', ')}`);
        return true;
      }
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.error('❌ Director server not responding');
  return false;
}

/**
 * Test Feature 3: Multi-variant concept generation
 */
async function testMultiVariantGeneration(): Promise<TestResult | null> {
  console.log('\n📝 Testing Feature 3: Multi-Agent Creative Debate');
  console.log('═'.repeat(70));

  const brief = 'Create a 30-second video ad for RunFree Pro running shoes. Target audience: active parents aged 30-45 who value family time. Emphasize comfort, durability, and the joy of running together.';

  console.log('\n📄 Brief:');
  console.log(`"${brief}"\n`);

  const request = {
    brief,
    product: 'RunFree Pro',
    target_audience: 'Active parents, 30-45',
    duration: 30,
    generate_all_variants: true,
    synthesize_best: false, // Set to true to test synthesis
  };

  try {
    console.log('🚀 Calling Director Agent (3 concepts in parallel)...\n');

    const startTime = Date.now();
    const response = await axios.post(
      `${DIRECTOR_URL}/generate/multi-variant`,
      request,
      {
        timeout: 120000, // 2 minutes timeout
      }
    );

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log('✅ Generation complete!\n');

    const result = response.data;

    // Calculate metrics
    const totalTokens =
      (result.variants.emotional.tokens_used?.input || 0) +
      (result.variants.emotional.tokens_used?.output || 0) +
      (result.variants.disruptive.tokens_used?.input || 0) +
      (result.variants.disruptive.tokens_used?.output || 0) +
      (result.variants.dataDriven.tokens_used?.input || 0) +
      (result.variants.dataDriven.tokens_used?.output || 0);

    // Sonnet 4.5 pricing (as of Jan 2025)
    // Input: $3 per 1M tokens, Output: $15 per 1M tokens
    const inputTokens =
      (result.variants.emotional.tokens_used?.input || 0) +
      (result.variants.disruptive.tokens_used?.input || 0) +
      (result.variants.dataDriven.tokens_used?.input || 0);

    const outputTokens =
      (result.variants.emotional.tokens_used?.output || 0) +
      (result.variants.disruptive.tokens_used?.output || 0) +
      (result.variants.dataDriven.tokens_used?.output || 0);

    const inputCost = (inputTokens / 1_000_000) * 3;
    const outputCost = (outputTokens / 1_000_000) * 15;
    const totalCost = inputCost + outputCost;

    const avgTime =
      (result.variants.emotional.generation_time_ms +
        result.variants.disruptive.generation_time_ms +
        result.variants.dataDriven.generation_time_ms) /
      3;

    const testResult: TestResult = {
      success: result.success,
      brief,
      variants: result.variants,
      recommendation: result.recommendation,
      total_generation_time_ms: result.total_generation_time_ms,
      metrics: {
        total_tokens: totalTokens,
        total_cost_usd: totalCost,
        avg_generation_time_ms: avgTime,
      },
    };

    return testResult;
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response:', error.response.data);
    }
    return null;
  }
}

/**
 * Display test results with detailed analysis
 */
function displayResults(result: TestResult) {
  console.log('\n📊 RESULTS');
  console.log('═'.repeat(70));

  // Overall metrics
  console.log('\n⏱️  Performance Metrics:');
  console.log(`   Total generation time: ${result.total_generation_time_ms}ms (${(result.total_generation_time_ms / 1000).toFixed(2)}s)`);
  console.log(`   Average per concept: ${result.metrics.avg_generation_time_ms.toFixed(0)}ms`);
  console.log(`   Parallel efficiency: ${((result.metrics.avg_generation_time_ms * 3) / result.total_generation_time_ms).toFixed(2)}x speedup`);

  console.log('\n💰 Cost Analysis:');
  console.log(`   Total tokens: ${result.metrics.total_tokens.toLocaleString()}`);
  console.log(`   Total cost: $${result.metrics.total_cost_usd.toFixed(4)}`);
  console.log(`   Cost per concept: $${(result.metrics.total_cost_usd / 3).toFixed(4)}`);

  // Emotional concept
  console.log('\n🎭 EMOTIONAL CONCEPT:');
  console.log('─'.repeat(70));
  console.log(`Summary: ${result.variants.emotional.concept_summary}`);
  console.log(`Reasoning: ${result.variants.emotional.reasoning}`);
  console.log(`Scenes: ${result.variants.emotional.storyboard.scenes.length}`);
  console.log(`Impact Scores:`);
  console.log(`  • Emotional: ${result.variants.emotional.estimated_impact.emotional_score || 'N/A'}/10`);
  console.log(`  • Originality: ${result.variants.emotional.estimated_impact.originality_score || 'N/A'}/10`);
  console.log(`  • Feasibility: ${result.variants.emotional.estimated_impact.feasibility_score || 'N/A'}/10`);
  console.log(`Generation time: ${result.variants.emotional.generation_time_ms}ms`);

  // Disruptive concept
  console.log('\n💥 DISRUPTIVE CONCEPT:');
  console.log('─'.repeat(70));
  console.log(`Summary: ${result.variants.disruptive.concept_summary}`);
  console.log(`Reasoning: ${result.variants.disruptive.reasoning}`);
  console.log(`Scenes: ${result.variants.disruptive.storyboard.scenes.length}`);
  console.log(`Impact Scores:`);
  console.log(`  • Emotional: ${result.variants.disruptive.estimated_impact.emotional_score || 'N/A'}/10`);
  console.log(`  • Originality: ${result.variants.disruptive.estimated_impact.originality_score || 'N/A'}/10`);
  console.log(`  • Feasibility: ${result.variants.disruptive.estimated_impact.feasibility_score || 'N/A'}/10`);
  console.log(`Generation time: ${result.variants.disruptive.generation_time_ms}ms`);

  // Data-driven concept
  console.log('\n📊 DATA-DRIVEN CONCEPT:');
  console.log('─'.repeat(70));
  console.log(`Summary: ${result.variants.dataDriven.concept_summary}`);
  console.log(`Reasoning: ${result.variants.dataDriven.reasoning}`);
  console.log(`Scenes: ${result.variants.dataDriven.storyboard.scenes.length}`);
  console.log(`Impact Scores:`);
  console.log(`  • Emotional: ${result.variants.dataDriven.estimated_impact.emotional_score || 'N/A'}/10`);
  console.log(`  • Originality: ${result.variants.dataDriven.estimated_impact.originality_score || 'N/A'}/10`);
  console.log(`  • Feasibility: ${result.variants.dataDriven.estimated_impact.feasibility_score || 'N/A'}/10`);
  console.log(`Generation time: ${result.variants.dataDriven.generation_time_ms}ms`);

  // Recommendation
  if (result.recommendation) {
    console.log('\n🏆 RECOMMENDATION:');
    console.log('─'.repeat(70));
    console.log(`Best variant: ${result.recommendation.best_variant.toUpperCase()}`);
    console.log(`Reason: ${result.recommendation.reason}`);
  }

  // Sample scene from each concept
  console.log('\n🎬 SAMPLE SCENES:');
  console.log('─'.repeat(70));

  if (result.variants.emotional.storyboard.scenes[0]) {
    const scene = result.variants.emotional.storyboard.scenes[0];
    console.log(`\nEmotional - Scene 1:`);
    console.log(`  Description: ${scene.description}`);
    console.log(`  Visual Style: ${scene.visual_style}`);
    console.log(`  Duration: ${scene.duration}s`);
  }

  if (result.variants.disruptive.storyboard.scenes[0]) {
    const scene = result.variants.disruptive.storyboard.scenes[0];
    console.log(`\nDisruptive - Scene 1:`);
    console.log(`  Description: ${scene.description}`);
    console.log(`  Visual Style: ${scene.visual_style}`);
    console.log(`  Duration: ${scene.duration}s`);
  }

  if (result.variants.dataDriven.storyboard.scenes[0]) {
    const scene = result.variants.dataDriven.storyboard.scenes[0];
    console.log(`\nData-Driven - Scene 1:`);
    console.log(`  Description: ${scene.description}`);
    console.log(`  Visual Style: ${scene.visual_style}`);
    console.log(`  Duration: ${scene.duration}s`);
  }

  console.log('\n' + '═'.repeat(70));
}

/**
 * Main test execution
 */
async function main() {
  console.log('🎬 Feature 3: Multi-Agent Creative Debate - E2E Test');
  console.log('═'.repeat(70));

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('✅ ANTHROPIC_API_KEY loaded');

  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.error('❌ Cannot proceed without Director server');
    console.error('   Run: npx tsx scripts/start-director.ts');
    process.exit(1);
  }

  // Run test
  const result = await testMultiVariantGeneration();

  if (!result) {
    console.error('\n❌ Test failed');
    process.exit(1);
  }

  // Display results
  displayResults(result);

  console.log('\n✅ Feature 3 E2E test completed successfully!');
  console.log('\nNext steps:');
  console.log('  • Integrate with Writer Agent for full pipeline');
  console.log('  • Test with Visual Creator for scene generation');
  console.log('  • Implement Feature 4: Feedback Loop');
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { testMultiVariantGeneration, displayResults };
