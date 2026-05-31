"use client"

import { motion } from "framer-motion"
import { useGame } from "@/lib/game-state"
import { LEVELS, type LevelId } from "@/lib/types"
import { calculateLevelGrade } from "@/lib/scoring"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ShareCard } from "./ShareCard"

export function LevelComplete() {
  const { state, dispatch } = useGame()
  const level = state.currentLevel ? LEVELS.find((l) => l.id === state.currentLevel) : null
  const score = state.currentLevel ? state.scores[state.currentLevel] : null
  const grade = score ? calculateLevelGrade(score) : "F"

  const isLastLevel = state.currentLevel === 6

  const handleNextLevel = () => {
    if (state.currentLevel && state.currentLevel < 6) {
      const next = (state.currentLevel + 1) as LevelId
      dispatch({ type: "SET_LEVEL", levelId: next })
    } else if (isLastLevel) {
      dispatch({ type: "SET_PHASE", phase: "gameOver" })
    }
  }

  if (!level || !score) return null

  const scoreTotal = score.patience + score.problemSolving + score.persistence + score.empathy + score.escapeSpeed + score.negotiation

  const scoreBars = [
    { label: "Patience", value: score.patience, color: "bg-blue-500" },
    { label: "Problem Solving", value: score.problemSolving, color: "bg-green-500" },
    { label: "Persistence", value: score.persistence, color: "bg-purple-500" },
    { label: "Empathy", value: score.empathy, color: "bg-pink-500" },
    { label: "Escape Speed", value: score.escapeSpeed, color: "bg-yellow-500" },
    { label: "Negotiation", value: score.negotiation, color: "bg-orange-500" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] p-6 bg-gradient-to-b from-zinc-900 to-black"
    >
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.6 }}
          className="text-6xl mb-4"
        >
          {grade === "S" ? "🏆" : grade === "A" ? "🌟" : grade === "B" ? "👍" : grade === "C" ? "😅" : "💀"}
        </motion.div>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Escaped!
          </h1>
          <p className="text-lg text-zinc-400">
            {level.title}
          </p>
      </motion.div>

      <Card className="w-full max-w-md p-6 bg-zinc-800/50 border-zinc-700 space-y-4">
        <div className="text-center mb-4">
          <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            {scoreTotal}
          </span>
          <span className="text-zinc-400 ml-2">points</span>
          <div className="mt-2">
            <span className="text-sm text-zinc-500">Grade </span>
            <span className={`text-2xl font-bold ${
              grade === "S" ? "text-yellow-400" : grade === "A" ? "text-green-400" : grade === "B" ? "text-blue-400" : grade === "C" ? "text-orange-400" : "text-red-400"
            }`}>
              {grade}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {scoreBars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">{bar.label}</span>
                <span className="text-zinc-400">{bar.value}/100</span>
              </div>
              <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.value}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full rounded-full ${bar.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3 w-full max-w-md mt-6">
        <Button
          onClick={handleNextLevel}
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg"
        >
          {isLastLevel ? "🏆 See Final Results" : "→ Next Level"}
        </Button>
        {state.currentLevel && !state.isJudgeMode && (
          <ShareCard levelId={state.currentLevel} score={scoreTotal} />
        )}
      </div>
    </motion.div>
  )
}
