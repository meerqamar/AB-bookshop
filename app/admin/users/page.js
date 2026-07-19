'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center items-center py-24 min-h-[50vh]"><div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <>
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary/80 mb-2">People</p>
        <h1 className="font-headline-md text-3xl text-on-surface">Users</h1>
      </div>
      <div className="bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead><tr><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Name</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Role</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#f3f7f5]/50 transition-colors border-b border-outline-variant last:border-0">
                  <td className="px-6 py-4"><strong className="text-on-surface">{u.name}</strong></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${u.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">{formatDate(u.created_at)}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="3" className="px-6 py-8 text-on-surface-variant text-sm text-center italic">No users</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
