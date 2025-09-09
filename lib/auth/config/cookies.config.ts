/**
 * Simplified cookie configuration for session management
 */

export const COOKIE_CONFIG = {
  name: 'session',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
};
