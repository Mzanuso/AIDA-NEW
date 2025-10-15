/**
 * Style Routes Tests
 *
 * Test-first approach for Style Selector API endpoints
 * Following AIDA-FLOW methodology
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import styleRoutes from './style.routes';

describe('Style Selector API', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/styles', styleRoutes);
  });

  describe('GET /api/styles', () => {
    it('should return list of all styles', async () => {
      const response = await request(app).get('/api/styles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return styles with correct structure', async () => {
      const response = await request(app).get('/api/styles');
      const style = response.body.data[0];

      expect(style).toHaveProperty('id');
      expect(style).toHaveProperty('name');
      expect(style).toHaveProperty('description');
      expect(style).toHaveProperty('category');
      expect(style).toHaveProperty('tags');
      expect(style).toHaveProperty('images');
      expect(style).toHaveProperty('palette');
      expect(style).toHaveProperty('technicalDetails');

      // Check nested structures
      expect(style.images).toHaveProperty('thumbnail');
      expect(style.images).toHaveProperty('full');
      expect(Array.isArray(style.images.full)).toBe(true);

      expect(style.technicalDetails).toHaveProperty('medium');
      expect(style.technicalDetails).toHaveProperty('style');
      expect(Array.isArray(style.technicalDetails.medium)).toBe(true);
      expect(Array.isArray(style.technicalDetails.style)).toBe(true);
    });
  });

  describe('GET /api/styles/:id', () => {
    it('should return single style by id', async () => {
      const response = await request(app).get('/api/styles/test-001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 'test-001');
    });

    it('should return 404 for non-existent style', async () => {
      const response = await request(app).get('/api/styles/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/styles/search', () => {
    it('should search styles by keyword', async () => {
      const response = await request(app)
        .get('/api/styles/search')
        .query({ keyword: 'minimal' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search styles by tags', async () => {
      const response = await request(app)
        .get('/api/styles/search')
        .query({ tags: 'modern,clean' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/styles/search')
        .query({ keyword: 'nonexistentstylethatdoesnotexist' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });
});
