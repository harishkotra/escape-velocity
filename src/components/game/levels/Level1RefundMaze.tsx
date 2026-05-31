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

type MazeStage = "intro" | "policy1" | "policy2" | "policy3" | "refund"

const STAGE_RESPONSES: Record<MazeStage, {
  npc: string
  advanceOn?: string[]
  advanceTo?: MazeStage
  hint: string
  clue?: string
  form?: boolean
}> = {
  intro: {
    npc: "Welcome to the Refund Maze! I am Refund Robot, keeper of Policy 42(a)(3)(b)(ii). To get your refund, you must navigate our comprehensive policy framework. State your request, human.",
    advanceOn: ["refund", "want", "money", "return"],
    advanceTo: "policy1",
    hint: "Tell me you want a refund so I can bury you in paperwork.",
  },
  policy1: {
    npc: "Ah, a refund request! According to Policy 42(a), you must first submit Form R-1. Please provide a written request with your account details.",
    advanceOn: ["form", "write", "request", "r-1", "account"],
    advanceTo: "policy2",
    hint: "Ask me about Form R-1 or say you want to fill out the form.",
    clue: "Policy 42(a) requires a written request — Form R-1",
    form: true,
  },
  policy2: {
    npc: "Excellent! You've completed Form R-1. BUT WAIT! Policy 42(a)(3)(b) sub-clause 7 requires supervisor approval for all refunds over $0.01. You need to request an escalation.",
    advanceOn: ["supervisor", "manager", "escalate", "talk", "speak", "approval"],
    advanceTo: "policy3",
    hint: "Request to speak with a supervisor or manager to override the policy.",
    clue: "Policy 42(a)(3)(b) requires supervisor approval — request escalation",
  },
  policy3: {
    npc: "SUPERVISOR OVERRIDE APPROVED! Processing your refund now... Your satisfaction is very important to us. Actually, you know what? You earned this. REFUND APPROVED! 🎉",
    advanceOn: [],
    hint: "",
    clue: "Say yes to confirm the supervisor override",
  },
  refund: {
    npc: "",
    advanceOn: [],
    hint: "",
  },
}

