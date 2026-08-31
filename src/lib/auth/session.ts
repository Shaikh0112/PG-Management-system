import { SessionUser } from '../types';

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('spg_current_session');
  if (!data) return null;
  try {
    const user = JSON.parse(data) as SessionUser;
    
    // Auto-migrate legacy 'tenant' role to 'student'
    if (user && (user.role as any) === 'tenant') {
      user.role = 'student' as any;
      localStorage.setItem('spg_current_session', JSON.stringify(user));
    }
    
    return user;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('spg_current_session', JSON.stringify(user));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('spg_current_session');
  }
}
