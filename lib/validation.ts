// Environment validation for development setup
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export const validateEnvironment = (): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  // Optional but recommended environment variables
  const optionalEnvVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
  ]

  // Check required variables
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`)
    }
  })

  // Check optional variables
  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(`Missing optional environment variable: ${envVar}`)
    }
  })

  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    warnings.push('Supabase URL should point to a valid Supabase project')
  }

  // Check for development/production context
  if (process.env.NODE_ENV === 'production' && warnings.length > 0) {
    errors.push(...warnings.map(w => w.replace('Missing optional', 'Missing required (in production)')))
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

export const logValidationResults = () => {
  const result = validateEnvironment()
  
  if (result.valid) {
    console.log('✅ Environment validation passed')
  } else {
    console.error('❌ Environment validation failed:')
    result.errors.forEach(error => console.error(`  - ${error}`))
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
  
  return result
}

// Development setup helper
export const getSetupInstructions = (): string[] => {
  const instructions = [
    '1. Copy .env.local.example to .env.local',
    '2. Create a Supabase project at https://supabase.com',
    '3. Get your project URL and anon key from Project Settings > API',
    '4. Set up Google OAuth in Authentication > Providers',
    '5. Get a Gemini API key from https://aistudio.google.com/app/apikey',
    '6. Fill in the environment variables in .env.local',
    '7. Run the database setup when ready',
  ]
  
  return instructions
} 