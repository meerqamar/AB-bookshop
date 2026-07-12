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
    // Create profile
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        role: 'user'
      });
    }
    setLoading(false);
    addToast('Account created successfully!', 'success');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join AB Book Shop today</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
