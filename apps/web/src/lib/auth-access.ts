import type { AuthUser } from '@jewelry-erp/shared';

/** Owner (and seeded Administrator accounts with OWNER role) may manage users/passwords. */
export function canManageUsers(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.roles?.includes('OWNER')) return true;
  return Boolean(user.permissions?.includes('users.manage'));
}

export function canManageSettings(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.roles?.includes('OWNER')) return true;
  return Boolean(user.permissions?.includes('settings.manage'));
}
