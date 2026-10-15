'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ProfilePage() {
  const [gamertag, setGamertag] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [myLogs, setMyLogs] = useState<any[]>([])
  const supabase = createClient()

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('gamertag')
      .eq('id', user.id)
      .single()

    if (profile?.gamertag) setGamertag(profile.gamertag)

    const { data: logs } = await supabase
      .from('game_logs')
      .select('id, mode, eliminations, points, played_at, created_at')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })

    setMyLogs(logs || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
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

  const deleteLog = async (id: string) => {
    if (!confirm('Delete this log?')) return
    const { error } = await supabase.from('game_logs').delete().eq('id', id)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Log deleted')
      loadData()
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-800">
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
          Update Gamertag
        </button>

        <div>
          <h2 className="text-lg font-semibold text-cyan-400 mb-3">Your Logs</h2>
          {myLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No games logged yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {myLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between bg-gray-900/70 p-3 rounded-lg text-sm">
                  <div>
                    <span className="font-medium">{log.mode}</span>
                    <span className="text-gray-400 ml-2">{log.eliminations} elims</span>
                    <span className="text-yellow-400 ml-2">{Number(log.points).toFixed(1)} pts</span>
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="text-red-400 hover:text-red-300 text-xs px-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && <p className="text-center text-sm text-yellow-400">{message}</p>}
        <a href="/" className="block text-center text-gray-400 hover:text-cyan-400 text-sm">← Back to Home</a>
      </div>
    </div>
  )
}