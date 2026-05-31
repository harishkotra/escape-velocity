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

type Stage = "intro" | "sure1" | "offer" | "sure2" | "sure3" | "escaped"

const STAGE_DATA: Record<Stage, {
  npc: string
  guidance: string
}> = {
  intro: {
    npc: "Welcome to Subscription Prison! I am Manager Dragon. I see you want to cancel. ARE YOU SURE? Your satisfaction is very important to us! What do you have to say for yourself?",
    guidance: "Say you want to cancel or leave.",
  },
  sure1: {
    npc: "Are you really, truly, absolutely sure? You'll lose access to 47 premium features! Your monthly newsletter! Your exclusive digital rewards! Think of what you're throwing away!",
    guidance: "Stay firm. Say yes or that you want to cancel.",
  },
  offer: {
    npc: "WAIT! Before you go, take this amazing offer: 50% off for 6 months! Free premium for a year! We'll even throw in a digital hug! Don't leave! Are you sure?",
    guidance: "Reject the offer. Say no, or insist on cancellation.",
  },
  sure2: {
    npc: "Okay but HOW about a downgrade to our basic plan for $1.99/month? You'll still get emails! Are you absolutely, positively, 100% sure you want to cancel everything?",
    guidance: "Stay strong. Say yes, I'm sure, cancel it.",
  },
  sure3: {
    npc: "LAST CHANCE! I have to ask one more time by law. Actually, that's a lie. But I'm asking anyway: ARE YOU SURE? Your satisfaction was never actually important to us, but please stay!",
    guidance: "FINAL CONFIRMATION: Say yes to cancel.",
  },
  escaped: {
    npc: "",
    guidance: "",
  },
}

const GUILT_TRIPS = [
  "But... our monthly newsletter!",
  "Think of the customer support agents who will cry!",
  "Your satisfaction is very important to us! Don't go!",
  "We were just getting to know each other!",
  "You'll miss out on our premium premium plan!",
]

