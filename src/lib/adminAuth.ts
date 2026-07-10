/**
 * Centralised role-based access control helper for Admin pages.
 *
 * Usage in a server page/layout:
 *   import { requireRole } from '@/lib/adminAuth'
 *   await requireRole(['admin', 'editor'])
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

/** Throws a redirect if the current user doesn't have one of the allowed roles. */
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/admin/login')
  const role = (session.user as any).role as string | undefined
  if (!role || !allowedRoles.includes(role)) redirect('/admin')
  return session
}

/** Returns true if the current role is in the allowed list (client-safe wrapper). */
export function can(userRole: string | undefined, allowedRoles: string[]): boolean {
  return !!userRole && allowedRoles.includes(userRole)
}

