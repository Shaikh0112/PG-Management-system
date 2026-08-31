import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

export const ticketsApi = {
  listTickets() {
    let tickets = db.getAll<Ticket>('spg_tickets' as any);
    if (tickets.length === 0) {
      // Seed dummy tickets
      const dummy = [
        { id: createId('tkt'), title: 'App not loading on mobile', description: 'Students are complaining app is stuck on white screen.', status: 'Open', priority: 'High', ownerId: 'own_1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: createId('tkt'), title: 'Need custom GST format', description: 'Can you change the invoice format for my state?', status: 'Resolved', priority: 'Low', ownerId: 'own_1', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() }
      ];
      dummy.forEach(d => db.insert('spg_tickets' as any, d as any));
      tickets = dummy as Ticket[];
    }
    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  createTicketOnBehalf(data: { ownerId: string, title: string, description: string, priority: string }) {
    const ticket = {
      id: createId('tkt'),
      ...data,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'superadmin',
      updatedBy: 'superadmin',
      isDeleted: false
    };
    db.insert('spg_tickets' as any, ticket as any);
    return ticket;
  },
  
  updateTicketStatus(id: string, status: string) {
    db.update<Ticket>('spg_tickets' as any, id, { status } as any);
  }
};
