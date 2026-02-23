/**
 * Dev Area Library
 *
 * Exports all dev area utilities for convenience.
 */

// Config
export {
  DEV_CONFIG,
  DEV_ENV_KEYS,
  isDevAreaEnabled,
  getMasterWallet,
  getPassphraseHash,
  getEncryptionKey,
  getSessionSecret,
  validateDevConfig,
  type DevAccessEventType,
} from './config'

// Crypto
export {
  generateChallenge,
  parseChallenge,
  encryptPayload,
  decryptPayload,
  hashFingerprint,
  sha256,
  randomHex,
  compareFingerprints,
  type BrowserFingerprint,
} from './crypto'

// Auth
export {
  isWalletWhitelisted,
  verifyWalletSignature,
  verifyPassphrase,
  isChallengeValid,
  performWalletVerification,
  performPassphraseVerification,
  type AuthStepResult,
} from './auth'

// Session
export {
  createSession,
  validateSession,
  getSessionTimeRemaining,
  isSessionExpiringSoon,
  extractSession,
  type DevSession,
  type SessionValidationResult,
  type SessionValidationError,
} from './session'

// Rate Limit
export {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  getAttemptHistory,
  clearLockout,
  getActiveLockouts,
  type RateLimitResult,
} from './rate-limit'

// Audit
export {
  logDevAccess,
  logChallengeIssued,
  logSignatureVerified,
  logPassphraseVerified,
  logSessionCreated,
  logAccessDenied,
  logSessionExpired,
  logLockoutTriggered,
  logLogout,
  logSessionValidated,
  fetchAccessLogs,
  type DevAccessLogEntry,
  type DevAccessLog,
} from './audit'

// Middleware
export {
  isDevAreaPath,
  isDevApiPath,
  isDevAuthPath,
  handleDevAreaMiddleware,
  getClientIp,
  getUserAgent,
} from './middleware'
