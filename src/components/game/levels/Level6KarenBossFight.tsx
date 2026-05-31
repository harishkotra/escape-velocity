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

type BossPhase = "intro" | "complaint" | "interrupt" | "escalation" | "calm" | "rage" | "victory"

const BOSS_LINES: Record<BossPhase, string> = {
  intro: "YOU! FINALLY! I'VE BEEN WAITING! I am KAREN QUEEN! Your company is a DISASTER! I have 47 complaints and I'm going to tell you ALL of them! STARTING WITH... The lobby music was TOO LOUD! Then it was TOO QUIET! MAKE UP YOUR MIND! What do you have to say for yourself?!",
  complaint: "AND ANOTHER THING! Your app changed colors! I liked the old blue! The new blue is TERRIBLE! It's a different shade! I DEMAND the old blue back! And a refund! And an apology! And your manager's manager's manager!",
  interrupt: "I'M NOT FINISHED! Do you know who I AM? I'm a PLATINUM customer! I've been calling for 3 SECONDS! This is UNACCEPTABLE! I'm going to write a YELP review, a TWEETSTORM, and a LINKEDIN POST! Your company will be DESTROYED!",
  escalation: "I WANT TO SPEAK TO YOUR MANAGER! Actually, wait — I AM the manager! But I also want to speak to your manager's manager! And the CEO! And the CEO's therapist! Because this company is making me CRAZY!",
  calm: "... ... ... You know what? That was... actually... reasonable. I'm not used to reasonable. I don't know how to handle this. Is this... empathy? I feel... calm? WHAT IS THIS SORCERY?!",
  rage: "THAT'S YOUR ANSWER?! THAT'S the BEST you can do?! I'VE NEVER BEEN SO INSULTED! I want everything for FREE! I want a PERSONAL APOLOGY! I want... wait, what did you say again? I wasn't listening.",
  victory: "Fine! You win! I'll... I'll be nice. Maybe. Today. You've defeated me with kindness and patience. ESCAPE UNLOCKED! 🎉",
}

const DEESCALATION_WORDS = ["understand", "sorry", "apologize", "help", "resolve", "listen", "fix", "solution", "empathy", "hear", "patient", "calm"]

const RAGE_LINES = [
  "I can't BELIEVE this! Your service is a JOKE!",
  "I'm going to TELL EVERYONE I KNOW about this!",
  "My lawyer will be in touch! I have a lawyer! He's VERY expensive!",
  "I want compensation! I want your firstborn! I want EVERYTHING!",
  "This is the WORST day of my life! And I've had some BAD days!",
]

