import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { User } from '../types/models';
import { SessionUser, Role } from '../types';

export const authApi = {
  login({ email, password, expectedRole }: { email: string; password?: string; expectedRole?: Role }) {
    const users = db.getAll<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email && u.email.toLowerCase().trim() === email.toLowerCase().trim() && !u.isDeleted && u.status === 'Active' && (!expectedRole || u.role === expectedRole));
    
    if (!user) throw new Error('User not found or inactive');
    if (password && user.password !== password) throw new Error('Invalid password');

    const sessionUser: SessionUser = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      propertyId: user.propertyId,
      ownerId: user.ownerId,
      assignedPropertyIds: user.assignedPropertyIds,
      mustChangePassword: user.mustChangePassword
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sessionUser));
    }
    
    return sessionUser;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  },

  currentUser(): SessionUser | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return data ? JSON.parse(data) : null;
  },

  changePassword(userId: string, newPassword: string) {
    const user = db.getById<User>(STORAGE_KEYS.USERS, userId);
    if (!user) throw new Error('User not found');
    db.update<User>(STORAGE_KEYS.USERS, userId, { 
      password: newPassword, 
      mustChangePassword: false 
    });
  }
};
