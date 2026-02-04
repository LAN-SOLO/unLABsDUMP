/**
 * Re-export useAuth from the auth provider for backward compatibility.
 * The canonical source of truth for auth state is the AuthProvider context.
 * All components should import from '@/components/providers/auth-provider'.
 */
export { useAuth } from '@/components/providers/auth-provider'
export type { AuthUser, AuthContextValue } from '@/components/providers/auth-provider'