export function Level6KarenBossFight() {
  const { dispatch } = useGame()
  const level = LEVELS[5]
  const [phase, setPhase] = useState<BossPhase>("intro")
  const [npcMessage, setNpcMessage] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [deescalationScore, setDeescalationScore] = useState(0)
  const [interruptions, setInterruptions] = useState(0)
  const [turnCount, setTurnCount] = useState(0)
  const [victory, setVictory] = useState(false)

  const speak = useCallback(async (msg: string) => {
    setIsTyping(true)
    setNpcMessage(msg)
    const duration = Math.max(msg.length * 25, 600)
    await new Promise((r) => setTimeout(r, duration))
    setIsTyping(false)
  }, [])

  useEffect(() => {
    dispatch({ type: "SET_LEVEL", levelId: 6 })
    speak(BOSS_LINES.intro)
    setTimeout(() => setShowVoiceInput(true), 4000)
  }, [dispatch, speak])

  const isConfused = (text: string): boolean => {
    const t = text.toLowerCase()
    return ["i don't know", "idk", "what", "help", "confused", "stuck", "not sure", "don't understand", "what do i do", "how", "unsure", "no idea", "?"].some((p) => t.includes(p))
  }

  const countDeescalation = (text: string): number => {
    const t = text.toLowerCase()
    return DEESCALATION_WORDS.filter((w) => t.includes(w)).length
  }

  const handleTranscript = useCallback(async (text: string) => {
    setShowVoiceInput(false)
    setTurnCount((p) => p + 1)
    const t = text.toLowerCase()
    const deCount = countDeescalation(t)

    if (isConfused(t)) {
      await speak("CONFUSED?! I'LL GIVE YOU SOMETHING TO BE CONFUSED ABOUT! Actually, just try being nice to me. Say you understand or apologize. That might work.")
      setTimeout(() => setShowVoiceInput(true), 2000)
      return
    }

    if (t.includes("manager") || t.includes("complaint") || t.includes("rude") || t.includes("unprofessional")) {
      dispatch({ type: "ADD_SCORE", levelId: 6, category: "empathy", amount: -10 })
    }

    if (deCount > 0) {
      setDeescalationScore((p) => p + deCount * 10)
      dispatch({ type: "ADD_SCORE", levelId: 6, category: "empathy", amount: 15 })
      dispatch({ type: "ADD_SCORE", levelId: 6, category: "negotiation", amount: 10 })
    } else {
      dispatch({ type: "ADD_SCORE", levelId: 6, category: "persistence", amount: 5 })
    }

    const willInterrupt = Math.random() > 0.5 && interruptions < 4 && turnCount < 8

    if (phase === "intro" || phase === "complaint") {
      if (willInterrupt) {
        setInterruptions((p) => p + 1)
        setPhase("interrupt")
        await speak(BOSS_LINES.interrupt + " " + RAGE_LINES[Math.floor(Math.random() * RAGE_LINES.length)])
        setTimeout(() => {
          setPhase("complaint")
          speak(BOSS_LINES.complaint)
          setTimeout(() => setShowVoiceInput(true), 2500)
        }, 2500)
        return
      }
      setPhase("escalation")
      await speak(BOSS_LINES.escalation)
      setTimeout(() => setShowVoiceInput(true), 2000)
      return
    }

    if (phase === "interrupt") {
      setPhase("complaint")
      await speak(BOSS_LINES.complaint + " What do you have to say to THAT?!")
      setTimeout(() => setShowVoiceInput(true), 2000)
      return
    }

    if (phase === "escalation") {
      if (deCount >= 2 || deescalationScore > 20) {
        setPhase("calm")
        dispatch({ type: "ADD_SCORE", levelId: 6, category: "problemSolving", amount: 20 })
        await speak(BOSS_LINES.calm)
        setTimeout(() => {
          setPhase("victory")
          speak(BOSS_LINES.victory)
          setVictory(true)
          dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "karen-slayer" })
          setTimeout(() => {
            dispatch({ type: "ADD_SCORE", levelId: 6, category: "escapeSpeed", amount: 40 })
            dispatch({ type: "SET_PHASE", phase: "levelComplete" })
          }, 2500)
        }, 2500)
      } else {
        setPhase("rage")
        await speak(BOSS_LINES.rage)
        setTimeout(() => setShowVoiceInput(true), 2000)
      }
      return
    }

    if (phase === "rage") {
      const goodResponse = deCount > 0 || deescalationScore > 15
      if (goodResponse || turnCount >= 8) {
        setPhase("calm")
        await speak(BOSS_LINES.calm)
        setTimeout(() => {
          setPhase("victory")
          speak(BOSS_LINES.victory)
          setVictory(true)
          dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "karen-slayer" })
          setTimeout(() => {
            dispatch({ type: "ADD_SCORE", levelId: 6, category: "escapeSpeed", amount: 30 })
            dispatch({ type: "SET_PHASE", phase: "levelComplete" })
          }, 2500)
        }, 2500)
      } else {
        await speak(RAGE_LINES[Math.floor(Math.random() * RAGE_LINES.length)] + " Try again! And this time, actually LISTEN to me!")
        setTimeout(() => setShowVoiceInput(true), 2000)
      }
      return
    }
  }, [phase, deescalationScore, interruptions, turnCount, dispatch, speak])

  const progress = Math.min((turnCount / 8) * 100, 100)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-pink-900/40 via-zinc-900 to-black p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "SET_PHASE", phase: "title" })} className="text-zinc-400">← Exit</Button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-zinc-500 mb-1">
            <span>Level 6 — FINAL BOSS</span>
            <span>Empathy: {deescalationScore}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-32">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold text-white">👑 {level.title}</h2>
          <p className="text-sm text-zinc-400">{level.subtitle}</p>
        </div>

        <div className="flex justify-center gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400">
            Interruptions: {interruptions}
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
            Empathy: {deescalationScore}
          </span>
        </div>

        <NPCDialogue npcName={level.npc} message={npcMessage} isTyping={isTyping} emotion={phase === "intro" || phase === "rage" ? "angry" : "annoyed"} />

        {phase === "victory" && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full text-lg">
              👑 KAREN DEFEATED! 👑
            </span>
          </motion.div>
        )}

        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <p className="text-sm font-bold text-blue-400 mb-1">💡 Strategy:</p>
          <p className="text-sm text-blue-300">Use empathy words like "understand", "sorry", "help", "resolve" to de-escalate the situation. Stay calm. Don't fight back.</p>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
        {showVoiceInput && !victory ? (
          <VoiceInput onTranscript={handleTranscript} placeholder="Try saying 'I understand your frustration...'" />
        ) : victory ? (
          <div className="text-center text-green-400 font-bold text-lg">KAREN QUEEN DEFEATED! 🎉</div>
        ) : (
          <div className="text-center text-zinc-400 text-sm">{isTyping ? "Karen Queen is yelling..." : ""}</div>
        )}
      </div>
    </div>
  )
}