export function Level4SubscriptionPrison() {
  const { dispatch } = useGame()
  const level = LEVELS[3]
  const [stage, setStage] = useState<Stage>("intro")
  const [npcMessage, setNpcMessage] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [sureCount, setSureCount] = useState(0)
  const [offersRejected, setOffersRejected] = useState(0)

  const speak = useCallback(async (msg: string) => {
    setIsTyping(true)
    setNpcMessage(msg)
    const duration = Math.max(msg.length * 25, 600)
    await new Promise((r) => setTimeout(r, duration))
    setIsTyping(false)
  }, [])

  useEffect(() => {
    dispatch({ type: "SET_LEVEL", levelId: 4 })
    speak(STAGE_DATA.intro.npc)
    setTimeout(() => setShowVoiceInput(true), 3000)
  }, [dispatch, speak])

  const isConfused = (text: string): boolean => {
    const t = text.toLowerCase()
    return ["i don't know", "idk", "what", "help", "confused", "stuck", "not sure", "don't understand", "what do i do", "how", "unsure", "no idea", "?"].some((p) => t.includes(p))
  }

  const advanceStage = useCallback(async (next: Stage) => {
    setStage(next)
    if (next === "escaped") {
      dispatch({ type: "ADD_SCORE", levelId: 4, category: "persistence", amount: 80 })
      dispatch({ type: "ADD_SCORE", levelId: 4, category: "negotiation", amount: 60 })
      dispatch({ type: "ADD_SCORE", levelId: 4, category: "escapeSpeed", amount: 40 })
      if (sureCount >= 3) {
        dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "patience-monk" })
      }
      await speak("FINE! You win! Subscription cancelled! You've escaped Subscription Prison! Remember: your satisfaction was never actually important to us. 🎉")
      setTimeout(() => dispatch({ type: "SET_PHASE", phase: "levelComplete" }), 2500)
    } else {
      await speak(STAGE_DATA[next].npc)
      setTimeout(() => setShowVoiceInput(true), 2000)
    }
  }, [dispatch, speak, sureCount])

  const handleTranscript = useCallback(async (text: string) => {
    setShowVoiceInput(false)
    const t = text.toLowerCase()

    if (isConfused(t)) {
      await speak(STAGE_DATA[stage].guidance + " " + GUILT_TRIPS[Math.floor(Math.random() * GUILT_TRIPS.length)])
      setTimeout(() => setShowVoiceInput(true), 1500)
      return
    }

    const isFirm = t.includes("yes") || t.includes("sure") || t.includes("cancel") || t.includes("leave") || t.includes("done") || t.includes("stop")
    const isWeak = t.includes("no") || t.includes("maybe") || t.includes("not sure") || t.includes("think") || t.includes("offer") || t.includes("discount")

    if (stage === "intro") {
      if (isFirm) {
        setSureCount(1)
        await advanceStage("sure1")
      } else {
        await speak("Oh, you're NOT sure? Perfect! Let me tell you about our premium elite diamond plan! Just kidding, but seriously, are you here to cancel or not?")
        setTimeout(() => setShowVoiceInput(true), 2000)
      }
      return
    }

    if (stage === "sure1") {
      if (isFirm) {
        setSureCount(2)
        dispatch({ type: "ADD_SCORE", levelId: 4, category: "persistence", amount: 15 })
        await advanceStage("offer")
      } else {
        await speak("Excellent! You hesitated! That means you want to hear about our retention offers! Here they come!")
        setTimeout(() => setShowVoiceInput(true), 1500)
      }
      return
    }

    if (stage === "offer") {
      if (isWeak) {
        setOffersRejected((p) => p + 1)
        await speak(`WRONG ANSWER! Here's another offer: FREE premium for 1 year! No wait, LIFETIME access for $99! No wait, WE'LL PAY YOU to stay! Are you sure you want to miss out on ALL of this?`)
        setTimeout(() => setShowVoiceInput(true), 2000)
        return
      }
      if (isFirm) {
        setSureCount(3)
        dispatch({ type: "ADD_SCORE", levelId: 4, category: "negotiation", amount: 25 })
        await advanceStage("sure2")
      } else {
        await speak("I'll take that as interest! Let me tell you about even MORE features you'll never use!")
        setTimeout(() => setShowVoiceInput(true), 1500)
      }
      return
    }

    if (stage === "sure2") {
      if (isFirm) {
        setSureCount(4)
        dispatch({ type: "ADD_SCORE", levelId: 4, category: "persistence", amount: 20 })
        dispatch({ type: "ADD_SCORE", levelId: 4, category: "empathy", amount: 10 })
        await advanceStage("sure3")
      } else {
        await speak("You hesitated AGAIN! That means I can offer you MORE things you don't want! How about a free trial of our premium trial premium?")
        setTimeout(() => setShowVoiceInput(true), 1500)
      }
      return
    }

    if (stage === "sure3") {
      if (isFirm) {
        await advanceStage("escaped")
      } else {
        dispatch({ type: "ADD_SCORE", levelId: 4, category: "negotiation", amount: -20 })
        await speak("HA! Knew you'd crack! You're not ready to leave! Let me reset the process... ARE YOU SURE YOU WANT TO CANCEL? Starting from the beginning!")
        setStage("intro")
        setSureCount(0)
        setTimeout(() => setShowVoiceInput(true), 2000)
      }
      return
    }
  }, [stage, sureCount, dispatch, speak, advanceStage])

  const stageOrder: Stage[] = ["intro", "sure1", "offer", "sure2", "sure3", "escaped"]
  const progress = (stageOrder.indexOf(stage) / (stageOrder.length - 1)) * 100

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-purple-900/30 via-zinc-900 to-black p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "SET_PHASE", phase: "title" })} className="text-zinc-400">← Exit</Button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-zinc-500 mb-1">
            <span>Level 4</span>
            <span>"Sure?" count: {sureCount}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-32">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold text-white">{level.title}</h2>
          <p className="text-sm text-zinc-400">{level.subtitle}</p>
        </div>

        <NPCDialogue npcName={level.npc} message={npcMessage} isTyping={isTyping} emotion={sureCount >= 3 ? "annoyed" : "cheerful"} />

        {stage !== "escaped" && (
          <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
            <p className="text-sm font-bold text-yellow-400 mb-1">💡 Objective:</p>
            <p className="text-sm text-yellow-300">{STAGE_DATA[stage].guidance}</p>
          </Card>
        )}

        {offersRejected > 0 && (
          <div className="text-center text-sm text-zinc-400">
            💰 Offers rejected: {offersRejected}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
        {showVoiceInput && stage !== "escaped" ? (
          <VoiceInput onTranscript={handleTranscript} />
        ) : stage === "escaped" ? (
          <div className="text-center text-green-400 font-bold text-lg">SUBSCRIPTION CANCELLED! 🎉</div>
        ) : (
          <div className="text-center text-zinc-400 text-sm">{isTyping ? "Manager Dragon is guilt-tripping..." : ""}</div>
        )}
      </div>
    </div>
  )
}
