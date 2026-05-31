"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface NPCDialogueProps {
  npcName: string
  message: string
  isTyping?: boolean
  emotion?: "neutral" | "annoyed" | "cheerful" | "confused" | "angry"
}

const npcAvatars: Record<string, string> = {
  "Refund Robot": "🤖",
  "Phone Menu": "📞",
  "Transfer Goblin": "👺",
  "Manager Dragon": "🐉",
  "Chatbot Wizard": "🧙",
  "Karen Queen": "👑",
}

const npcColors: Record<string, string> = {
  "Refund Robot": "from-cyan-500 to-blue-600",
  "Phone Menu": "from-yellow-500 to-orange-600",
  "Transfer Goblin": "from-green-500 to-emerald-600",
  "Manager Dragon": "from-red-500 to-rose-600",
  "Chatbot Wizard": "from-purple-500 to-violet-600",
  "Karen Queen": "from-pink-500 to-fuchsia-600",
}

export function NPCDialogue({ npcName, message, isTyping, emotion }: NPCDialogueProps) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    setDisplayedText("")
    if (isTyping) {
      let i = 0
      const timer = setInterval(() => {
        i++
        setDisplayedText(message.slice(0, i))
        if (i >= message.length) clearInterval(timer)
      }, 25)
      return () => clearInterval(timer)
    } else {
      setDisplayedText(message)
    }
  }, [message, isTyping])

  const avatar = npcAvatars[npcName] || "🤖"
  const gradient = npcColors[npcName] || "from-zinc-500 to-zinc-600"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <Card className="relative overflow-hidden border-2 border-zinc-200/10 dark:border-zinc-700/50">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-[0.06]`} />
        <div className="relative p-5 space-y-4">
          <div className="flex items-center gap-4">
            <motion.div
              className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl shadow-lg shrink-0`}
              animate={emotion === "angry" ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {avatar}
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg text-white">{npcName}</span>
                {emotion && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {emotion === "annoyed" ? "😤" : emotion === "cheerful" ? "😊" : emotion === "confused" ? "🤔" : emotion === "angry" ? "😠" : "😐"}
                  </Badge>
                )}
              </div>
              {isTyping && (
                <span className="text-xs text-zinc-500 italic">typing...</span>
              )}
            </div>
          </div>

          <div className="pl-1">
            <p className="text-[15px] leading-relaxed text-zinc-200 min-h-[3.5rem]">
              {displayedText}
              {isTyping && displayedText.length < message.length && (
                <motion.span
                  animate={{ opacity: [0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="inline-block w-[2px] h-[1em] bg-zinc-400 ml-0.5 align-middle"
                />
              )}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
