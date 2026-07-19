'use client';
import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { safeRedirectPath } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('next');
  const afterSignupPath = safeRedirectPath(redirectParam, '/dashboard');
  const loginHref = redirectParam
    ? `/login?redirect=${encodeURIComponent(safeRedirectPath(redirectParam, '/checkout'))}`
    : '/login';

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
    router.push(afterSignupPath);
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white w-[45%] shrink-0 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]">
        <Link href="/" className="font-display-lg text-2xl font-bold tracking-tight">AB Book Shop</Link>
        <div>
          <p className="font-display-lg text-5xl font-bold leading-tight mb-4">
            Start your<br />reading journey<br />today.
          </p>
          <p className="text-white/70 text-lg leading-relaxed">
            Join thousands of readers. Quality books with Cash on Delivery across Pakistan.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-white/70 text-sm">
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">local_shipping</span> Fast delivery</span>
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">payments</span> Cash on Delivery</span>
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">menu_book</span> 1000+ books</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#f3f7f5]">
        <div className="w-full max-w-[420px] bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-sm">
          <Link href="/" className="lg:hidden block font-display-lg text-xl font-bold text-primary mb-6">AB Book Shop</Link>

          <h1 className="font-headline-md text-3xl text-on-surface mb-1">Create account</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            {redirectParam === '/checkout'
              ? 'Create an account to place your order — your cart is saved.'
              : 'Join AB Book Shop — it\'s free'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 6 ? 'bg-primary' : 'bg-error/40'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 8 ? 'bg-primary' : 'bg-outline-variant'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 10 ? 'bg-primary' : 'bg-outline-variant'}`} />
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
            <Link href={loginHref} className="text-primary font-semibold hover:underline">Log in</Link>
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
