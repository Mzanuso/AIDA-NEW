/**
 * Style Routes
 *
 * API endpoints for Style Selector Agent
 * Following AIDA-FLOW pattern from Orchestrator
 */

import { Router, Request, Response } from 'express';
import { StyleService } from './style.service';
import { ApiResponse, StyleResponse } from './types';

const router = Router();
const styleService = new StyleService();

/** GET /api/styles - Get all available styles */
router.get('/', async (req: Request, res: Response) => {
  try {
    const styles = await styleService.getAllStyles();
    res.json({ success: true, data: styles });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch styles' });
  }
});

/** GET /api/styles/search - Search styles (must be before /:id) */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { keyword, tags, category, limit } = req.query;
    const parsedTags = tags ? (tags as string).split(',').map(t => t.trim()) : undefined;
    const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;

    const results = await styleService.searchStyles({
      keyword: keyword as string | undefined,
      tags: parsedTags,
      category: category as string | undefined,
      limit: parsedLimit
    });

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to search styles' });
  }
});

/** GET /api/styles/:id - Get single style by ID */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const style = await styleService.getStyleById(id);

    if (!style) {
      return res.status(404).json({ success: false, error: `Style not found: ${id}` });
    }

    res.json({ success: true, data: style });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch style' });
  }
});

export default router;
