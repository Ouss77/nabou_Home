import bcrypt from "bcryptjs"

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long")
  }

  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false
  }

  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

/**
 * Generate a secure random password
 */
export function generatePassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return password
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
