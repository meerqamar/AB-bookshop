'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) {
      addToast(error.message, 'error');
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name, role: 'user' });
    }
    setLoading(false);
    addToast('Account created! Welcome to AB Book Shop 🎉', 'success');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white"
        style={{
          width: '45%',
          background: 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          flexShrink: 0,
        }}
      >
        <Link href="/" className="text-2xl font-bold tracking-tight">AB Book Shop</Link>
        <div>
          <p className="text-5xl font-bold leading-tight mb-4">
            Start your<br />reading journey<br />today.
          </p>
          <p className="text-white/70 text-lg">
            Join thousands of readers. Get access to the best books with Cash on Delivery across Pakistan.
          </p>
        </div>
        <div className="flex gap-8 text-white/60 text-sm">
          <span>📦 Fast Delivery</span>
          <span>💳 Cash on Delivery</span>
          <span>📚 1000+ Books</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block text-xl font-bold text-primary mb-8">AB Book Shop</Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">Join AB Book Shop — it's free</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Ahmad Bilal"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 6 ? 'bg-green-500' : 'bg-red-300'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 10 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <span className="text-xs text-gray-400 ml-1">{password.length < 6 ? 'Weak' : password.length < 8 ? 'Fair' : 'Strong'}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> &amp;{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
