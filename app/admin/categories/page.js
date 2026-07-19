'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const supabase = createClient();
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setCategories(data || []);
    setLoading(false);
  }

  function resetForm() { setEditId(null); setName(''); setLogo(''); setLogoFile(null); }

  function edit(c) {
    setEditId(c.id); setName(c.name); setLogo(c.logo || ''); setLogoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    let logoUrl = logo;
    if (logoFile) {
      const ext = logoFile.name.split('.').pop();
      const filename = `cat_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(filename, logoFile, { upsert: true });
      if (upErr) { 
        console.error("Storage upload error:", upErr);
        addToast('Upload failed: ' + upErr.message, 'error'); 
        setSaving(false); 
        return; 
      }
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(filename);
      logoUrl = pub.publicUrl;
    }

    const row = { name, logo: logoUrl || null };
    let error;
    if (editId) {
      ({ error } = await supabase.from('categories').update(row).eq('id', editId));
    } else {
      ({ error } = await supabase.from('categories').insert(row));
    }
    setSaving(false);
    if (error) addToast('Failed: ' + error.message, 'error');
    else { addToast(editId ? 'Updated!' : 'Added!'); resetForm(); loadData(); }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) addToast('Delete failed: ' + error.message, 'error');
    else { addToast('Deleted'); loadData(); }
  }

  if (loading) return <div className="flex justify-center items-center py-24 min-h-[50vh]"><div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <>
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary/80 mb-2">Catalog</p>
        <h1 className="font-headline-md text-3xl text-on-surface">Categories</h1>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        <div className="bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-headline-md text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/50 pb-4">{editId ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-on-surface text-sm">Name</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-on-surface text-sm">Logo URL</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." /></div>
            <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-on-surface text-sm">Or Upload Logo</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} /></div>
            <button className="w-full inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl px-8 py-4 bg-primary text-white hover:bg-primary/90 shadow-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update' : 'Add Category'}
            </button>
            {editId && <button type="button" className="w-full inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl px-4 py-3.5 bg-transparent border border-outline-variant text-on-surface-variant hover:bg-[#f3f7f5] mt-3" onClick={resetForm}>Cancel</button>}
          </form>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-headline-md text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/50 pb-4">All Categories ({categories.length})</h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead><tr><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Logo</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Name</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider"></th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-[#f3f7f5]/50 transition-colors border-b border-outline-variant last:border-0">
                    <td className="px-6 py-4">{c.logo && <img src={c.logo} className="w-10 h-10 object-contain rounded-md bg-primary-light/10" alt="" />}</td>
                    <td className="px-6 py-4"><strong className="text-on-surface">{c.name}</strong></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg px-3 py-1.5 text-xs bg-transparent border-2 border-primary text-primary hover:bg-primary/5" onClick={() => edit(c)}>Edit</button>
                        <button className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg px-3 py-1.5 text-xs bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-50" onClick={() => deleteCategory(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && <tr><td colSpan="3" className="px-6 py-8 text-on-surface-variant text-sm text-center italic">No categories</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
