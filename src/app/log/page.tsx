'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LogGame() {
  const [mode, setMode] = useState('Battle Royale')
  const [eliminations, setEliminations] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const submitLog = async () => {
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

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg"
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
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg"
        />

        <div>
          <label className="block text-sm text-gray-400 mb-1">Evidence Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-white"
          />
        </div>

        <button
          onClick={submitLog}
          disabled={uploading}
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