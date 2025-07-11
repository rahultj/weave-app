/**
 * Environment Variables Validation
 * 
 * This module validates all required environment variables for the Weave app.
 * Call validateEnv() at app startup to ensure all necessary variables are present.
 */

interface RequiredEnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  ANTHROPIC_API_KEY: string
}

interface OptionalEnvVars {
  NODE_ENV?: string
  NEXT_PUBLIC_APP_ENV?: string
}

export type EnvVars = RequiredEnvVars & OptionalEnvVars

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
export function validateEnv(): EnvVars {
  const errors: string[] = []

  // Check required variables
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ANTHROPIC_API_KEY'
  ]

  const missingVars: string[] = []
  const invalidVars: string[] = []

  requiredVars.forEach(varName => {
    const value = process.env[varName]
    
    if (!value) {
      missingVars.push(varName)
    } else if (value.trim().length === 0) {
      invalidVars.push(`${varName} (empty string)`)
    } else {
      // Additional validation for specific variables
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && !isValidUrl(value)) {
        invalidVars.push(`${varName} (invalid URL format)`)
      }
      
      if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && value.length < 100) {
        invalidVars.push(`${varName} (appears to be too short for a valid Supabase key)`)
      }
      
      if (varName === 'ANTHROPIC_API_KEY' && !value.startsWith('sk-ant-')) {
        invalidVars.push(`${varName} (does not appear to be a valid Anthropic API key)`)
      }
    }
  })

  // Collect all errors
  if (missingVars.length > 0) {
    errors.push(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  if (invalidVars.length > 0) {
    errors.push(`Invalid environment variables: ${invalidVars.join(', ')}`)
  }

  // If there are errors, throw with detailed instructions
  if (errors.length > 0) {
    const errorMessage = `
❌ Environment Variables Validation Failed

${errors.join('\n')}

🔧 How to fix:

1. Create a .env.local file in your project root if it doesn't exist
2. Add the following variables:

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_anthropic_api_key

3. Get your Supabase credentials from:
   https://app.supabase.com/project/YOUR_PROJECT/settings/api

4. Get your Anthropic API key from:
   https://console.anthropic.com/

5. Restart your development server after adding the variables

📝 Note: Make sure .env.local is in your .gitignore file to keep your secrets safe!
    `.trim()

    throw new Error(errorMessage)
  }

  // Return typed environment variables
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV
  }
}

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

/**
 * Gets validated environment variables
 * This is safe to call after validateEnv() has been called
 */
export function getEnv(): EnvVars {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV
  }
}

/**
 * Checks if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Checks if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Initialize environment validation
 * Call this at app startup
 */
export function initializeEnv(): void {
  try {
    validateEnv()
    console.log('✅ Environment variables validated successfully')
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    process.exit(1)
  }
} 