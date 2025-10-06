import { logger } from './logger';

/**
 * Environment variable configuration with defaults and validation
 */
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGIN: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

/**
 * Parse comma-separated string to array
 */
function parseArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  return value.split(',').map(v => v.trim()).filter(Boolean);
}

/**
 * Parse string to integer with fallback
 */
function parseInteger(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate and load environment variables with defaults
 * Exits the process if critical env vars are missing
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Critical: DATABASE_URL (no default, must be provided)
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  // Log validation errors and exit if critical env vars are missing
  if (errors.length > 0) {
    logger.fatal({ errors }, 'Environment variable validation failed');
    process.exit(1);
  }

  // Build config with defaults
  const config: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInteger(process.env.PORT, 5005),
    DATABASE_URL: process.env.DATABASE_URL as string, // Already validated above
    CORS_ORIGIN: parseArray(
      process.env.CORS_ORIGIN,
      [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ]
    ),
    RATE_LIMIT_WINDOW_MS: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 100)
  };

  // Log loaded configuration (mask sensitive values)
  logger.info({
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    DATABASE_URL: config.DATABASE_URL.replace(/:[^:@]+@/, ':****@'), // Mask password
    CORS_ORIGIN: config.CORS_ORIGIN,
    RATE_LIMIT_WINDOW_MS: config.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: config.RATE_LIMIT_MAX_REQUESTS
  }, 'Environment configuration loaded successfully');

  return config;
}
