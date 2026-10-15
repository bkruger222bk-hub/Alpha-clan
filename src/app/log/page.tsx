'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const WINDOW_HOURS = 5

export default function LogGame() {
  const [mode, setMode] = useState('Battle Royale')
  const [eliminations, setEliminations] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [windowOpen, setWindowOpen] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkWindow = async () => {
      const { data } = await supabase
        .from('game_logs')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1)

      if (!data || data.length === 0) {
        setTimeLeft('Window not started yet')
        setWindowOpen(true)
        return
      }

      const start = new Date(data[0].created_at)
      const end = new Date(start.getTime() + WINDOW_HOURS * 60 * 60 * 1000)
      const now = new Date()

      if (now > end) {
        setWindowOpen(false)
        setTimeLeft('Logging closed')
        return
      }

      const updateTimer = () => {
        const diff = end.getTime() - new Date().getTime()
        if (diff <= 0) {
          setWindowOpen(false)
          setTimeLeft('Logging closed')
          return
        }
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${h}h ${m}m ${s}s`)
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }

    checkWindow()
  }, [])

  const submitLog = async () => {
    if (!windowOpen) return setMessage('Logging window is closed')
    if (!eliminations) return setMessage('Enter eliminations')
    setUploading(true)
    setMessage('Saving...')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setMessage('Not logged in')

    let photoUrl = null

    if (photo) {
      const fileName = `${user.id}/${Date.now()}-${photo.name}`
      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, photo)

      if (uploadError) {
        setMessage('Photo upload failed: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from('evidence').getPublicUrl(fileName)
      photoUrl = data.publicUrl
    }

    const { error } = await supabase.from('game_logs').insert({
      member_id: user.id,
      mode,
      eliminations: parseInt(eliminations),
      evidence_photo_url: photoUrl,
    })

    setMessage(error ? error.message : 'Game logged!')
    setUploading(false)
    if (!error) {
      setEliminations('')
      setPhoto(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-800">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Log a Game
        </h1>

        {timeLeft && (
          <div className={`text-center text-lg font-bold ${windowOpen ? 'text-cyan-400' : 'text-red-400'}`}>
            {windowOpen ? `Time left: ${timeLeft}` : timeLeft}
          </div>
        )}

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={!windowOpen}
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg disabled:opacity-50"
        >
          <option>Battle Royale</option>
          <option>Resurgence</option>
          <option>Black Ops</option>
        </select>

        <input
          type="number"
          placeholder="Eliminations"
          value={eliminations}
          onChange={(e) => setEliminations(e.target.value)}
          disabled={!windowOpen}
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg disabled:opacity-50"
        />

        <div>
          <label className="block text-sm text-gray-400 mb-1">Evidence Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            disabled={!windowOpen}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-white disabled:opacity-50"
          />
        </div>

        <button
          onClick={submitLog}
          disabled={uploading || !windowOpen}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold disabled:opacity-50"
        >
          {uploading ? 'Saving...' : 'Log Game'}
        </button>

        {message && <p className="text-center text-sm text-yellow-400">{message}</p>}
        <a href="/" className="block text-center text-gray-400 hover:text-cyan-400 text-sm mt-4">← Back to Home</a>
      </div>
    </div>
  )
}