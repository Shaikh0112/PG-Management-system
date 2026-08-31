'use client';
import { useState, useEffect } from 'react';
import { ticketsApi, Ticket } from '@/app/superadmin/lib/api/tickets';
import { ownersApi } from '@/app/owner/lib/api/owners';
import { Search, Plus, Filter, MessageSquare } from 'lucide-react';
import { StatusBadge } from '@/config/statusBadgeConfig';
import { Pagination } from '@/components/shared/Pagination';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Create Modal
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState({ ownerId: '', title: '', description: '', priority: 'Medium' });

  const loadData = () => {
    setTickets(ticketsApi.listTickets());
    setOwners(ownersApi.listOwners());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    ticketsApi.createTicketOnBehalf(formData);
    setCreateModal(false);
    setFormData({ ownerId: '', title: '', description: '', priority: 'Medium' });
    loadData();
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    ticketsApi.updateTicketStatus(id, newStatus);
    loadData();
  };

  const filtered = tickets.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const PriorityBadge = ({ p }: { p: string }) => {
    const color = p === 'High' ? 'text-[var(--danger)]' : p === 'Medium' ? 'text-[var(--warning)]' : 'text-[var(--success)]';
    return <span className={`text-[12px] font-medium ${color}`}>{p}</span>;
  };

  if (loading) return <div className="animate-pulse p-6">Loading tickets...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Support Tickets</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage issues reported by PG Owners.</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create on Behalf
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-card)] rounded-t-[var(--radius-lg,12px)]">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] pl-9 pr-4 py-2 rounded-[var(--radius-md,8px)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-secondary)] uppercase text-[12px] sticky top-0 z-10 shadow-sm shadow-black/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Issue</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold text-center">Priority</th>
                <th className="px-6 py-4 font-semibold text-center">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">No tickets found.</td></tr>
              ) : paginatedData.map(t => {
                const owner = owners.find(o => o.id === t.ownerId);
                return (
                  <tr key={t.id} className="h-12 even:bg-black/5 dark:even:bg-white/[0.02] hover:bg-[var(--primary-subtle)] transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)]">{t.title}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate max-w-[250px]">{t.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--text-primary)]">{owner?.name || 'Unknown'}</div>
                      <div className="text-[11px] text-[var(--text-disabled)]">{owner?.businessName}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <PriorityBadge p={t.priority} />
                    </td>
                    <td className="px-6 py-4 text-center text-[12px] text-[var(--text-secondary)]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={t.status} />
                        <select 
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          className="bg-transparent border border-[var(--border)] text-[11px] rounded-md px-1 focus:outline-none focus:border-[var(--primary)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="Open" className="text-black">Open</option>
                          <option value="In Progress" className="text-black">In Progress</option>
                          <option value="Resolved" className="text-black">Resolved</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>

      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl,16px)] p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Create Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Select Owner</label>
                <select required value={formData.ownerId} onChange={e=>setFormData({...formData, ownerId: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2.5 rounded-[var(--radius-md,8px)] focus:border-[var(--primary)] focus:outline-none text-sm">
                  <option value="">-- Choose Owner --</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.businessName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Title</label>
                <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2.5 rounded-[var(--radius-md,8px)] focus:border-[var(--primary)] focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2.5 rounded-[var(--radius-md,8px)] focus:border-[var(--primary)] focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Priority</label>
                <select value={formData.priority} onChange={e=>setFormData({...formData, priority: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2.5 rounded-[var(--radius-md,8px)] focus:border-[var(--primary)] focus:outline-none text-sm">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-md">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-md">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}