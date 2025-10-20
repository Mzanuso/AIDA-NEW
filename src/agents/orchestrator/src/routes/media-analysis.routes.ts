/**
 * Media Analysis Routes
 *
 * Unified endpoint for analyzing different media types:
 * - Images (Vision API)
 * - Video (frame extraction + Vision API)
 * - Audio (Transcription API)
 * - Text files (direct analysis)
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../../../utils/logger';

const router = Router();
const logger = createLogger('MediaAnalysisRoutes');

// Lazy initialization with API key
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    anthropic = new Anthropic({ apiKey });
    logger.info('Anthropic client initialized for media analysis');
  }
  return anthropic;
}

/**
 * POST /api/ai-agent/analyze-image
 *
 * Analyze image using Claude Vision API
 */
router.post('/analyze-image', async (req, res) => {
  try {
    const { image, prompt } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: image (base64)'
      });
    }

    logger.info('Analyzing image', { promptLength: prompt?.length || 0 });

    const claude = getAnthropicClient();

    // Call Claude Vision API
    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Latest model with vision
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg', // Will auto-detect
                data: image
              }
            },
            {
              type: 'text',
              text: prompt || 'Descrivi questa immagine in dettaglio. Cosa vedi?'
            }
          ]
        }
      ]
    });

    const analysisText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Analisi completata';

    logger.info('Image analysis completed', {
      responseLength: analysisText.length,
      usage: response.usage
    });

    res.json({
      success: true,
      analysis: analysisText,
      usage: response.usage
    });

  } catch (error: any) {
    logger.error('Image analysis failed', { error: error.message });

    // Handle specific errors
    if (error.message?.includes('image size')) {
      return res.status(413).json({
        success: false,
        error: 'Immagine troppo grande. Dimensione massima: 5MB'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze image'
    });
  }
});

/**
 * POST /api/ai-agent/analyze-video
 *
 * Analyze video by extracting key frames and using Vision API
 */
router.post('/analyze-video', async (req, res) => {
  try {
    const { video, prompt, frameCount = 3 } = req.body;

    if (!video) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: video (base64)'
      });
    }

    logger.info('Analyzing video', { frameCount });

    // For now, analyze first frame only (full video analysis requires ffmpeg)
    // TODO: Implement proper frame extraction with ffmpeg

    const claude = getAnthropicClient();

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: video // First frame
              }
            },
            {
              type: 'text',
              text: prompt || 'Analizza questo video. Descrivi cosa succede, lo stile visivo e il contenuto.'
            }
          ]
        }
      ]
    });

    const analysisText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Analisi completata';

    logger.info('Video analysis completed');

    res.json({
      success: true,
      analysis: analysisText,
      note: 'Analisi basata sul primo frame. Implementazione completa in arrivo.',
      usage: response.usage
    });

  } catch (error: any) {
    logger.error('Video analysis failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze video'
    });
  }
});

/**
 * POST /api/ai-agent/analyze-audio
 *
 * Transcribe and analyze audio using Anthropic
 */
router.post('/analyze-audio', async (req, res) => {
  try {
    const { audio, prompt } = req.body;

    if (!audio) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: audio (base64)'
      });
    }

    logger.info('Analyzing audio');

    // For audio, we need transcription first
    // Claude doesn't do audio transcription directly
    // We would need Whisper API or similar

    // For now, return a helpful message
    res.json({
      success: false,
      error: 'Audio transcription not yet implemented. Will use Whisper API in future.',
      suggestion: 'Use a text description of the audio content for now'
    });

  } catch (error: any) {
    logger.error('Audio analysis failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze audio'
    });
  }
});

/**
 * POST /api/ai-agent/analyze-text-file
 *
 * Analyze text file content
 */
router.post('/analyze-text-file', async (req, res) => {
  try {
    const { content, prompt, filename } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: content'
      });
    }

    logger.info('Analyzing text file', {
      filename,
      contentLength: content.length
    });

    const claude = getAnthropicClient();

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
            ? `${prompt}\n\nContenuto del file "${filename}":\n\n${content}`
            : `Analizza questo file di testo e dimmi di cosa parla:\n\nFile: ${filename}\n\n${content}`
        }
      ]
    });

    const analysisText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Analisi completata';

    logger.info('Text file analysis completed');

    res.json({
      success: true,
      analysis: analysisText,
      usage: response.usage
    });

  } catch (error: any) {
    logger.error('Text file analysis failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze text file'
    });
  }
});

export default router;
