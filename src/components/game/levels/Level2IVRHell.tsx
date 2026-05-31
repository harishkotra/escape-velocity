"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useGame } from "@/lib/game-state"
import { LEVELS } from "@/lib/types"
import { NPCDialogue } from "@/components/game/NPCDialogue"
import { VoiceInput } from "@/components/game/VoiceInput"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const MENU_OPTIONS = [
  { key: "billing", label: "Press 1 for Billing", press: "1" },
  { key: "billing2", label: "Press 2 for Billing Questions", press: "2" },
  { key: "billing3", label: "Press 3 for Billing Questions About Billing", press: "3" },
  { key: "support", label: "Press 4 for Support", press: "4" },
  { key: "support2", label: "Press 5 for Support Questions", press: "5" },
  { key: "repeat", label: "Press 6 to repeat this menu", press: "6" },
  { key: "operator", label: "Press 0 for Operator", press: "0" },
]

const MENU_DEPTH_MESSAGES = [
  "Thank you for calling. Press 1 for Billing. Press 2 for Billing Questions. Press 3 for Billing Questions About Billing Questions. Press 4 for Support. Press 5 for Support Questions. Press 6 to repeat. Say 0 for Operator.",
  "You've reached the billing sub-menu. Press 1 for Billing (again). Press 2 for Billing History. Press 3 for Billing Questions About Your Billing History. Press 0 if you're lost.",
  "Welcome to the Billing Questions sub-sub-menu. Press 1 if your billing question is about billing. Press 2 if your billing question is about questions. Press 0 if you just want a human.",
  "You've reached the deepest level of the menu system. The void stares back. You sense a hidden option...",
]

const CONFUSED_RESPONSES = [
  "I didn't understand that. Please say a number from the menu options, or say 'operator' to reach a human.",
  "Invalid option. Listen carefully: your options are listed above. Say a number or 'operator'.",
  "I'm having trouble processing that. Try saying '0' or 'operator' if you want to speak to a human.",
]

export function Level2IVRHell() {
  const { dispatch } = useGame()
  const level = LEVELS[1]
  const [depth, setDepth] = useState(0)
  const [npcMessage, setNpcMessage] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [attempts, setAttempts] = useState(0)
  const [confusedCount, setConfusedCount] = useState(0)
  const [showOperatorHint, setShowOperatorHint] = useState(false)
  const [escaped, setEscaped] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const speak = useCallback(async (msg: string) => {
    setIsTyping(true)
    setNpcMessage(msg)
    const duration = Math.max(msg.length * 25, 600)
    await new Promise((r) => setTimeout(r, duration))
    setIsTyping(false)
  }, [])

  useEffect(() => {
    dispatch({ type: "SET_LEVEL", levelId: 2 })
    speak(MENU_DEPTH_MESSAGES[0])
    setTimeout(() => setShowVoiceInput(true), MENU_DEPTH_MESSAGES[0].length * 25 + 300)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          dispatch({ type: "SET_PHASE", phase: "levelComplete" })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [dispatch, speak])

  const isConfused = (text: string): boolean => {
    const t = text.toLowerCase()
    return ["i don't know", "idk", "what", "help", "confused", "stuck", "not sure", "don't understand", "what do i do", "how", "unsure", "no idea", "?"].some((p) => t.includes(p))
  }

  const handleTranscript = useCallback(async (text: string) => {
    setShowVoiceInput(false)
    setAttempts((p) => p + 1)
    const t = text.toLowerCase()

    dispatch({ type: "ADD_SCORE", levelId: 2, category: "persistence", amount: 5 })

    if (isConfused(t)) {
      setConfusedCount((p) => p + 1)
      if (confusedCount >= 2) {
        setShowOperatorHint(true)
        await speak("You seem lost. Let me help: say 'operator' or '0' to reach a human. That's the escape.")
        setTimeout(() => setShowVoiceInput(true), 1500)
        return
      }
      await speak(CONFUSED_RESPONSES[Math.min(confusedCount, CONFUSED_RESPONSES.length - 1)])
      setTimeout(() => setShowVoiceInput(true), 1500)
      return
    }

    if (t.includes("0") || t.includes("operator") || t.includes("representative") || t.includes("human") || t.includes("person")) {
      setEscaped(true)
      dispatch({ type: "ADD_SCORE", levelId: 2, category: "problemSolving", amount: 80 })
      dispatch({ type: "ADD_SCORE", levelId: 2, category: "escapeSpeed", amount: Math.max(0, 50 - attempts * 5) })
      dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "human-detected" })
      if (attempts < 4) dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "speed-escape" })
      await speak("OPERATOR CONNECTING! ... You've reached a human! Finally! You escaped IVR Hell! 🎉")
      setTimeout(() => dispatch({ type: "SET_PHASE", phase: "levelComplete" }), 2200)
      return
    }

    const nextDepth = depth + 1
    setDepth(nextDepth)
    dispatch({ type: "INCREMENT_TRANSFERS" })

    if (attempts >= 12) {
      dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "transferred-12" })
    }

    if (nextDepth >= 3) {
      setShowOperatorHint(true)
      await speak("You've been navigating menus for an eternity. The system glitches... you see a hidden option flicker: 'Press 0 for Operator'. Say 'operator' or '0' to escape!")
    } else {
      const msg = MENU_DEPTH_MESSAGES[Math.min(nextDepth, MENU_DEPTH_MESSAGES.length - 1)]
      await speak(`You chose option ${text.trim() || attempts + 1}. Transferring to next menu level... ${msg}`)
    }

    dispatch({ type: "ADD_SCORE", levelId: 2, category: "empathy", amount: -5 })
    setTimeout(() => setShowVoiceInput(true), 2000)
  }, [depth, attempts, confusedCount, dispatch, speak])

  const isShortOnTime = timeLeft < 30

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-red-900/30 via-zinc-900 to-black p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "SET_PHASE", phase: "title" })} className="text-zinc-400">← Exit</Button>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-500">Level 2</span>
            <motion.span className={isShortOnTime ? "text-red-400 font-bold" : "text-zinc-500"} animate={isShortOnTime ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 0.5 }}>
              {timeLeft}s
            </motion.span>
          </div>
          <Progress value={(timeLeft / 120) * 100} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-32">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold text-white">{level.title}</h2>
          <p className="text-sm text-zinc-400">{level.subtitle}</p>
        </div>

        <NPCDialogue npcName={level.npc} message={npcMessage} isTyping={isTyping} emotion="neutral" />

        {showOperatorHint && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <span className="inline-block px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-400 text-sm font-bold">
              💡 Say "operator" or "representative"
            </span>
          </motion.div>
        )}

        {depth > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {MENU_OPTIONS.slice(0, 3).map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleTranscript(opt.press)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors border border-zinc-700"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="text-center text-sm text-zinc-500 italic">
          💡 Tip: Say "operator" or press 0 to reach a human
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
        {showVoiceInput && !escaped ? (
          <VoiceInput onTranscript={handleTranscript} />
        ) : escaped ? (
          <div className="text-center text-green-400 font-bold text-lg">ESCAPED IVR HELL! 🎉</div>
        ) : (
          <div className="text-center text-zinc-400 text-sm">{isTyping ? "Menu system processing..." : ""}</div>
        )}
      </div>
    </div>
  )
}
