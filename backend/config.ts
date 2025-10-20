/**
 * Centralized Configuration
 *
 * Type-safe configuration management with:
 * - Environment variable validation
 * - Default values
 * - Runtime configuration checks
 * - Development/Production modes
 */

export interface Config {
  // Environment
  env: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // API Keys
  anthropicApiKey: string;
  openaiApiKey: string;
  falApiKey: string;
  kieApiKey: string;

  // Database
  databaseUrl: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseAnonKey: string;
  neonKey?: string;
  neonPassword?: string;

  // Server Ports
  orchestratorPort: number;
  styleServicePort: number;
}

/**
 * Load and validate environment variables
 */
function loadConfig(): Config {
  const env = (process.env.NODE_ENV || 'development') as Config['env'];

  // Required in production, optional in development
  const requireInProduction = (key: string, fallback?: string): string => {
    const value = process.env[key] || fallback;
    if (!value && env === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || '';
  };

  return {
    // Environment
    env,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test',

    // API Keys
    anthropicApiKey: requireInProduction('ANTHROPIC_API_KEY'),
    openaiApiKey: requireInProduction('OPENAI_API_KEY'),
    falApiKey: requireInProduction('FAL_API_KEY', process.env.FAL_KEY),
    kieApiKey: requireInProduction('KIE_API_KEY'),

    // Database
    databaseUrl: requireInProduction('DATABASE_URL'),
    supabaseUrl: requireInProduction('SUPABASE_URL'),
    supabaseServiceRoleKey: requireInProduction('SUPABASE_SERVICE_ROLE_KEY'),
    supabaseAnonKey: requireInProduction(
      'SUPABASE_ANON_KEY',
      process.env.SUPABASE_KEY
    ),
    neonKey: process.env.NEON_KEY,
    neonPassword: process.env.NEON_Password,

    // Server Ports
    orchestratorPort: parseInt(process.env.ORCHESTRATOR_PORT || '3003', 10),
    styleServicePort: parseInt(process.env.STYLE_SERVICE_PORT || '3002', 10),
  };
}

// Singleton instance
let configInstance: Config | null = null;

/**
 * Get application configuration
 *
 * @returns Configuration object
 *
 * @example
 * import { getConfig } from '@backend/config';
 *
 * const config = getConfig();
 * const client = new Anthropic({ apiKey: config.anthropicApiKey });
 */
export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Reset configuration (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}

/**
 * Validate that all required configuration is present
 *
 * @throws Error if required configuration is missing
 */
export function validateConfig(): void {
  const config = getConfig();

  const required: Array<keyof Config> = [
    'anthropicApiKey',
    'databaseUrl',
    'supabaseUrl',
  ];

  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0 && config.isProduction) {
    throw new Error(
      `Missing required configuration: ${missing.join(', ')}`
    );
  }
}

// Export singleton instance as default
export default getConfig();
