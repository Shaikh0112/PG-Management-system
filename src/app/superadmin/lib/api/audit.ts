import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';
import { BaseEntity, Role } from '../types';

export interface AuditLog extends BaseEntity {
  actorId: string;
  actorRole: Role;
  action: string;
  entity: string;
  entityId: string;
  meta?: any;
}

export const auditApi = {
  write(params: Omit<AuditLog, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>) {
    const log: AuditLog = {
      id: createId('log'),
      ...params,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: params.actorId,
      updatedBy: params.actorId,
      isDeleted: false
    };
    return db.insert(STORAGE_KEYS.AUDIT_LOGS, log);
  },
  
  getAll() {
    return db.getAll<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
  }
};
