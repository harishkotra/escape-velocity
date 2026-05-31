"use client"

import { GameProvider, useGame } from "@/lib/game-state"
import { GameTitleScreen } from "@/components/game/GameTitleScreen"
import { GameEngine } from "@/components/game/GameEngine"
import { GameOverScreen } from "@/components/game/GameOverScreen"
import { ScoreDisplay } from "@/components/game/ScoreDisplay"

function GameHub() {
  const { state } = useGame()

  if (state.phase === "title") return <GameTitleScreen />
  if (state.phase === "gameOver") return <GameOverScreen />

  return (
    <>
      <ScoreDisplay />
      <GameEngine />
    </>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <GameHub />
    </GameProvider>
  )
}
