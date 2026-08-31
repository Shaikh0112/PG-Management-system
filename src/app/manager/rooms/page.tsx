'use client';

import { useState, useEffect } from 'react';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { api } from '@/lib/api';
import { Room } from '@/app/owner/lib/api/rooms';
import { getSession } from '@/lib/auth/session';
import { Search, Filter, BedDouble, AlertCircle, CheckCircle2, ChevronRight, Hash, User, Users } from 'lucide-react';
import Link from 'next/link';

export default function ManagerRoomsPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  
  const [rooms, setRooms] = useState<(Room & { bedsCount: number; vacantCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filters & Pagination
  const [showFilters, setShowFilters] = useState(false);
  const [filterSharing, setFilterSharing] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = () => {
    if (!user || !selectedPropertyId) return;
    setLoading(true);
    
    const allRooms = api.rooms.listByProperty(selectedPropertyId);

    const enhanced = allRooms.map(r => {
      const beds = api.beds.listByRoom(r.id);
      return {
        ...r,
        bedsCount: beds.length,
        vacantCount: beds.filter(b => b.status === 'available' || b.status === 'vacant').length
      };
    });

    setRooms(enhanced);
    setLoading(false);
  };

  useEffect(() => {
    if (!ctxLoading && selectedPropertyId) {
      loadData();
    }
  }, [selectedPropertyId, ctxLoading, user?.id]);

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = (r.number || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.floor || '').toString().includes(searchQuery);
    
    let matchesSharing = true;
    if (filterSharing !== 'all') matchesSharing = r.sharing === parseInt(filterSharing);
    
    let matchesStatus = true;
    if (filterStatus === 'available') matchesStatus = r.vacantCount > 0;
    if (filterStatus === 'occupied') matchesStatus = r.vacantCount === 0;

    return matchesSearch && matchesSharing && matchesStatus;
  });

  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, r) => acc + r.bedsCount, 0);
  const vacantBeds = rooms.reduce((acc, r) => acc + r.vacantCount, 0);
  const filledBeds = totalBeds - vacantBeds;

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSharing, filterStatus, selectedPropertyId]);

  if (ctxLoading) {
    return <div className="p-6 animate-pulse">Loading rooms...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Rooms Directory</h1>
          <p className="text-sm text-[var(--text-secondary)]">View and manage rooms for your assigned property.</p>
        </div>
      </div>

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Total Rooms</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{totalRooms}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[var(--primary)]">
            <Hash className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Total Beds</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{totalBeds}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[var(--primary)]">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Occupied Beds</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{filledBeds}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[var(--success)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Vacant Beds</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{vacantBeds}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center text-[var(--danger)]">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[var(--bg-card)] p-4 border border-[var(--border)] rounded-[var(--radius-md,8px)] relative">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search room number or floor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] transition-colors"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-[var(--radius-md,8px)] text-sm font-medium transition-colors ${
            showFilters || filterSharing !== 'all' || filterStatus !== 'all'
              ? 'border-[var(--primary)] bg-[rgba(99,102,241,0.05)] text-[var(--primary)]' 
              : 'border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters {(filterSharing !== 'all' || filterStatus !== 'all') && <span className="w-2 h-2 rounded-full bg-[var(--primary)] ml-1"></span>}
        </button>

        {/* Filter Popover */}
        {showFilters && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-xl z-10 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">Filter Rooms</h3>
              <button 
                onClick={() => {
                  setFilterSharing('all');
                  setFilterStatus('all');
                }}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--primary)]"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Sharing Type</label>
              <select 
                value={filterSharing}
                onChange={(e) => setFilterSharing(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="all">All Sharing</option>
                <option value="1">Single</option>
                <option value="2">Double</option>
                <option value="3">Triple</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Vacancy Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="all">All Status</option>
                <option value="available">Available (Has Vacancy)</option>
                <option value="occupied">Fully Occupied</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Rooms Table */}
      {loading ? (
        <div className="animate-pulse h-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)]"></div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] text-center">
          <BedDouble className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No Rooms Found</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm">
            No rooms exist for this property. Wait for the owner to add some.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[rgba(99,102,241,0.03)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Room Identity</th>
                  <th className="px-6 py-4 font-semibold">Configuration</th>
                  <th className="px-6 py-4 font-semibold">Rent (Per Bed)</th>
                  <th className="px-6 py-4 font-semibold">Vacancy Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {paginatedRooms.map((room) => {
                  const safeSharing = room.sharing || 1;
                  const occupiedBeds = safeSharing - room.vacantCount;
                  const percent = Math.round((occupiedBeds / safeSharing) * 100);
                  
                  return (
                    <tr key={room.id} className="hover:bg-[rgba(99,102,241,0.02)] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[var(--radius-md,8px)] bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-sm">
                            <span className="font-bold text-[var(--primary)] text-lg">{room.number || '-'}</span>
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-primary)] text-base">
                              Room {room.number || 'Unnamed'}
                            </div>
                            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 flex flex-col gap-0.5">
                              <span>📍 Floor {room.floor}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[rgba(99,102,241,0.1)] text-[var(--primary)] flex items-center justify-center shrink-0">
                            {room.sharing === 1 ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </div>
                          <span className="text-[var(--text-primary)] font-medium text-sm">
                            {room.sharing === 1 ? 'Single Bed' : room.sharing === 2 ? 'Double Sharing' : room.sharing === 3 ? 'Triple Sharing' : `${room.sharing} Sharing`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[var(--text-primary)] font-bold text-sm">
                          ₹{(room.rentPerBed || 0).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">/ month</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 w-36">
                          <div className="flex items-center justify-between">
                            {room.status === 'maintenance' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--danger-bg)] text-[var(--danger)] border border-[rgba(239,68,68,0.2)] uppercase tracking-wider">Maint.</span>
                            ) : room.vacantCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--success-bg)] text-[var(--success)] border border-[rgba(16,185,129,0.2)] uppercase tracking-wider">Available</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--danger-bg)] text-[var(--danger)] border border-[rgba(239,68,68,0.2)] uppercase tracking-wider">Occupied</span>
                            )}
                            <span className="text-[10px] text-[var(--text-secondary)] font-medium">{occupiedBeds}/{safeSharing} beds</span>
                          </div>
                          <div className="w-full bg-[var(--bg-input)] rounded-full h-1.5 overflow-hidden border border-[var(--border)]">
                            <div className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'}`} style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/manager/rooms/${room.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-[var(--primary-subtle)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[var(--border)] bg-[rgba(99,102,241,0.01)] flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRooms.length)} of {filteredRooms.length}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 text-sm font-medium border border-[var(--border)] rounded-md hover:bg-[var(--bg-input)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] transition-colors"
                >
                  Previous
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 text-sm font-medium border border-[var(--border)] rounded-md hover:bg-[var(--bg-input)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
