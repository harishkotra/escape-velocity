"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useGame } from "@/lib/game-state"
import { LEVELS } from "@/lib/types"
import { NPCDialogue } from "@/components/game/NPCDialogue"
import { VoiceInput } from "@/components/game/VoiceInput"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"

const DEPARTMENTS = ["Billing", "Technical Support", "Account Services", "Customer Relations", "Escalations"]

const TRANSFER_INTROS = [
  "Billing department! How can I help you? Actually, wait — I'm not sure this is a billing issue. Let me transfer you.",
  "Technical Support! Have you tried turning it off and on? Actually, I don't even know what your problem is. Let me transfer you.",
  "Account Services! I see you have an account. That's all I know. Let me transfer you to someone who knows more.",
  "Customer Relations! Your satisfaction is very important to us. Unfortunately, I have no idea how to help. Let me transfer you.",
  "Escalations! Finally someone who might help! Oh wait, I forgot your issue already. Let me transfer you BACK.",
]

const TRANSFER_RESPONSES = [
  "I heard something about an issue? Doesn't matter! Transferring you to the next department! Good luck!",
  "Your case is very important! Unfortunately, I forgot what your case is. Transferring! Wheee!",
  "I'm the Transfer Goblin and I LOVE transferring! It's my favorite thing! Bye! Off you go!",
  "I could help you... but transferring is more fun! Next department, GO!",
  "You again? Wait, I've never seen you before! Tell me your issue from the beginning! Then I'll transfer you!",
]

