"use client"

import { useEffect } from "react"
import { GameProvider } from "@/lib/game-state"
import { GameEngine } from "@/components/game/GameEngine"

export default function JudgeDemoPage() {
  return (
    <GameProvider>
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
        ⚡ JUDGE DEMO MODE
      </div>
      <GameEngine initialLevel={2} />
    </GameProvider>
  )
}
