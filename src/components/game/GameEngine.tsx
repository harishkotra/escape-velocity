"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGame } from "@/lib/game-state"
import { LEVELS, type LevelId } from "@/lib/types"
import { Level1RefundMaze } from "./levels/Level1RefundMaze"
import { Level2IVRHell } from "./levels/Level2IVRHell"
import { Level3TransferDungeon } from "./levels/Level3TransferDungeon"
import { Level4SubscriptionPrison } from "./levels/Level4SubscriptionPrison"
import { Level5ChatbotLabyrinth } from "./levels/Level5ChatbotLabyrinth"
import { Level6KarenBossFight } from "./levels/Level6KarenBossFight"
import { LevelComplete } from "./LevelComplete"
import { ScoreDisplay } from "./ScoreDisplay"
import { AchievementsDisplay } from "./AchievementsDisplay"

export function GameEngine({ initialLevel }: { initialLevel?: LevelId }) {
  const { state, dispatch } = useGame()
  const [showAchievement, setShowAchievement] = useState<string | null>(null)
  const prevAchievements = state.achievements.length

  useEffect(() => {
    if (state.achievements.length > prevAchievements) {
      const latest = state.achievements[state.achievements.length - 1]
      setShowAchievement(latest.id)
      const timer = setTimeout(() => setShowAchievement(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [state.achievements.length])

  useEffect(() => {
    if (initialLevel && !state.currentLevel) {
      dispatch({ type: "SET_JUDGE_MODE", value: true })
      dispatch({ type: "SET_LEVEL", levelId: initialLevel })
    }
  }, [initialLevel])

  if (state.phase === "levelComplete") {
    return <LevelComplete />
  }

  const renderLevel = () => {
    switch (state.currentLevel) {
      case 1: return <Level1RefundMaze />
      case 2: return <Level2IVRHell />
      case 3: return <Level3TransferDungeon />
      case 4: return <Level4SubscriptionPrison />
      case 5: return <Level5ChatbotLabyrinth />
      case 6: return <Level6KarenBossFight />
      default: return null
    }
  }

  return (
    <div className="relative w-full h-full min-h-[100dvh] flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {state.currentLevel && (
            <motion.div
              key={state.currentLevel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0"
            >
              {renderLevel()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <AchievementsDisplay achievementId={showAchievement} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
