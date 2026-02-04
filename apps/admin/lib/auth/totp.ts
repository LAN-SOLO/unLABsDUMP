import { generateSecret, generateURI, verifySync } from 'otplib'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

export const TOTP_CONFIG = {
  issuer: 'UnstableLabs Admin',
  algorithm: 'sha1' as const,
  digits: 6 as const,
  period: 30,
}

const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY || 'default-totp-key-change-in-production'

function deriveKey(): Buffer {
  return scryptSync(ENCRYPTION_KEY, 'unstablelabs-totp-salt', 32)
}

/**
 * Encrypt a TOTP secret for storage
 */
export function encryptTOTPSecret(secret: string): string {
  const key = deriveKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(secret, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * Decrypt a TOTP secret from storage
 */
export function decryptTOTPSecret(encryptedSecret: string): string {
  // Handle unencrypted secrets (backward compatibility)
  if (!encryptedSecret.includes(':')) {
    return encryptedSecret
  }
  const [ivHex, authTagHex, encrypted] = encryptedSecret.split(':')
  const key = deriveKey()
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(): string {
  return generateSecret()
}

/**
 * Generate the otpauth URL for QR code generation
 */
export function generateTOTPUri(secret: string, accountName: string): string {
  return generateURI({
    label: accountName,
    issuer: TOTP_CONFIG.issuer,
    secret,
    algorithm: TOTP_CONFIG.algorithm,
    digits: TOTP_CONFIG.digits,
    period: TOTP_CONFIG.period,
  })
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    const result = verifySync({
      token,
      secret,
      digits: TOTP_CONFIG.digits,
      period: TOTP_CONFIG.period,
    })
    return result.valid
  } catch {
    return false
  }
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Array.from({ length: 8 }, () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      return chars[Math.floor(Math.random() * chars.length)]
    }).join('')
    codes.push(code)
  }
  return codes
}

/**
 * Hash backup codes for storage (simple hash for demo, use bcrypt in production)
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const bcrypt = await import('bcryptjs')
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)))
}

/**
 * Verify a backup code against hashed codes
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; index: number }> {
  const bcrypt = await import('bcryptjs')
  for (let i = 0; i < hashedCodes.length; i++) {
    if (await bcrypt.compare(code, hashedCodes[i])) {
      return { valid: true, index: i }
    }
  }
  return { valid: false, index: -1 }
}
