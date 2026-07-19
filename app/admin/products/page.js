'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { money } from '@/lib/utils';

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [inStock, setInStock] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const supabase = createClient();
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(name)').order('id', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  }

  function resetForm() {
    setEditId(null); setTitle(''); setDescription(''); setPrice('');
    setOriginalPrice(''); setImage(''); setImageFile(null);
    setCategoryId(''); setIsFeatured(false); setInStock(true);
  }

  function editProduct(p) {
    setEditId(p.id);
    setTitle(p.title);
    setDescription(p.description || '');
    setPrice(p.price);
    setOriginalPrice(p.original_price || '');
    setImage(p.image || '');
    setImageFile(null);
    setCategoryId(p.category_id || '');
    setIsFeatured(p.is_featured || false);
    setInStock(p.in_stock !== false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    let imageUrl = image;

    // Upload image if file selected
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(filename, imageFile, { upsert: true });
      if (uploadErr) {
        addToast('Image upload failed: ' + uploadErr.message, 'error');
        setSaving(false);
        return;
      }
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(filename);
      imageUrl = publicUrl.publicUrl;
    }

    const discount = originalPrice && Number(originalPrice) > Number(price)
      ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
      : null;

    const row = {
      title,
      description: description || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      discount_percent: discount,
      image: imageUrl || null,
      category_id: categoryId ? Number(categoryId) : null,
      is_featured: isFeatured,
      in_stock: inStock,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from('products').update(row).eq('id', editId));
    } else {
      ({ error } = await supabase.from('products').insert(row));
    }

    setSaving(false);
    if (error) {
      addToast('Save failed: ' + error.message, 'error');
    } else {
      addToast(editId ? 'Product updated!' : 'Product added!', 'success');
      resetForm();
      loadData();
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) addToast('Delete failed: ' + error.message, 'error');
    else { addToast('Product deleted'); loadData(); }
  }

  if (loading) return <div className="flex justify-center items-center py-24 min-h-[50vh]"><div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <>
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary/80 mb-2">Catalog</p>
        <h1 className="font-headline-md text-3xl text-on-surface">Products</h1>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        {/* Form */}
        <div className="bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-headline-md text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/50 pb-4">{editId ? 'Edit Product' : 'Add Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-on-surface text-sm">Title</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-on-surface text-sm">Description</label><textarea className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={description} onChange={e => setDescription(e.target.value)} rows="3" /></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-on-surface text-sm">Sale Price (Rs)</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" type="number" step="1" min="0" value={price} onChange={e => setPrice(e.target.value)} required /></div>
              <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-on-surface text-sm">Original Price (Rs)</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" type="number" step="1" min="0" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="Optional" /></div>
            </div>
            {originalPrice && Number(originalPrice) > Number(price) && (
              <p className="text-red-500 text-sm font-bold mb-4">
                Discount: {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% OFF
              </p>
            )}

            <div className="flex flex-col gap-2 mb-5">
              <label className="font-medium text-on-surface text-sm">Image URL</label>
              <input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex flex-col gap-2 mb-5">
              <label className="font-medium text-on-surface text-sm">Or Upload Image</label>
              <input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              <span className="text-xs text-on-surface-variant mt-1">Max 5MB. Formats: JPG, PNG, GIF, WebP</span>
            </div>

            <div className="flex flex-col gap-2 mb-5">
              <label className="font-medium text-on-surface text-sm">Category</label>
              <select className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                <option value="">— Select —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-outline-variant/50">
              <label className="font-medium text-on-surface text-sm cursor-pointer" htmlFor="featured">Featured</label>
              <input id="featured" type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 cursor-pointer" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
            </div>
            <div className="flex items-center justify-between py-3">
              <label className="font-medium text-on-surface text-sm cursor-pointer" htmlFor="instock">In Stock</label>
              <input id="instock" type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 cursor-pointer" checked={inStock} onChange={e => setInStock(e.target.checked)} />
            </div>

            <button className="w-full inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl px-8 py-4 bg-primary text-white hover:bg-primary/90 shadow-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
            </button>
            {editId && (
              <button type="button" className="w-full inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl px-4 py-3.5 bg-transparent border border-outline-variant text-on-surface-variant hover:bg-[#f3f7f5] mt-3" onClick={resetForm}>Cancel Edit</button>
            )}
          </form>
        </div>

        {/* Product list */}
        <div className="bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="font-headline-md text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/50 pb-4">All Products ({products.length})</h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead><tr><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider"></th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Title</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Category</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Price</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Featured</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider"></th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#f3f7f5]/50 transition-colors border-b border-outline-variant last:border-0">
                    <td className="px-6 py-4">{p.image && <img src={p.image} className="w-12 h-16 object-cover rounded-md bg-primary-light/10" alt="" />}</td>
                    <td className="px-6 py-4"><strong className="text-on-surface">{p.title}</strong></td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{p.category?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface">{money(p.price)}</div>
                      {p.original_price && p.original_price > p.price && (
                        <div className="line-through text-on-surface-variant text-xs">{money(p.original_price)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.is_featured ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary">Featured</span>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg px-3 py-1.5 text-xs bg-transparent border-2 border-primary text-primary hover:bg-primary/5" onClick={() => editProduct(p)}>Edit</button>
                        <button className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg px-3 py-1.5 text-xs bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-50" onClick={() => deleteProduct(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan="6" className="px-6 py-8 text-on-surface-variant text-sm text-center italic">No products yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
