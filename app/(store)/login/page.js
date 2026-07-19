'use client';
import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { safeRedirectPath } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('next');
  const afterLoginPath = safeRedirectPath(redirectParam, '/dashboard');
  const signupHref = redirectParam
    ? `/signup?redirect=${encodeURIComponent(safeRedirectPath(redirectParam, '/checkout'))}`
    : '/signup';

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setNeedsConfirm(false);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed') || error.message.toLowerCase().includes('not confirmed')) {
        setNeedsConfirm(true);
        setErrorMsg('Your email is not confirmed yet. Please check your inbox and click the confirmation link.');
      } else if (error.message.toLowerCase().includes('invalid login') || error.message.toLowerCase().includes('invalid credentials')) {
        setErrorMsg('Incorrect email or password. Please try again.');
      } else {
        setErrorMsg(error.message);
      }
    } else {
      addToast('Welcome back! 👋', 'success');
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = user
        ? await supabase.from('profiles').select('role').eq('id', user.id).single()
        : { data: null };
      router.push(profile?.role === 'admin' ? '/admin' : afterLoginPath);
      router.refresh();
    }
  }

  async function handleResend() {
    setResendLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setResendLoading(false);
    if (error) {
      addToast(error.message, 'error');
    } else {
      setResendDone(true);
      addToast('Confirmation email sent! Check your inbox.', 'success');
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white w-[45%] shrink-0 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]">
        <Link href="/" className="font-display-lg text-2xl font-bold tracking-tight">AB Book Shop</Link>
        <div>
          <p className="font-display-lg text-5xl font-bold leading-tight mb-4">
            Welcome<br />back,<br />reader.
          </p>
          <p className="text-white/70 text-lg leading-relaxed">
            Log in to track your orders and discover your next great read.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-white/70 text-sm">
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">package_2</span> Track orders</span>
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">payments</span> Cash on Delivery</span>
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">menu_book</span> 1000+ books</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#f3f7f5]">
        <div className="w-full max-w-[420px] bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-sm">
          <Link href="/" className="lg:hidden block font-display-lg text-xl font-bold text-primary mb-6">AB Book Shop</Link>

          <h1 className="font-headline-md text-3xl text-on-surface mb-1">Log in</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            {redirectParam === '/checkout'
              ? 'Sign in to complete your order — your cart is waiting.'
              : 'Welcome back — we missed you!'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/login#forgot" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Logging in…</>
              ) : 'Log in'}
            </button>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                <p className="font-medium mb-1">⚠️ {errorMsg}</p>
                {needsConfirm && (
                  <div className="mt-2">
                    {resendDone ? (
                      <p className="text-green-600 font-medium">✓ Confirmation email sent! Check your inbox.</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-primary font-semibold underline hover:no-underline disabled:opacity-50"
                      >
                        {resendLoading ? 'Sending…' : 'Resend confirmation email →'}
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Or ask your admin to disable email confirmation in Supabase settings.
                    </p>
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-on-surface-variant">
            New to AB Book Shop?{' '}
            <Link href={signupHref} className="text-primary font-semibold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
