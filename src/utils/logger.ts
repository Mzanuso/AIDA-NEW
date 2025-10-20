/**
 * Sistema di logging centralizzato per AIDA
 */

// Tipi di log supportati
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Interfaccia del logger
export interface Logger {
  debug: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
}

// Mappa di livelli di log per determinare cosa stampare
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Colori ANSI per i log in console
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Colori per i livelli di log
const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: COLORS.gray,
  info: COLORS.green,
  warn: COLORS.yellow,
  error: COLORS.red
};

/**
 * Crea un logger per un componente specifico
 */
export function createLogger(component: string): Logger {
  // Usa il livello di log da env, default a 'info'
  const logLevelEnv = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
  const minLevel = LOG_LEVELS[logLevelEnv] ?? LOG_LEVELS.info;

  // Funzione generica per log
  const log = (level: LogLevel, message: string, meta?: any) => {
    if (LOG_LEVELS[level] < minLevel) return;

    const timestamp = new Date().toISOString();
    const color = LEVEL_COLORS[level];
    const levelStr = level.toUpperCase().padEnd(5);

    let logMessage = `${COLORS.dim}${timestamp}${COLORS.reset} ${color}${levelStr}${COLORS.reset} [${COLORS.cyan}${component}${COLORS.reset}] ${message}`;

    // Aggiungi oggetto meta se presente
    if (meta) {
      // Tenta di formattare errori
      if (meta instanceof Error) {
        meta = {
          name: meta.name,
          message: meta.message,
          stack: meta.stack,
          ...(meta as any)
        };
      }

      try {
        const metaStr = JSON.stringify(meta, null, 2);
        if (metaStr !== '{}') {
          if (metaStr.length > 500 && level !== 'error') {
            // Tronca meta-dati lunghi per non intasare i log
            logMessage += `\n${metaStr.substring(0, 500)}... (troncato)`;
          } else {
            logMessage += `\n${metaStr}`;
          }
        }
      } catch (e) {
        logMessage += `\nImpossibile formattare i meta-dati: ${e}`;
      }
    }

    // Log su console
    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      default:
        console.log(logMessage);
    }

    // Qui si potrebbero aggiungere altre destinazioni di log
    // come file, servizi di log remoti, etc.
  };

  // Ritorna l'interfaccia del logger
  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta)
  };
}

// Logger di default
export const logger = createLogger('App');
