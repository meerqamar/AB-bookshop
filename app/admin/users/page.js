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

  if (loading) return <div className="flex justify-center items-center py-24 min-h-[50vh]"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <>
      <h2 className="font-display text-3xl font-extrabold text-text-primary mb-8">Users</h2>
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead><tr><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Name</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Role</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="hover:bg-background/50 transition-colors border-b border-border last:border-0">
                  <td className="px-6 py-4"><strong className="text-text-primary">{u.name}</strong></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{formatDate(u.created_at)}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="3" className="px-6 py-8 text-text-secondary text-sm text-center italic">No users</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
