export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'player-secret-key-change-in-production',
  JWT_EXPIRY: '7d',
  COOKIE_NAME: 'player_session',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  CHALLENGE_EXPIRY: 5 * 60 * 1000, // 5 minutes
  MESSAGE_PREFIX: 'Sign this message to authenticate with UnstableLabs:\n\nNonce: ',
  TOKEN_MINT: '7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT',
  REFRESH_THRESHOLD: 24 * 60 * 60, // 1 day in seconds - refresh if less than this remaining
}
