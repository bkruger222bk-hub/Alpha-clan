'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const rankColors = [
  'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]',
  'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]',
  'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]',
  'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]',
  'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]',
  'text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.6)]',
]

function getRankColor(index: number) {
  const group = Math.floor(index / 3)
  return rankColors[Math.min(group, rankColors.length - 1)]
}

export default function Leaderboard() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from('game_logs')
      .select(`
        eliminations,
        points,
        profiles (gamertag)
      `)
    
    const grouped: any = {}
    data?.forEach((log: any) => {
      const tag = log.profiles?.gamertag || 'Unknown'
      if (!grouped[tag]) grouped[tag] = { games: 0, elims: 0, points: 0 }
      grouped[tag].games += 1
      grouped[tag].elims += log.eliminations
      grouped[tag].points += Number(log.points)
    })

    const sorted = Object.entries(grouped)
      .map(([gamertag, stats]: any) => ({
        gamertag,
        ...stats,
        kd: stats.games > 0 ? (stats.elims / stats.games).toFixed(2) : '0'
      }))
      .sort((a, b) => b.points - a.points)

    setLogs(sorted)
    setLoading(false)
  }

  useEffect(() => {
    loadLeaderboard()

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_logs' },
        () => loadLeaderboard()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cyan-400 tracking-widest">LOADING LEADERBOARD...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-center tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] mb-1">
          ALPHA
        </h1>
        <p className="text-center text-gray-400 tracking-[0.4em] uppercase text-sm mb-8">Leaderboard</p>

        <div className="space-y-3">
          {logs.map((player, i) => {
            const colorClass = getRankColor(i)
            return (
              <div key={player.gamertag} className="bg-black/50 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-2xl font-black w-8 ${colorClass}`}>{i + 1}</span>
                  <span className={`font-semibold text-lg flex-1 ${colorClass}`}>{player.gamertag}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm pl-11">
                  <span className="text-yellow-400 font-medium">{player.points.toFixed(1)} pts</span>
                  <span className="text-blue-400">{player.elims} elims</span>
                  <span className="text-gray-400">{player.games} games</span>
                  <span className="text-green-400">{player.kd} KD</span>
                </div>
              </div>
            )
          })}
        </div>

        <a href="/" className="block text-center text-gray-400 hover:text-cyan-400 mt-10 tracking-widest text-sm">← BACK</a>
      </div>
    </div>
  )
}