/**
 * HTTP Switch Skeleton
 * 
 * This module provides the structural foundation for switching the application
 * from `localStorage` (local mode) to a real backend (http mode).
 */

export const API_MODE: 'local' | 'http' = 'local'; // Set to 'http' to activate backend calls
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface HttpResponse<T> {
  data: T;
  error?: string;
  status: number;
}

/**
 * A generic HTTP fetcher that will be used when API_MODE === 'http'
 */
export async function httpFetch<T>(endpoint: string, options?: RequestInit): Promise<HttpResponse<T>> {
  if (API_MODE === 'local') {
    throw new Error('httpFetch called but API_MODE is local. This should be routed to local adapters.');
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
        // Add Authorization headers here if needed
      }
    });

    const data = await res.json();
    return {
      data,
      status: res.status,
      error: res.ok ? undefined : data.message || 'An error occurred'
    };
  } catch (err: any) {
    return {
      data: null as any,
      status: 500,
      error: err.message
    };
  }
}

/**
 * Example usage pattern for future API refactors:
 * 
 * export const usersApi = {
 *   getById: async (id: string) => {
 *     if (API_MODE === 'local') {
 *       return localDb.get('users', id);
 *     }
 *     const res = await httpFetch(`/users/${id}`);
 *     return res.data;
 *   }
 * }
 */
