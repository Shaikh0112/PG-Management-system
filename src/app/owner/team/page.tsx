'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { Plus, Search, Filter, ShieldCheck, Wrench, Utensils, Shield, Sparkles, Building2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { TeamMember, StaffRoleType } from '@/app/owner/lib/api/team';

const ROLE_ICONS: Record<StaffRoleType, any> = {
  manager: ShieldCheck,
  cook: Utensils
};

const ROLE_COLORS: Record<StaffRoleType, string> = {
  manager: 'text-[var(--primary)] bg-[var(--primary-subtle)] border-[var(--primary)]',
  cook: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
};

export default function OwnerTeamPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, selectedPropertyId, setSelectedPropertyId } = useOwnerPropertyContext();

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRoleType | 'all'>('all');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const members = api.team.listByOwner(user.id);
    setTeam(members);
    setLoading(false);
  }, [user?.id]);

  const filteredTeam = team.filter(member => {
    // Search match
    const matchSearch = member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        member.user.phone?.includes(searchQuery);
    
    // Role match
    const matchRole = roleFilter === 'all' || member.profile.staffType === roleFilter;
    
    // Property match (if 'all', ignore. Else check if assignedPropertyIds includes selectedPropertyId)
    const matchProperty = selectedPropertyId === 'all' || member.user.assignedPropertyIds?.includes(selectedPropertyId);

    return matchSearch && matchRole && matchProperty;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Team Directory</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your PG managers and cooks.</p>
        </div>
        <Link 
          href="/owner/team/create"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius-md,8px)] font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 text-sm shadow-md justify-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-[var(--bg-card)] p-4 border border-[var(--border)] rounded-[var(--radius-md,8px)]">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] transition-colors"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Roles</option>
            <option value="manager">Managers</option>
            <option value="cook">Cooks</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] animate-pulse"></div>)}
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] text-center">
          <UserPlus className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No Team Members Found</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-6">
            You don't have any staff matching these filters. Add a manager or staff member to get started.
          </p>
          <Link href="/owner/team/create" className="text-[var(--primary)] text-sm font-medium hover:underline">
            + Create Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map(member => {
            const Icon = ROLE_ICONS[member.profile.staffType];
            const colorClass = ROLE_COLORS[member.profile.staffType];
            const propsAssigned = member.user.assignedPropertyIds?.length || 0;
            const initials = member.user.name.substring(0, 2).toUpperCase();

            return (
              <div key={member.user.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 hover:border-[var(--primary-subtle)] transition-colors shadow-sm flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold tracking-wider border text-sm ${colorClass}`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-base truncate pr-2" title={member.user.name}>
                        {member.user.name}
                      </h3>
                      <div className="text-xs text-[var(--text-secondary)]">{member.user.phone}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{member.profile.staffType}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Properties</span>
                    <span className="font-medium text-[var(--text-primary)]">{propsAssigned} Assigned</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Shift</span>
                    <span className="font-medium text-[var(--text-primary)]">{member.profile.shift}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Joined</span>
                    <span className="font-medium text-[var(--text-primary)]">{new Date(member.profile.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] mt-auto">
                  <Link 
                    href={`/owner/team/${member.user.id}`} 
                    className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform w-fit"
                  >
                    View Profile &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
