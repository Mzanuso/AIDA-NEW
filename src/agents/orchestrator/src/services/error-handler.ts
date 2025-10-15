/**
 * Error Handler
 *
 * Comprehensive error handling system with:
 * 1. Error categorization (USER_INPUT, SERVICE_UNAVAILABLE, BUSINESS_LOGIC, TECHNICAL, RATE_LIMIT)
 * 2. Retry strategy with exponential backoff
 * 3. Circuit breaker pattern for failing services
 * 4. Multilingual error messages
 * 5. Error recovery strategies
 *
 * Based on production-grade error handling best practices.
 */

import { createLogger } from '@backend/utils/logger';
import { Language } from './language-detector';

const logger = createLogger('ErrorHandler');

/**
 * Error categories
 */
export enum ErrorCategory {
  USER_INPUT = 'USER_INPUT',           // Invalid user input (400-level)
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE', // External service down (503)
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',   // Business rule violation
  TECHNICAL = 'TECHNICAL',             // Technical errors (500-level)
  RATE_LIMIT = 'RATE_LIMIT',          // Rate limit exceeded (429)
  TIMEOUT = 'TIMEOUT',                 // Operation timeout
  AUTHENTICATION = 'AUTHENTICATION'    // Auth/permission errors (401/403)
}

/**
 * Recovery strategy
 */
export enum RecoveryStrategy {
  RETRY = 'RETRY',                     // Retry with backoff
  FALLBACK = 'FALLBACK',               // Use fallback mechanism
  PROMPT_USER = 'PROMPT_USER',         // Ask user for clarification
  FAIL_GRACEFULLY = 'FAIL_GRACEFULLY', // Return partial results
  ABORT = 'ABORT'                      // Cannot recover, abort operation
}

/**
 * Categorized error
 */
export class CategorizedError extends Error {
  public readonly category: ErrorCategory;
  public readonly recoveryStrategy: RecoveryStrategy;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;
  public readonly originalError?: Error;

  constructor(
    message: string,
    category: ErrorCategory,
    recoveryStrategy: RecoveryStrategy,
    options?: {
      retryable?: boolean;
      context?: Record<string, any>;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'CategorizedError';
    this.category = category;
    this.recoveryStrategy = recoveryStrategy;
    this.retryable = options?.retryable ?? (recoveryStrategy === RecoveryStrategy.RETRY);
    this.context = options?.context;
    this.originalError = options?.originalError;

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CategorizedError);
    }
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;      // Base delay in ms (default: 1000)
  maxDelay: number;       // Max delay in ms (default: 32000)
  exponentialBase: number; // Exponential base (default: 2)
  jitter: boolean;        // Add random jitter (default: true)
}

/**
 * Circuit breaker state
 */
