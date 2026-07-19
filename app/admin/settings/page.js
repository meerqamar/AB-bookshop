'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [whatsapp, setWhatsapp] = useState('923289812517');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('settings').select('*').eq('key', 'whatsapp_number').single();
      if (data) setWhatsapp(data.value);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'whatsapp_number', value: whatsapp }, { onConflict: 'key' });
    setSaving(false);
    if (error) addToast('Save failed: ' + error.message, 'error');
    else addToast('Settings saved!');
  }

  if (loading) return <div className="flex justify-center items-center py-24 min-h-[50vh]"><div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <>
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary/80 mb-2">Store</p>
        <h1 className="font-headline-md text-3xl text-on-surface">Settings</h1>
      </div>
      <div className="bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm max-w-lg">
        <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">WhatsApp Contact</h3>
        <p className="text-sm text-on-surface-variant mb-6">
          This number appears on the floating WhatsApp button across the store.
        </p>
        <form onSubmit={handleSave}>
          <div className="flex flex-col gap-2 mb-6">
            <label className="font-medium text-on-surface text-sm">WhatsApp Number</label>
            <input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="923XXXXXXXXX" required />
            <span className="text-xs text-on-surface-variant mt-1">Include country code without + (e.g. 923001234567)</span>
          </div>
          <button className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl px-8 py-3.5 bg-primary text-white hover:bg-primary/90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </>
  );
}
