import { neon } from "@neondatabase/serverless"

// Validate environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

if (!process.env.NEON_API_KEY) {
  throw new Error("NEON_API_KEY environment variable is required")
}

// Create Neon SQL client with connection pooling
export const sql = neon(process.env.DATABASE_URL, {
  // Enable connection pooling for better performance
  pooled: true,
  // Set connection timeout
  connectionTimeoutMillis: 10000,
  // Set query timeout
  queryTimeoutMillis: 30000,
})

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as health_check`
    return result.length > 0
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Database configuration constants
export const DB_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  connectionTimeout: 10000,
  queryTimeout: 30000,
} as const

// Retry wrapper for database operations
export async function withRetry<T>(operation: () => Promise<T>, maxRetries: number = DB_CONFIG.maxRetries): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error)

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = DB_CONFIG.retryDelay * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}
