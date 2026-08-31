import { getSession } from './session';
import { Role } from '../types';

export function requireRole(expectedRole: Role) {
  const session = getSession();
  if (!session) return false;
  return session.role === expectedRole;
}
