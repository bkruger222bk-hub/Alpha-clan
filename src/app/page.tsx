'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-cyan-400 tracking-widest">LOADING...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 pointer-events-none" />
      
      <h1 className="relative text-6xl md:text-7xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-2">
        ALPHA
      </h1>
      <p className="relative text-lg tracking-[0.3em] text-gray-300 uppercase mb-10">
        Clan Tournament
      </p>
      
      {user ? (
        <div className="relative text-center space-y-6">
          <p className="text-cyan-400 text-lg">Logged in as {user.email}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/profile" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold rounded-lg hover:opacity-90 transition shadow-[0_0_20px_rgba(251,146,60,0.4)]">
              Profile
            </a>
            <a href="/log" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              Log a Game
            </a>
            <a href="/leaderboard" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              Leaderboard
            </a>
          </div>
        </div>
      ) : (
        <a 
          href="/login" 
          className="relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold tracking-wider hover:opacity-90 transition shadow-[0_0_25px_rgba(99,102,241,0.4)]"
        >
          ENTER
        </a>
      )}
    </main>
  )
}