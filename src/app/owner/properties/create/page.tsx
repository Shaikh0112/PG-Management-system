'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { api } from '@/lib/api';
import { 
  Building2, MapPin, Settings2, Image as ImageIcon, Phone, CheckCircle2, AlertCircle, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/ui/ToastContext';
import { useOwnerPropertyContext } from '@/components/owner/OwnerPropertyContext';

export default function CreatePropertyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshProperties } = useOwnerPropertyContext();
  const user = typeof window !== 'undefined' ? getSession() : null;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.ownerId) {
      try {
        const details = api.owners.getOwner360(user.ownerId);
        if (!details || !details.subscription || details.subscription.status !== 'active' || details.subscription.planId === 'none') {
          router.push('/owner/subscription');
          showToast('Please purchase a subscription plan to create a PG.', 'error');
        }
      } catch (err) {
        // Owner not found or error
      }
    }
  }, [user, router, showToast]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'coed',
    description: '',
    address: '',
    city: '',
    pincode: '',
    landmark: '',
    contactName: '',
    contactPhone: '',
    floorsCount: 1,
    nightEntryTime: '23:00',
    noticePeriodDays: 30,
    messEnabled: false,
    visitorCutoff: '20:00',
    defaultDeposit: 0,
    rentCycleDate: 1,
    photos: '', // comma separated string for UI
    generateRooms: false,
    singleRoomsCount: 0,
    doubleRoomsCount: 0,
    tripleRoomsCount: 0
  });

  const [amenities, setAmenities] = useState<string[]>(['Wifi', 'Power Backup', 'CCTV']);

  const availableAmenities = ['Wifi', 'Power Backup', 'CCTV', 'AC', 'Washing Machine', 'RO Water', 'Parking', 'Gym', 'TV', 'Lounge'];

  const handleToggleAmenity = (am: string) => {
    if (amenities.includes(am)) {
      setAmenities(amenities.filter(a => a !== am));
    } else {
      setAmenities([...amenities, am]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from name
      if (name === 'name' && !formData.slug) {
        setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const photosArray = formData.photos.split(',').map(s => s.trim()).filter(Boolean);
      
      const newProp = api.properties.create({
        ownerId: user.id,
        name: formData.name,
        slug: formData.slug,
        type: formData.type as 'boys'|'girls'|'coed',
        description: formData.description,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        landmark: formData.landmark,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        floorsCount: formData.floorsCount,
        nightEntryTime: formData.nightEntryTime,
        noticePeriodDays: formData.noticePeriodDays,
        messEnabled: formData.messEnabled,
        visitorCutoff: formData.visitorCutoff,
        defaultDeposit: formData.defaultDeposit,
        rentCycleDate: formData.rentCycleDate,
        amenities: amenities,
        photos: photosArray,
        generateRooms: formData.generateRooms || formData.singleRoomsCount > 0 || formData.doubleRoomsCount > 0 || formData.tripleRoomsCount > 0,
        singleRoomsCount: formData.singleRoomsCount,
        doubleRoomsCount: formData.doubleRoomsCount,
        tripleRoomsCount: formData.tripleRoomsCount
      });

      // Show success toast
      showToast('success', 'Property branch created successfully!');

      // Wait a tiny bit to allow toast rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh context so dashboard sees the new property
      refreshProperties();
      
      // Redirect to detail page
      router.push(`/owner/properties/${newProp.id}`);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create property. Check your subscription limit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/owner/properties" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Add New Property</h1>
          <p className="text-sm text-[var(--text-secondary)]">Set up a new PG branch and its configuration.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[var(--danger-bg)] border border-[var(--danger)] text-[var(--danger)] rounded-[var(--radius-md,8px)] flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Property Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="e.g. Sharma PG Coed"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">URL Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="sharma-pg-coed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">PG Type *</label>
              <select required name="type" value={formData.type} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              >
                <option value="coed">Co-Ed / Both</option>
                <option value="boys">Boys Only</option>
                <option value="girls">Girls Only</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all resize-none"
                placeholder="Short description of the property..."
              />
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Location & Contact</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Complete Address *</label>
              <input required type="text" name="address" value={formData.address} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="Plot no, Street, Area"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">City *</label>
              <input required type="text" name="city" value={formData.city} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="e.g. Patna, Delhi"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Pincode *</label>
              <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="800001"
              />
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Landmark (Optional)</label>
              <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="e.g. Near Metro Station"
              />
            </div>
          </div>
        </div>

        {/* Configuration & Rules */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Configuration & Rules</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Total Floors *</label>
              <input required type="number" min="0" name="floorsCount" value={formData.floorsCount} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Night Entry Time</label>
              <input type="time" name="nightEntryTime" value={formData.nightEntryTime} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Visitor Cutoff Time</label>
              <input type="time" name="visitorCutoff" value={formData.visitorCutoff} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Notice Period (Days)</label>
              <input type="number" min="0" name="noticePeriodDays" value={formData.noticePeriodDays} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Default Deposit (₹)</label>
              <input type="number" min="0" name="defaultDeposit" value={formData.defaultDeposit} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Rent Cycle Date (1-28)</label>
              <input type="number" min="1" max="28" name="rentCycleDate" value={formData.rentCycleDate} onChange={handleInputChange}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div className="md:col-span-3 pt-2">
              <label className="flex items-center gap-3 p-3 bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.2)] rounded-[var(--radius-md,8px)] cursor-pointer hover:bg-[rgba(99,102,241,0.1)] transition-colors">
                <input type="checkbox" name="messEnabled" checked={formData.messEnabled} onChange={handleInputChange} className="w-5 h-5 rounded accent-[var(--primary)]" />
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Enable Mess / Cafeteria Module</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Turns on menus, meal QR scanning, and mess wallets for this property.</div>
                </div>
              </label>
            </div>

            <div className="md:col-span-3 pt-4 border-t border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Auto-Provision Rooms (Optional)</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">Specify how many rooms you want to generate automatically. They will be created sequentially starting from Room 101 on Floor 1.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Single Bed Rooms</label>
                  <input type="number" min="0" name="singleRoomsCount" value={formData.singleRoomsCount || ''} onChange={handleInputChange}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                    placeholder="e.g. 2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Double Sharing Rooms</label>
                  <input type="number" min="0" name="doubleRoomsCount" value={formData.doubleRoomsCount || ''} onChange={handleInputChange}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Triple Sharing Rooms</label>
                  <input type="number" min="0" name="tripleRoomsCount" value={formData.tripleRoomsCount || ''} onChange={handleInputChange}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Amenities */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Amenities Provided</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {availableAmenities.map(am => (
                <button
                  key={am}
                  type="button"
                  onClick={() => handleToggleAmenity(am)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    amenities.includes(am) 
                      ? 'bg-[var(--primary-subtle)] border-[var(--primary)] text-[var(--primary)]' 
                      : 'bg-[var(--bg-input)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                  }`}
                >
                  {am}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Property Photos</h2>
          </div>
          <div className="p-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Photo URLs (comma separated)</label>
              <textarea name="photos" value={formData.photos} onChange={handleInputChange} rows={3}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all resize-none"
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              />
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">Leave empty to use a beautiful default placeholder image.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-10">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[var(--primary)] text-white px-8 py-3 rounded-[var(--radius-md,8px)] font-bold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:-translate-y-0.5"
          >
            {loading ? 'Creating...' : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Create Property
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
