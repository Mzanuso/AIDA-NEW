/**
 * Logger Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from './logger';

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('createLogger', () => {
    it('should create a logger with a service name', () => {
      const logger = createLogger('TestService');
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should log info messages', () => {
      const logger = createLogger('TestService');
      logger.info('Test message');

      expect(consoleSpy.log).toHaveBeenCalledOnce();
      const logMessage = consoleSpy.log.mock.calls[0][0];
      expect(logMessage).toContain('[INFO]');
      expect(logMessage).toContain('[TestService]');
      expect(logMessage).toContain('Test message');
    });

    it('should log warn messages', () => {
      const logger = createLogger('TestService');
      logger.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalledOnce();
      const logMessage = consoleSpy.warn.mock.calls[0][0];
      expect(logMessage).toContain('[WARN]');
      expect(logMessage).toContain('[TestService]');
      expect(logMessage).toContain('Warning message');
    });

    it('should log error messages', () => {
      const logger = createLogger('TestService');
      logger.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalledOnce();
      const logMessage = consoleSpy.error.mock.calls[0][0];
      expect(logMessage).toContain('[ERROR]');
      expect(logMessage).toContain('[TestService]');
      expect(logMessage).toContain('Error message');
    });

    it('should log debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const logger = createLogger('TestService');
      logger.debug('Debug message');

      expect(consoleSpy.debug).toHaveBeenCalledOnce();
      const logMessage = consoleSpy.debug.mock.calls[0][0];
      expect(logMessage).toContain('[DEBUG]');
      expect(logMessage).toContain('[TestService]');
      expect(logMessage).toContain('Debug message');

      process.env.NODE_ENV = originalEnv;
    });

    it('should include context in log messages', () => {
      const logger = createLogger('TestService');
      const context = { userId: 123, action: 'test' };

      logger.info('Test with context', context);

      expect(consoleSpy.log).toHaveBeenCalledOnce();
      const logMessage = consoleSpy.log.mock.calls[0][0];
      expect(logMessage).toContain('Test with context');
      expect(logMessage).toContain(JSON.stringify(context));
    });

    it('should format timestamp in ISO format', () => {
      const logger = createLogger('TestService');
      logger.info('Test message');

      const logMessage = consoleSpy.log.mock.calls[0][0];
      // Check for ISO timestamp pattern
      expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle empty context gracefully', () => {
      const logger = createLogger('TestService');
      logger.info('Test message', {});

      expect(consoleSpy.log).toHaveBeenCalledOnce();
      const logMessage = consoleSpy.log.mock.calls[0][0];
      expect(logMessage).toContain('Test message');
      expect(logMessage).not.toContain('{}');
    });

    it('should handle undefined context gracefully', () => {
      const logger = createLogger('TestService');
      logger.info('Test message', undefined);

      expect(consoleSpy.log).toHaveBeenCalledOnce();
      const logMessage = consoleSpy.log.mock.calls[0][0];
      expect(logMessage).toContain('Test message');
    });
  });

  describe('Log Levels', () => {
    it('should respect minimum log level in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const logger = createLogger('TestService');

      // Debug should not log in production
      logger.debug('Debug message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();

      // Info should log in production
      logger.info('Info message');
      expect(consoleSpy.log).toHaveBeenCalledOnce();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
