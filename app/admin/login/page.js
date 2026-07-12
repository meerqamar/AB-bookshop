'use client'

import { useState } from 'react'
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
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4">
      <div className="w-full max-w-md p-8 sm:p-10 bg-card rounded-3xl shadow-xl border border-border">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold text-text-primary mb-2">Admin Panel</h1>
          <p className="text-text-secondary">Sign in to manage your store</p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="text-sm font-bold text-text-primary mb-2 block">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-bold text-text-primary mb-2 block">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl px-8 py-4 bg-primary text-white hover:bg-primary-dark shadow-md mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
