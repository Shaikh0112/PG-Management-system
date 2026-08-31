'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Room } from '@/lib/api/rooms';
import { Bed } from '@/lib/api/beds';
import { getSession } from '@/lib/auth/session';
import { ArrowLeft, BedDouble, AlertTriangle, User, Hash, Settings, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';

export default function RoomProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties } = useOwnerPropertyContext();

  const [room, setRoom] = useState<Room | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = () => {
    if (!user || !id) return;
    setLoading(true);
    
    const fetchedRoom = api.rooms.getById(id);
    if (!fetchedRoom) {
      router.replace('/owner/rooms');
      return;
    }
    
    // Safety check: is owner of this property?
    const prop = api.properties.getById(fetchedRoom.propertyId);
    if (prop?.ownerId !== user.id) {
      router.replace('/owner/rooms');
      return;
    }

    setRoom(fetchedRoom);
    setBeds(api.beds.listByRoom(id));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id, user?.id, router]);

  const handleBedStatusChange = (bedId: string, newStatus: any) => {
    if (!user) return;
    try {
      api.beds.updateStatus(bedId, newStatus, user.id);
      loadData(); // refresh
    } catch (err: any) {
      alert('Failed to update bed status');
    }
  };

  const handleRoomMaintenance = (isMaintenance: boolean) => {
    if (!user || !room) return;
    api.rooms.updateStatus(room.id, isMaintenance ? 'maintenance' : 'available', user.id);
    loadData();
  };

  const handleDeleteRoom = () => {
    if (!user || !room) return;
    try {
      if (confirm(`Are you sure you want to delete Room ${room.number}?`)) {
        api.rooms.delete(room.id, user.id);
        router.push('/owner/rooms');
      }
    } catch (err: any) {
      setError(err.message || 'Cannot delete room.');
    }
  };

  if (loading || !room) return <div className="p-6 animate-pulse">Loading room details...</div>;

  const propertyName = properties.find(p => p.id === room.propertyId)?.name || 'Unknown Property';
  const vacantBeds = beds.filter(b => b.status === 'available' || b.status === 'vacant').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/owner/rooms" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] flex items-center gap-3">
            Room {room.number}
            {room.status === 'maintenance' && (
              <span className="text-[10px] uppercase bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1 rounded-md tracking-wider">
                Maintenance
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{propertyName} • Floor {room.floor}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--danger-bg)] border border-[var(--danger)] text-[var(--danger)] rounded-[var(--radius-md,8px)] flex items-center gap-3 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Overview & Actions */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center gap-2">
              <Hash className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Room Overview</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Sharing Type</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{room.sharing} Sharing</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Rent per Bed</div>
                  <div className="text-sm font-semibold text-[var(--success)]">₹{(room.rentPerBed || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Deposit</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">₹{(room.deposit || 0).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Amenities</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(room.amenities || []).map(am => (
                    <span key={am} className="text-[10px] bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                      {am}
                    </span>
                  ))}
                  {(room.amenities || []).length === 0 && <span className="text-xs text-[var(--text-secondary)] italic">None</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Room Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <button 
                onClick={() => handleRoomMaintenance(room.status !== 'maintenance')}
                className={`w-full py-2.5 rounded-[var(--radius-md,8px)] text-sm font-medium transition-colors border ${
                  room.status === 'maintenance' 
                    ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' 
                    : 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]'
                }`}
              >
                {room.status === 'maintenance' ? 'Remove Maintenance Block' : 'Mark Room under Maintenance'}
              </button>
              
              <button onClick={handleDeleteRoom} className="w-full py-2.5 bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)] rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-red-900 transition-colors flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Room
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Beds List */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[rgba(99,102,241,0.02)]">
              <div className="flex items-center gap-3">
                <BedDouble className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Beds & Students</h2>
              </div>
              <div className="text-xs font-medium px-3 py-1 bg-[var(--bg-input)] rounded-full text-[var(--text-secondary)] border border-[var(--border)]">
                <span className="text-[var(--primary)]">{vacantBeds}</span> Vacant / {room.sharing} Total
              </div>
            </div>

            <div className="p-5 flex-1 space-y-4">
              {beds.map(bed => (
                <div key={bed.id} className="border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--primary-subtle)] transition-colors bg-[var(--bg-page)]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border
                      ${(bed.status === 'available' || bed.status === 'vacant') ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)] border-[rgba(16,185,129,0.2)]' : 
                        bed.status === 'occupied' ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary)]' : 
                        'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]'}`}
                    >
                      {bed.code}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] mb-1">
                        Bed {room.number}-{bed.code}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        {bed.status === 'occupied' ? (
                          <>
                            <User className="w-3.5 h-3.5" />
                            <span>Occupied by Student</span> {/* TODO: link to student profile when module is built */}
                          </>
                        ) : bed.status === 'maintenance' ? (
                          <span className="text-[var(--danger)]">Under Maintenance</span>
                        ) : bed.status === 'reserved' ? (
                          <span className="text-[var(--warning)]">Reserved</span>
                        ) : (
                          <span className="text-[var(--success)]">Available for Booking</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <select 
                      value={bed.status}
                      onChange={(e) => handleBedStatusChange(bed.id, e.target.value)}
                      className="bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] text-xs rounded-md px-3 py-1.5 outline-none focus:border-[var(--primary)]"
                    >
                      <option value="vacant">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              ))}

              {beds.length === 0 && (
                <div className="text-center py-10 text-[var(--text-secondary)] text-sm">
                  No beds found. Something went wrong during room creation.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
