'use client';

import { useState, useEffect } from 'react';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { api } from '@/lib/api';
import { Room } from '@/app/owner/lib/api/rooms';
import { getSession } from '@/lib/auth/session';
import { Plus, Search, Filter, BedDouble, AlertCircle, X, CheckCircle2, ChevronRight, Hash, User, Users } from 'lucide-react';
import Link from 'next/link';
import { Bed } from '@/app/owner/lib/api/beds';

export default function OwnerRoomsPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, selectedPropertyId, setSelectedPropertyId } = useOwnerPropertyContext();
  
  const [rooms, setRooms] = useState<(Room & { bedsCount: number; vacantCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filters & Pagination
  const [showFilters, setShowFilters] = useState(false);
  const [filterSharing, setFilterSharing] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [formData, setFormData] = useState({
    propertyId: '',
    floor: 1,
    number: '',
    sharing: 2,
    rentPerBed: 5000,
    deposit: 5000,
    amenities: 'AC, Attached Washroom, Balcony'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    let allRooms: Room[] = [];
    
    if (selectedPropertyId === 'all') {
      properties.forEach(p => {
        allRooms = [...allRooms, ...api.rooms.listByProperty(p.id)];
      });
    } else {
      allRooms = api.rooms.listByProperty(selectedPropertyId);
    }

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
    loadData();
    // Default form propertyId to selected property if one is selected
    if (selectedPropertyId !== 'all') {
      setFormData(prev => ({ ...prev, propertyId: selectedPropertyId }));
    } else if (properties.length > 0) {
      setFormData(prev => ({ ...prev, propertyId: properties[0].id }));
    }
  }, [selectedPropertyId, properties, user?.id]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSubmitting(true);

    try {
      if (!formData.propertyId) throw new Error('Please select a property.');
      
      api.rooms.create({
        propertyId: formData.propertyId,
        floor: formData.floor,
        number: formData.number,
        sharing: formData.sharing,
        rentPerBed: formData.rentPerBed,
        deposit: formData.deposit,
        amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
        status: 'available',
        photos: [],
        actorId: user.id
      });
      
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Rooms Management</h1>
          <p className="text-sm text-[var(--text-secondary)]">View and manage rooms across your properties.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius-md,8px)] font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 text-sm shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
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
            showFilters || filterSharing !== 'all' || filterStatus !== 'all' || selectedPropertyId !== 'all'
              ? 'border-[var(--primary)] bg-[rgba(99,102,241,0.05)] text-[var(--primary)]' 
              : 'border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters {(filterSharing !== 'all' || filterStatus !== 'all' || selectedPropertyId !== 'all') && <span className="w-2 h-2 rounded-full bg-[var(--primary)] ml-1"></span>}
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
                  if (setSelectedPropertyId) setSelectedPropertyId('all');
                }}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--primary)]"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Property</label>
              <select 
                value={selectedPropertyId}
                onChange={(e) => {
                   if (setSelectedPropertyId) setSelectedPropertyId(e.target.value);
                }}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="all">All Properties</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-6">
            {selectedPropertyId === 'all' 
              ? "You haven't added any rooms across your properties yet." 
              : "No rooms exist for this property. Add one to get started."}
          </p>
          <button onClick={() => setShowAddModal(true)} className="text-[var(--primary)] text-sm font-medium hover:underline">
            + Create First Room
          </button>
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
                  const propName = properties.find(p => p.id === room.propertyId)?.name || 'Unknown';
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
                              {selectedPropertyId === 'all' && <span>🏢 {propName}</span>}
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
                          href={`/owner/rooms/${room.id}`}
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

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] shrink-0">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Add New Room</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors p-1 rounded-full hover:bg-[var(--bg-page)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {error && (
                <div className="mb-4 p-3 bg-[var(--danger-bg)] text-[var(--danger)] text-sm rounded-[var(--radius-md,8px)] border border-[var(--danger)] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <form id="addRoomForm" onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Property *</label>
                  <select 
                    required 
                    value={formData.propertyId} 
                    onChange={e => setFormData(p => ({...p, propertyId: e.target.value}))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                  >
                    <option value="" disabled>Select Property</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">Floor *</label>
                    <input 
                      required type="number" min="0"
                      value={formData.floor} 
                      onChange={e => setFormData(p => ({...p, floor: parseInt(e.target.value)||0}))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">Room Number *</label>
                    <input 
                      required type="text" placeholder="e.g. 101"
                      value={formData.number} 
                      onChange={e => setFormData(p => ({...p, number: e.target.value}))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">Sharing *</label>
                    <select 
                      required
                      value={formData.sharing} 
                      onChange={e => setFormData(p => ({...p, sharing: parseInt(e.target.value)||1}))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                    >
                      <option value="1">1 (Single)</option>
                      <option value="2">2 Sharing</option>
                      <option value="3">3 Sharing</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">Rent / Bed *</label>
                    <input 
                      required type="number" min="0"
                      value={formData.rentPerBed} 
                      onChange={e => setFormData(p => ({...p, rentPerBed: parseInt(e.target.value)||0}))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">Deposit *</label>
                    <input 
                      required type="number" min="0"
                      value={formData.deposit} 
                      onChange={e => setFormData(p => ({...p, deposit: parseInt(e.target.value)||0}))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Amenities (comma separated)</label>
                  <input 
                    type="text" placeholder="AC, Balcony, Attached Washroom"
                    value={formData.amenities} 
                    onChange={e => setFormData(p => ({...p, amenities: e.target.value}))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--border)] mt-6 bg-[rgba(16,185,129,0.05)] p-3 rounded-lg flex gap-3 text-[var(--success)]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <strong>Auto-generation active:</strong> Saving this will automatically create {formData.sharing} beds ({Array.from({length: formData.sharing}).map((_,i) => String.fromCharCode(65+i)).join(', ')}) attached to this room.
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-page)] shrink-0 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="addRoomForm"
                disabled={submitting}
                className="bg-[var(--primary)] text-white px-6 py-2 rounded-[var(--radius-md,8px)] text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Room & Beds'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
