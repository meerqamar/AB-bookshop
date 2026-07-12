'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Logged in successfully!', 'success');
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Log in to your AB Book Shop account</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
