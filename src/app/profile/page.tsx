'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ProfilePage() {
  const [gamertag, setGamertag] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('gamertag')
        .eq('id', user.id)
        .single()

      if (data?.gamertag) setGamertag(data.gamertag)
      setLoading(false)
    }
    loadProfile()
  }, [])

  const saveProfile = async () => {
    setMessage('Saving...')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, gamertag })

    setMessage(error ? error.message : 'Profile saved!')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-800">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Your Profile
        </h1>
        <input
          type="text"
          placeholder="Gamertag"
          value={gamertag}
          onChange={(e) => setGamertag(e.target.value)}
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:border-cyan-500 outline-none"
        />
        <button
          onClick={saveProfile}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
        >
          Save Gamertag
        </button>
        {message && <p className="text-center text-sm text-yellow-400">{message}</p>}
        <a href="/" className="block text-center text-gray-400 hover:text-cyan-400 text-sm mt-4">← Back to Home</a>
      </div>
    </div>
  )
}