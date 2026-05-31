"use client"

import { motion } from "framer-motion"
import { useGame } from "@/lib/game-state"
import { getRank, formatScore } from "@/lib/scoring"
import { LEVELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AchievementsList } from "./AchievementsDisplay"

export function GameOverScreen() {
  const { state, dispatch } = useGame()
  const rank = getRank(state.totalScore)

  const handlePlayAgain = () => {
    dispatch({ type: "RESET_GAME" })
  }

  const completedLevels = [1, 2, 3, 4, 5, 6].filter(
    (id) => state.scores[id as keyof typeof state.scores].patience > 0 || state.scores[id as keyof typeof state.scores].problemSolving > 0
  )

  const escapedCount = state.escapes || completedLevels.length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-zinc-900 via-black to-zinc-900 p-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          className="text-center"
        >
          <motion.span
            className="text-8xl block mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1 }}
          >
            {rank.emoji}
          </motion.span>
          <h1 className="text-3xl font-bold text-white mb-2">Game Complete!</h1>
          <p className="text-zinc-400">You survived customer service hell</p>
        </motion.div>

        <Card className="w-full bg-zinc-800/50 border-zinc-700 p-6 space-y-4">
          <div className="text-center">
            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {state.totalScore}
            </span>
            <span className="text-zinc-400 ml-2">total points</span>
            <div className="mt-2">
              <span className="text-lg text-zinc-400">Rank: </span>
              <span className="text-2xl font-bold text-white">{rank.title}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-400 uppercase tracking-wide font-bold">
              Levels Escaped
            </p>
            <div className="grid grid-cols-6 gap-2">
              {LEVELS.map((level) => {
                const score = state.scores[level.id]
                const escaped = score.patience > 0 || score.problemSolving > 0
                return (
                  <div
                    key={level.id}
                    className={`text-center p-2 rounded-lg ${escaped ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-600"}`}
                  >
                    <div className="text-lg">{escaped ? "✅" : "🔒"}</div>
                    <div className="text-xs mt-1">{level.id}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-400 uppercase tracking-wide font-bold">
              Stats
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-zinc-800 rounded-lg p-2 text-center">
                <span className="text-zinc-400">Clues</span>
                <span className="block text-white font-bold">{state.cluesFound}</span>
              </div>
              <div className="bg-zinc-800 rounded-lg p-2 text-center">
                <span className="text-zinc-400">Transfers</span>
                <span className="block text-white font-bold">{state.transfers}</span>
              </div>
              <div className="bg-zinc-800 rounded-lg p-2 text-center">
                <span className="text-zinc-400">Escapes</span>
                <span className="block text-white font-bold">{escapedCount}</span>
              </div>
              <div className="bg-zinc-800 rounded-lg p-2 text-center">
                <span className="text-zinc-400">Achievements</span>
                <span className="block text-white font-bold">{state.achievements.length}</span>
              </div>
            </div>
          </div>

          <AchievementsList />
        </Card>

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={handlePlayAgain}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg"
          >
            🔄 Play Again
          </Button>
        </div>
      </div>
    </div>
  )
}
