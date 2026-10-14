'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Loading...')

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(isSignUp ? 'Check your email to confirm!' : 'Logged in! Redirecting...')
      if (!isSignUp) {
        window.location.href = '/'
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleAuth} className="w-full max-w-md space-y-4 bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-800">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          ALPHA Login
        </h1>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:border-cyan-500 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:border-cyan-500 outline-none"
          required
        />
        
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
        >
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-gray-400 hover:text-white"
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign up'}
        </button>
        
        {message && <p className="text-center text-sm text-yellow-400">{message}</p>}
      </form>
    </div>
  )
}