export function Level3TransferDungeon() {
  const { dispatch } = useGame()
  const level = LEVELS[2]
  const [npcMessage, setNpcMessage] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [transferCount, setTransferCount] = useState(0)
  const [currentDept, setCurrentDept] = useState(0)
  const [previousExplanations, setPreviousExplanations] = useState<string[]>([])
  const [hasRepeated, setHasRepeated] = useState(false)
  const [showEscalateHint, setShowEscalateHint] = useState(false)
  const [escaped, setEscaped] = useState(false)

  const speak = useCallback(async (msg: string) => {
    setIsTyping(true)
    setNpcMessage(msg)
    const duration = Math.max(msg.length * 25, 600)
    await new Promise((r) => setTimeout(r, duration))
    setIsTyping(false)
  }, [])

  useEffect(() => {
    dispatch({ type: "SET_LEVEL", levelId: 3 })
    speak("Welcome to the Transfer Dungeon! I'm the Transfer Goblin! I love transferring! Tell me your issue, and I'll make sure it gets sent to the WRONG department! Probably. What's your problem?")
    setTimeout(() => setShowVoiceInput(true), 2500)
  }, [dispatch, speak])

  const isConfused = (text: string): boolean => {
    const t = text.toLowerCase()
    return ["i don't know", "idk", "what", "help", "confused", "stuck", "not sure", "don't understand", "what do i do", "how", "unsure", "no idea", "?"].some((p) => t.includes(p))
  }

  const checkRepetition = (text: string): boolean => {
    if (previousExplanations.length === 0) return false
    const prev = previousExplanations.join(" ").toLowerCase()
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const repeated = words.filter((w) => prev.includes(w))
    return repeated.length >= 3
  }

  const doTransfer = useCallback(async (text: string) => {
    const nextDept = (transferCount + 1) % DEPARTMENTS.length
    const newCount = transferCount + 1
    setTransferCount(newCount)
    setCurrentDept(nextDept)
    setPreviousExplanations((p) => [...p, text])

    const repeated = checkRepetition(text)
    if (repeated) setHasRepeated(true)

    dispatch({ type: "INCREMENT_TRANSFERS" })
    dispatch({ type: "ADD_SCORE", levelId: 3, category: "persistence", amount: 10 })

    if (repeated) {
      dispatch({ type: "ADD_SCORE", levelId: 3, category: "empathy", amount: -10 })
    } else {
      dispatch({ type: "ADD_SCORE", levelId: 3, category: "empathy", amount: 15 })
    }

    if (newCount >= 12) {
      dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "transferred-12" })
    }

    if (newCount >= 5) {
      setShowEscalateHint(true)
    }

    const deptMsg = TRANSFER_INTROS[nextDept % TRANSFER_INTROS.length]
    const transferMsg = TRANSFER_RESPONSES[Math.floor(Math.random() * TRANSFER_RESPONSES.length)]
    await speak(`${deptMsg} ${transferMsg}`)

    setTimeout(() => setShowVoiceInput(true), 1500)
  }, [transferCount, previousExplanations, dispatch, speak])

  const handleTranscript = useCallback(async (text: string) => {
    setShowVoiceInput(false)

    if (isConfused(text.toLowerCase())) {
      if (showEscalateHint) {
        await speak("You're stuck in transfer hell! The only way out is to DEMAND the Escalations department. Say 'escalations' or 'supervisor'!")
      } else {
        await speak("Just explain your issue! The Transfer Goblin will transfer you to... somewhere! Eventually you'll figure out you need to ask for Escalations.")
      }
      setTimeout(() => setShowVoiceInput(true), 1500)
      return
    }

    if (showEscalateHint) {
      const t = text.toLowerCase()
      if (t.includes("escalation") || t.includes("supervisor") || t.includes("manager") || t.includes("superior")) {
        setEscaped(true)
        dispatch({ type: "ADD_SCORE", levelId: 3, category: "problemSolving", amount: 80 })
        dispatch({ type: "ADD_SCORE", levelId: 3, category: "negotiation", amount: 50 })
        if (!hasRepeated) {
          dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "no-repetition" })
        }
        await speak("ESCALATIONS! Finally! You asked for the right department! I'm impressed. Most people just keep explaining their issue forever. You've earned your escape! ESCAPE UNLOCKED! 🎉")
        setTimeout(() => dispatch({ type: "SET_PHASE", phase: "levelComplete" }), 2500)
        return
      }
    }

    await doTransfer(text)
  }, [showEscalateHint, hasRepeated, dispatch, speak, doTransfer])

  const progress = Math.min((transferCount / 5) * 100, 100)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-green-900/30 via-zinc-900 to-black p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "SET_PHASE", phase: "title" })} className="text-zinc-400">← Exit</Button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-zinc-500 mb-1">
            <span>Level 3</span>
            <span>Transfers: {transferCount}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-32">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold text-white">{level.title}</h2>
          <p className="text-sm text-zinc-400">{level.subtitle}</p>
        </div>

        <NPCDialogue npcName={`${level.npc} → ${DEPARTMENTS[currentDept]}`} message={npcMessage} isTyping={isTyping} emotion={hasRepeated ? "annoyed" : "cheerful"} />

        <div className="flex flex-wrap gap-2 justify-center">
          <span className={`text-sm px-3 py-1 rounded-full ${hasRepeated ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
            {hasRepeated ? "🔁 Repeating yourself" : "✓ Consistent story"}
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
            Current: {DEPARTMENTS[currentDept]}
          </span>
        </div>

        {showEscalateHint && !escaped && (
          <Card className="bg-green-500/10 border-green-500/30 p-4">
            <p className="text-sm font-bold text-green-400 mb-1">🔍 Transfer Log:</p>
            <p className="text-sm text-green-300">You've been transferred 5+ times. Ask for the Escalations department to escape!</p>
          </Card>
        )}

        {showEscalateHint && !escaped && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Button
              onClick={() => handleTranscript("I need the Escalations department")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6"
            >
              ⚡ Ask for Escalations
            </Button>
          </motion.div>
        )}

        {transferCount > 0 && (
          <div className="text-center text-sm text-zinc-500 italic">
            💡 Keep explaining your issue or ask for "Escalations" to escape
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
        {showVoiceInput && !escaped ? (
          <VoiceInput onTranscript={handleTranscript} />
        ) : escaped ? (
          <div className="text-center text-green-400 font-bold text-lg">ESCAPED TRANSFER DUNGEON! 🎉</div>
        ) : (
          <div className="text-center text-zinc-400 text-sm">{isTyping ? `${DEPARTMENTS[currentDept]} is reviewing...` : ""}</div>
        )}
      </div>
    </div>
  )
}
