'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from './actions'

export default function AdminLoginPage() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white w-[45%] shrink-0 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]">
        <Link href="/" className="font-display-lg text-2xl font-bold tracking-tight">AB Book Shop</Link>
        <div>
          <p className="font-display-lg text-5xl font-bold leading-tight mb-4">
            Store<br />admin<br />console.
          </p>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Manage products, orders, and customers from one place.
          </p>
        </div>
        <p className="text-white/50 text-sm">Authorized staff only</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#f3f7f5]">
        <div className="w-full max-w-md bg-white border border-outline-variant/60 rounded-2xl p-7 sm:p-9 shadow-sm">
          <Link href="/" className="lg:hidden block font-display-lg text-xl font-bold text-primary mb-6">AB Book Shop</Link>
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary mb-2">Admin access</p>
          <h1 className="font-headline-md text-3xl text-on-surface mb-1">Sign in</h1>
          <p className="text-on-surface-variant text-sm mb-7">Sign in to manage your store</p>

          {error && (
            <div className="p-4 mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-on-surface mb-1.5 block">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold text-on-surface mb-1.5 block">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center font-semibold transition-all rounded-xl px-8 py-3.5 bg-primary text-white hover:bg-primary/90 shadow-[0_8px_20px_rgba(4,120,87,0.25)] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Signing in…</>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            <Link href="/" className="text-primary font-semibold hover:underline">← Back to store</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