enum CircuitState {
  CLOSED = 'CLOSED',   // Normal operation
  OPEN = 'OPEN',       // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

/**
 * Circuit breaker for a service
 */
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(
    private readonly serviceName: string,
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 60000, // 60 seconds
    private readonly halfOpenAttempts: number = 3
  ) {}

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      // Check if reset timeout elapsed
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        logger.info('Circuit breaker transitioning to HALF_OPEN', {
          service: this.serviceName
        });
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new CategorizedError(
          `Service ${this.serviceName} is currently unavailable (circuit breaker OPEN)`,
          ErrorCategory.SERVICE_UNAVAILABLE,
          RecoveryStrategy.RETRY,
          { retryable: false }
        );
      }
    }

    try {
      const result = await operation();

      // Success - update circuit state
      this.onSuccess();
      return result;
    } catch (error) {
      // Failure - update circuit state
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenAttempts) {
        logger.info('Circuit breaker closing after successful recovery', {
          service: this.serviceName
        });
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during recovery - back to OPEN
      logger.warn('Circuit breaker reopening after failed recovery attempt', {
        service: this.serviceName
      });
      this.state = CircuitState.OPEN;
      this.successCount = 0;
    } else if (this.state === CircuitState.CLOSED && this.failureCount >= this.failureThreshold) {
      // Threshold exceeded - open circuit
      logger.error('Circuit breaker opening due to failure threshold', {
        service: this.serviceName,
        failureCount: this.failureCount,
        threshold: this.failureThreshold
      });
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

/**
 * Multilingual error messages
 */
const ERROR_MESSAGES: Record<ErrorCategory, Record<Language, string>> = {
  [ErrorCategory.USER_INPUT]: {
    it: 'Non ho capito bene. Puoi dirmi più chiaramente cosa vuoi creare?',
    en: 'I didn\'t quite understand. Can you tell me more clearly what you want to create?',
    es: 'No entendí bien. ¿Puedes decirme más claramente qué quieres crear?',
    fr: 'Je n\'ai pas bien compris. Pouvez-vous me dire plus clairement ce que vous voulez créer?',
    de: 'Ich habe es nicht ganz verstanden. Kannst du mir klarer sagen, was du erstellen möchtest?'
  },
  [ErrorCategory.SERVICE_UNAVAILABLE]: {
    it: 'Accidenti, il servizio è momentaneamente non disponibile. Riprovo tra poco?',
    en: 'Oops, the service is temporarily unavailable. Should I try again in a moment?',
    es: 'Ups, el servicio no está disponible temporalmente. ¿Lo intento de nuevo en un momento?',
    fr: 'Oups, le service est temporairement indisponible. Dois-je réessayer dans un instant?',
    de: 'Hoppla, der Dienst ist vorübergehend nicht verfügbar. Soll ich es gleich nochmal versuchen?'
  },
  [ErrorCategory.BUSINESS_LOGIC]: {
    it: 'Non posso procedere: manca qualche informazione importante. Cosa ti serve?',
    en: 'I can\'t proceed: some important information is missing. What do you need?',
    es: 'No puedo continuar: falta información importante. ¿Qué necesitas?',
    fr: 'Je ne peux pas continuer: il manque des informations importantes. De quoi avez-vous besoin?',
    de: 'Ich kann nicht fortfahren: Es fehlen wichtige Informationen. Was brauchst du?'
  },
  [ErrorCategory.TECHNICAL]: {
    it: 'C\'è stato un problema tecnico. Vuoi che riprovi?',
    en: 'There was a technical problem. Want me to try again?',
    es: 'Hubo un problema técnico. ¿Quieres que lo intente de nuevo?',
    fr: 'Il y a eu un problème technique. Voulez-vous que je réessaie?',
    de: 'Es gab ein technisches Problem. Soll ich es nochmal versuchen?'
  },
  [ErrorCategory.RATE_LIMIT]: {
    it: 'Calma! Ho raggiunto il limite di richieste. Aspetta un attimo e riprovo.',
    en: 'Hold on! I\'ve reached the request limit. Wait a moment and I\'ll try again.',
    es: '¡Espera! He alcanzado el límite de solicitudes. Espera un momento y lo intentaré de nuevo.',
    fr: 'Attendez! J\'ai atteint la limite de requêtes. Attendez un instant et je réessaierai.',
    de: 'Warte! Ich habe das Anfragelimit erreicht. Warte einen Moment und ich versuche es erneut.'
  },
  [ErrorCategory.TIMEOUT]: {
    it: 'L\'operazione ha impiegato troppo tempo. Riprovo?',
    en: 'The operation took too long. Should I try again?',
    es: 'La operación tardó demasiado. ¿Lo intento de nuevo?',
    fr: 'L\'opération a pris trop de temps. Dois-je réessayer?',
    de: 'Der Vorgang hat zu lange gedauert. Soll ich es nochmal versuchen?'
  },
  [ErrorCategory.AUTHENTICATION]: {
    it: 'Non hai i permessi per questa operazione. Controlla il tuo account.',
    en: 'You don\'t have permission for this operation. Check your account.',
    es: 'No tienes permiso para esta operación. Verifica tu cuenta.',
    fr: 'Vous n\'avez pas la permission pour cette opération. Vérifiez votre compte.',
    de: 'Du hast keine Berechtigung für diesen Vorgang. Überprüfe dein Konto.'
  }
};

/**
 * Error Handler Service
 */
export class ErrorHandler {
  private readonly defaultRetryConfig: Required<RetryConfig> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 32000,
    exponentialBase: 2,
    jitter: true
  };

  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Categorize an error
   */
  categorizeError(error: any): CategorizedError {
    // Already categorized
    if (error instanceof CategorizedError) {
      return error;
    }

    // Anthropic API errors
    if (error.status) {
      switch (error.status) {
        case 400:
        case 422:
          return new CategorizedError(
            'Invalid request parameters',
            ErrorCategory.USER_INPUT,
            RecoveryStrategy.PROMPT_USER,
            { retryable: false, originalError: error }
          );

        case 401:
        case 403:
          return new CategorizedError(
            'Authentication or permission error',
            ErrorCategory.AUTHENTICATION,
            RecoveryStrategy.ABORT,
            { retryable: false, originalError: error }
          );

        case 429:
          return new CategorizedError(
            'Rate limit exceeded',
            ErrorCategory.RATE_LIMIT,
            RecoveryStrategy.RETRY,
            { retryable: true, originalError: error }
          );

        case 500:
        case 502:
        case 503:
        case 504:
          return new CategorizedError(
            'Service temporarily unavailable',
            ErrorCategory.SERVICE_UNAVAILABLE,
            RecoveryStrategy.RETRY,
            { retryable: true, originalError: error }
          );

        default:
          return new CategorizedError(
            'Unknown API error',
            ErrorCategory.TECHNICAL,
            RecoveryStrategy.RETRY,
            { retryable: true, originalError: error }
          );
      }
    }

    // Timeout errors
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return new CategorizedError(
        'Operation timeout',
        ErrorCategory.TIMEOUT,
        RecoveryStrategy.RETRY,
        { retryable: true, originalError: error }
      );
    }

    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new CategorizedError(
        'Network connection error',
        ErrorCategory.SERVICE_UNAVAILABLE,
        RecoveryStrategy.RETRY,
        { retryable: true, originalError: error }
      );
    }

    // Default: technical error
    return new CategorizedError(
      error.message || 'Unknown error',
      ErrorCategory.TECHNICAL,
      RecoveryStrategy.FAIL_GRACEFULLY,
      { retryable: false, originalError: error }
    );
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: CategorizedError | undefined;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const categorizedError = this.categorizeError(error);

        // Don't retry if not retryable
        if (!categorizedError.retryable || attempt === retryConfig.maxRetries) {
          logger.error('Operation failed (no more retries)', {
            attempt,
            maxRetries: retryConfig.maxRetries,
            category: categorizedError.category,
            error: categorizedError.message
          });
          throw categorizedError;
        }

        lastError = categorizedError;

        // Calculate delay with exponential backoff
        const delay = this.calculateBackoffDelay(
          attempt,
          retryConfig.baseDelay,
          retryConfig.maxDelay,
          retryConfig.exponentialBase,
          retryConfig.jitter
        );

        logger.warn('Operation failed, retrying', {
          attempt: attempt + 1,
          maxRetries: retryConfig.maxRetries,
          delayMs: delay,
          category: categorizedError.category,
          error: categorizedError.message
        });

        await this.sleep(delay);
      }
    }

    // Should never reach here, but TypeScript needs this
    throw lastError!;
  }

  /**
   * Get or create circuit breaker for a service
   */
  getCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker(serviceName));
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async executeWithCircuitBreaker<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName);
    return circuitBreaker.execute(operation);
  }

  /**
   * Execute operation with both retry and circuit breaker
   */
  async executeWithProtection<T>(
    serviceName: string,
    operation: () => Promise<T>,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName);

    return this.executeWithRetry(
      () => circuitBreaker.execute(operation),
      retryConfig
    );
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: CategorizedError, language: Language): string {
    const baseMessage = ERROR_MESSAGES[error.category][language];

    // Add context if available
    if (error.context?.userMessage) {
      return `${baseMessage} ${error.context.userMessage}`;
    }

    return baseMessage;
  }

  /**
   * Get recovery suggestion
   */
  getRecoverySuggestion(error: CategorizedError, language: Language): string {
    const suggestions: Record<RecoveryStrategy, Record<Language, string>> = {
      [RecoveryStrategy.RETRY]: {
        it: 'Riprovo automaticamente tra poco.',
        en: 'I\'ll automatically retry shortly.',
        es: 'Lo reintentaré automáticamente en breve.',
        fr: 'Je réessaierai automatiquement sous peu.',
        de: 'Ich versuche es automatisch gleich nochmal.'
      },
      [RecoveryStrategy.FALLBACK]: {
        it: 'Uso un metodo alternativo.',
        en: 'I\'ll use an alternative method.',
        es: 'Usaré un método alternativo.',
        fr: 'J\'utiliserai une méthode alternative.',
        de: 'Ich verwende eine alternative Methode.'
      },
      [RecoveryStrategy.PROMPT_USER]: {
        it: 'Dammi più dettagli per aiutarti meglio.',
        en: 'Give me more details so I can help you better.',
        es: 'Dame más detalles para poder ayudarte mejor.',
        fr: 'Donnez-moi plus de détails pour que je puisse mieux vous aider.',
        de: 'Gib mir mehr Details, damit ich dir besser helfen kann.'
      },
      [RecoveryStrategy.FAIL_GRACEFULLY]: {
        it: 'Ti mostro quello che sono riuscito a fare.',
        en: 'I\'ll show you what I managed to do.',
        es: 'Te mostraré lo que logré hacer.',
        fr: 'Je vais vous montrer ce que j\'ai réussi à faire.',
        de: 'Ich zeige dir, was ich geschafft habe.'
      },
      [RecoveryStrategy.ABORT]: {
        it: 'Non posso completare questa operazione.',
        en: 'I can\'t complete this operation.',
        es: 'No puedo completar esta operación.',
        fr: 'Je ne peux pas terminer cette opération.',
        de: 'Ich kann diesen Vorgang nicht abschließen.'
      }
    };

    return suggestions[error.recoveryStrategy][language];
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    exponentialBase: number,
    jitter: boolean
  ): number {
    // Exponential backoff: baseDelay * (exponentialBase ^ attempt)
    let delay = Math.min(baseDelay * Math.pow(exponentialBase, attempt), maxDelay);

    // Add jitter (random ±25%)
    if (jitter) {
      const jitterRange = delay * 0.25;
      delay = delay + (Math.random() * jitterRange * 2 - jitterRange);
    }

    return Math.floor(delay);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker status for all services
   */
  getCircuitBreakerStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.circuitBreakers.forEach((breaker, serviceName) => {
      status[serviceName] = breaker.getState();
    });
    return status;
  }
}
