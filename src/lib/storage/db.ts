import { BaseEntity } from '../types';

const isBrowser = typeof window !== 'undefined';

function getStorageItem(key: string): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(key);
}

function setStorageItem(key: string, value: string): void {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
}

export const db = {
  getAll<T extends BaseEntity>(key: string): T[] {
    const data = getStorageItem(key);
    return data ? JSON.parse(data) : [];
  },

  getById<T extends BaseEntity>(key: string, id: string): T | undefined {
    const items = this.getAll<T>(key);
    return items.find((item) => item.id === id);
  },

  insert<T extends BaseEntity>(key: string, item: T): T {
    const items = this.getAll<T>(key);
    items.push(item);
    setStorageItem(key, JSON.stringify(items));
    return item;
  },

  update<T extends BaseEntity>(key: string, id: string, patch: Partial<T>): T | null {
    const items = this.getAll<T>(key);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...patch, updatedAt: new Date().toISOString() };
    setStorageItem(key, JSON.stringify(items));
    return items[index];
  },

  remove<T extends BaseEntity>(key: string, id: string): boolean {
    const items = this.getAll<T>(key);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    items[index].isDeleted = true;
    items[index].updatedAt = new Date().toISOString();
    setStorageItem(key, JSON.stringify(items));
    return true;
  },

  query<T extends BaseEntity>(key: string, predicate: (item: T) => boolean): T[] {
    const items = this.getAll<T>(key);
    return items.filter(predicate);
  },

  replaceAll<T extends BaseEntity>(key: string, items: T[]): void {
    setStorageItem(key, JSON.stringify(items));
  }
};
