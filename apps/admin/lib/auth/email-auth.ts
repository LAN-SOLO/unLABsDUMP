import bcrypt from 'bcryptjs'

const PASSWORD_HISTORY_LIMIT = 5

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if a password has been used recently
 */
export async function checkPasswordHistory(
  newPassword: string,
  passwordHistory: string[]
): Promise<boolean> {
  for (const oldHash of passwordHistory) {
    if (await bcrypt.compare(newPassword, oldHash)) {
      return true // Password was used before
    }
  }
  return false
}

/**
 * Add a password hash to the history, keeping only the last N entries
 */
export function updatePasswordHistory(currentHash: string, history: string[]): string[] {
  const newHistory = [currentHash, ...history]
  return newHistory.slice(0, PASSWORD_HISTORY_LIMIT)
}