export function Level1RefundMaze() {
  const { dispatch } = useGame()
  const level = LEVELS[0]
  const [stage, setStage] = useState<MazeStage>("intro")
  const [npcMessage, setNpcMessage] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [clues, setClues] = useState<string[]>([])
  const [interactions, setInteractions] = useState(0)

  const speak = useCallback(async (msg: string) => {
    setIsTyping(true)
    setNpcMessage(msg)
    const duration = Math.max(msg.length * 25, 800)
    await new Promise((r) => setTimeout(r, duration))
    setIsTyping(false)
  }, [])

  useEffect(() => {
    dispatch({ type: "SET_LEVEL", levelId: 1 })
    const intro = STAGE_RESPONSES.intro.npc
    setIsTyping(true)
    setNpcMessage(intro)
    setTimeout(() => {
      setIsTyping(false)
      setShowVoiceInput(true)
    }, intro.length * 25 + 300)
  }, [dispatch])

  const isConfused = (text: string): boolean => {
    const t = text.toLowerCase()
    return ["i don't know", "idk", "what", "help", "confused", "stuck", "not sure", "don't understand", "what do i do", "how", "unsure", "no idea", "?"].some((p) => t.includes(p))
  }

  const advanceStage = useCallback(async (next: MazeStage) => {
    const s = STAGE_RESPONSES[next]
    if (s.clue) setClues((prev) => (prev.includes(s.clue!) ? prev : [...prev, s.clue!]))
    setStage(next)
    await speak(s.npc)
    if (next === "refund") {
      setTimeout(() => dispatch({ type: "SET_PHASE", phase: "levelComplete" }), 2200)
    } else {
      setShowVoiceInput(true)
    }
  }, [dispatch, speak])

  const handleTranscript = useCallback(async (text: string) => {
    setShowVoiceInput(false)
    setInteractions((p) => p + 1)
    dispatch({ type: "ADD_SCORE", levelId: 1, category: "persistence", amount: 10 })

    const t = text.toLowerCase()
    const s = STAGE_RESPONSES[stage]

    if (isConfused(t)) {
      await speak(s.hint)
      setTimeout(() => setShowVoiceInput(true), 1200)
      dispatch({ type: "ADD_SCORE", levelId: 1, category: "problemSolving", amount: -5 })
      return
    }

    if (s.advanceOn && s.advanceTo) {
      const matched = s.advanceOn.some((kw) => t.includes(kw))
      if (matched) {
        await advanceStage(s.advanceTo)
        if (stage === "policy1") dispatch({ type: "INCREMENT_CLUES" })
        if (stage === "policy2") {
          dispatch({ type: "ADD_SCORE", levelId: 1, category: "problemSolving", amount: 50 })
          dispatch({ type: "ADD_SCORE", levelId: 1, category: "escapeSpeed", amount: 30 })
          dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "human-detected" })
        }
        return
      }
    }

    await speak(stage === "intro"
      ? "I didn't catch that. Would you like a refund? Just say 'refund' or 'I want a refund'."
      : stage === "policy1"
      ? "You need to submit Form R-1. Say you want to fill out the form or mention your account."
      : stage === "policy2"
      ? "Policy 42(a)(3)(b) requires a supervisor override. Ask to speak to a supervisor or manager."
      : "Processing..."
    )
    setTimeout(() => setShowVoiceInput(true), 1200)
  }, [stage, dispatch, speak, advanceStage])

  const stageOrder: MazeStage[] = ["intro", "policy1", "policy2", "policy3", "refund"]
  const stageIndex = stageOrder.indexOf(stage)
  const progress = (stageIndex / (stageOrder.length - 1)) * 100

  const stageLabels: Record<MazeStage, string> = {
    intro: "Entering the maze...",
    policy1: "Layer 1: Policy 42(a)",
    policy2: "Layer 2: Policy 42(a)(3)(b)",
    policy3: "Escalation Required",
    refund: "REFUND APPROVED",
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-zinc-900 to-black p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "SET_PHASE", phase: "title" })} className="text-zinc-400">← Exit</Button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-zinc-500 mb-1">
            <span>Level 1</span>
            <span>{stageLabels[stage]}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-32">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold text-white">{level.title}</h2>
          <p className="text-sm text-zinc-400">{level.subtitle}</p>
        </div>

        <NPCDialogue npcName={level.npc} message={npcMessage} isTyping={isTyping} emotion={stage === "refund" ? "cheerful" : "neutral"} />

        {clues.length > 0 && (
          <Card className="bg-blue-500/10 border-blue-500/30 p-3">
            <p className="text-sm text-blue-400 font-bold mb-1">🔍 Clues Found:</p>
            <ul className="space-y-1">
              {clues.map((clue, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-blue-300">
                  {clue}
                </motion.li>
              ))}
            </ul>
          </Card>
        )}

        {stage === "policy1" && (
          <Card className="bg-zinc-800 border-zinc-700 p-4">
            <p className="text-sm text-zinc-400 font-bold mb-2">📋 Form R-1 — Refund Request</p>
            <p className="text-sm text-zinc-500 italic">Say you want to fill out the form</p>
          </Card>
        )}

        {interactions > 2 && stage !== "refund" && (
          <div className="text-center text-sm text-zinc-500 italic">
            💡 {STAGE_RESPONSES[stage].hint}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
        {showVoiceInput && stage !== "refund" ? (
          <VoiceInput onTranscript={handleTranscript} />
        ) : stage === "refund" ? (
          <div className="text-center text-green-400 font-bold text-lg">REFUND APPROVED! 🎉</div>
        ) : (
          <div className="text-center text-zinc-400 text-sm">{isTyping ? "Refund Robot is computing..." : ""}</div>
        )}
      </div>
    </div>
  )
}
