"use client"

import { motion } from "framer-motion"
import { useGame } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Link from "next/link"

export function GameTitleScreen() {
  const { dispatch } = useGame()
  const [playerName, setPlayerName] = useState("")

  const handleStart = () => {
    dispatch({ type: "SET_PLAYER_NAME", name: playerName || "Player" })
    dispatch({ type: "SET_LEVEL", levelId: 1 })
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-zinc-900 via-black to-zinc-900 p-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            className="text-7xl mb-4"
          >
            🏢
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 leading-tight">
            Customer
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Escape Room
            </span>
          </h1>
          <p className="text-zinc-400 text-lg">Can you survive being a customer?</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xs space-y-3"
        >
          <Input
            placeholder="Your name (optional)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="text-center h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
          />
          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25"
          >
            🎮 Start Game
          </Button>

          <Link href="/game/judge" className="block">
            <Button
              variant="outline"
              className="w-full h-12 text-sm border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 rounded-xl"
            >
              ⚡ Judge Demo Mode (One Click)
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-zinc-500 mb-3">6 customer service nightmares to escape</p>
          <div className="flex gap-3 justify-center text-2xl">
            <span>🤖</span>
            <span>📞</span>
            <span>👺</span>
            <span>🐉</span>
            <span>🧙</span>
            <span>👑</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center pb-4 space-y-2"
      >
        <p className="text-xs text-zinc-600 italic">
          "Your satisfaction is very important to us."
        </p>
        <p className="text-xs text-zinc-700">
          Built by{" "}
          <a href="https://harishkotra.me" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">
            Harish Kotra
          </a>
          {" — "}
          <a href="https://dailybuild.xyz" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">
            Check out my other builds
          </a>
        </p>
      </motion.div>
    </div>
  )
}
