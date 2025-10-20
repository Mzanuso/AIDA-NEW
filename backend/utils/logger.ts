/**
 * Logger Utility
 *
 * Production-grade logging system with:
 * - Multiple log levels (debug, info, warn, error)
 * - Structured logging with context
 * - Environment-aware output
 * - Timestamp formatting
 * - Service name tracking
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Logger {
  debug(_message: string, _context?: LogContext): void;
  info(_message: string, _context?: LogContext): void;
  warn(_message: string, _context?: LogContext): void;
  error(_message: string, _context?: LogContext): void;
}

class LoggerImpl implements Logger {
  private serviceName: string;
  private minLevel: LogLevel;

  constructor(serviceName: string, minLevel: LogLevel = LogLevel.INFO) {
    this.serviceName = serviceName;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = this.formatTimestamp();
    const baseMessage = `[${timestamp}] [${level}] [${this.serviceName}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      return `${baseMessage} ${JSON.stringify(context)}`;
    }

    return baseMessage;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('ERROR', message, context));
    }
  }
}

/**
 * Factory function to create a logger instance for a service
 *
 * @param serviceName - Name of the service/module using this logger
 * @returns Logger instance
 *
 * @example
 * const logger = createLogger('ErrorHandler');
 * logger.info('Processing request', { userId: 123 });
 * logger.error('Operation failed', { error: err.message });
 */
export function createLogger(serviceName: string): Logger {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const minLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

  return new LoggerImpl(serviceName, minLevel);
}

/**
 * Pre-configured loggers for common services
 */
export const loggers = {
  orchestrator: createLogger('Orchestrator'),
  styleSelector: createLogger('StyleSelector'),
  database: createLogger('Database'),
  api: createLogger('API'),
};
