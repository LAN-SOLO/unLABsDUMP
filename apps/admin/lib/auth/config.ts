export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRY: '24h',
  COOKIE_NAME: 'admin_session',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  CHALLENGE_EXPIRY: 5 * 60 * 1000, // 5 minutes
  MESSAGE_PREFIX: 'Sign this message to authenticate with UnstableLabs Admin:\n\nNonce: ',
}
