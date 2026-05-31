"use client"

import { motion } from "framer-motion"
import { useGame } from "@/lib/game-state"
import { ACHIEVEMENTS_DEF } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface AchievementsDisplayProps {
  achievementId: string
}

export function AchievementsDisplay({ achievementId }: AchievementsDisplayProps) {
  const def = ACHIEVEMENTS_DEF.find((a) => a.id === achievementId)
  if (!def) return null

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
    >
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {def.icon}
          </motion.span>
          <div>
            <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
              Achievement Unlocked
            </div>
            <div className="text-sm font-bold text-white">
              {def.title}
            </div>
            <div className="text-xs text-zinc-300">
              {def.description}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function AchievementsList() {
  const { state } = useGame()
  if (state.achievements.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
        Achievements
      </h3>
      {state.achievements.map((a) => (
        <div key={a.id} className="flex items-center gap-2 text-sm">
          <span>{a.icon}</span>
          <span className="text-zinc-300">{a.title}</span>
        </div>
      ))}
    </div>
  )
}
