"use client"

import { useGame } from "@/lib/game-state"
import { getRank } from "@/lib/scoring"

export function ScoreDisplay() {
  const { state } = useGame()
  const rank = getRank(state.totalScore)

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm rounded-full px-4 py-2 border border-zinc-700">
      <span className="text-xl">{rank.emoji}</span>
      <div className="text-right">
        <div className="text-xs text-zinc-400">Score</div>
        <div className="text-base font-bold text-white">{state.totalScore}</div>
      </div>
    </div>
  )
}
