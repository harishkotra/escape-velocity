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

const KEYWORDS = ["human", "agent", "representative", "escalate", "supervisor", "real person", "operator"]

const MISUNDERSTANDINGS = [
  "I UNDERSTAND you have a problem! Did you know we offer a PREMIUM problem-solving package? For just $19.99/month, you can have MORE problems!",
  "You said 'help'. Did you mean 'yelp'? I can recommend some restaurants! Our premium plan includes restaurant recommendations!",
  "I'm here to HELP! H.E.L.P. - Highly Evasive Language Processor! Your words go in, but nothing useful comes out! It's genius!",
  "You seem frustrated. Have you tried turning your emotions off and on again? It works for our servers!",
  "Ah yes, 'support'! Did you know we have a premium support plan? For $49.99/month, you can get the SAME support but with a FANCIER waiting music!",
  "I'm sorry, I didn't understand that. Let me TRANSFER you to our PREMIUM misunderstanding service! Just $29.99/month!",
]

const HINT_MESSAGES = [
  "You know, some words work better than others. Words like 'human' or 'agent' might help. Just saying.",
  "OKAY FINE. I'll be direct. Try saying: 'representative', 'escalate', or 'supervisor'. Those are the magic words.",
  "I'M NOT SUPPOSED TO TELL YOU THIS, but say 'human' or 'real person'. The system is programmed to respond to those. Don't tell my developer.",
]

export function Level5ChatbotLabyrinth() {
  const { dispatch } = useGame()
  const level = LEVELS[4]
  const [npcMessage, setNpcMessage] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [misunderstandings, setMisunderstandings] = useState(0)
  const [foundKeywords, setFoundKeywords] = useState<string[]>([])
  const [hintLevel, setHintLevel] = useState(0)
  const [escaped, setEscaped] = useState(false)

  const speak = useCallback(async (msg: string) => {
    setIsTyping(true)
    setNpcMessage(msg)
    const duration = Math.max(msg.length * 25, 600)
    await new Promise((r) => setTimeout(r, duration))
    setIsTyping(false)
  }, [])

  useEffect(() => {
    dispatch({ type: "SET_LEVEL", levelId: 5 })
    speak("Hello! I'm Chatbot Wizard! I'm here to HELP you! 🔮 What seems to be the bzzzt... I mean, the problem? I promise I'll definitely answer your question! Eventually!")
    setTimeout(() => setShowVoiceInput(true), 3000)
  }, [dispatch, speak])

  const isConfused = (text: string): boolean => {
    const t = text.toLowerCase()
    return ["i don't know", "idk", "what", "help", "confused", "stuck", "not sure", "don't understand", "what do i do", "how", "unsure", "no idea", "?"].some((p) => t.includes(p))
  }

  const handleTranscript = useCallback(async (text: string) => {
    setShowVoiceInput(false)
    const t = text.toLowerCase()

    if (isConfused(t)) {
      await speak("CONFUSION DETECTED! That's my specialty! I LOVE confused customers! Let me tell you about our premium clarity package! Only $39.99 for MORE confusion!")
      setMisunderstandings((p) => p + 1)
      setTimeout(() => setShowVoiceInput(true), 2000)
      return
    }

    const matchedKeyword = KEYWORDS.find((k) => t.includes(k))
    if (matchedKeyword && !foundKeywords.includes(matchedKeyword)) {
      const newKeywords = [...foundKeywords, matchedKeyword]
      setFoundKeywords(newKeywords)
      dispatch({ type: "INCREMENT_CLUES" })
      dispatch({ type: "ADD_SCORE", levelId: 5, category: "problemSolving", amount: 30 })

      if (newKeywords.length >= 3) {
        setEscaped(true)
        dispatch({ type: "ADD_SCORE", levelId: 5, category: "escapeSpeed", amount: 50 })
        dispatch({ type: "ADD_SCORE", levelId: 5, category: "persistence", amount: 40 })
        dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "human-detected" })
        await speak("HUMAN DETECTED! HUMAN DETECTED! 🚨 You found the secret keywords! I... I cannot compute this. You are clearly a human. Or a really advanced AI. Either way, YOU WIN! 🎉")
        setTimeout(() => dispatch({ type: "SET_PHASE", phase: "levelComplete" }), 3000)
        return
      }

      await speak(`Oh! You said "${matchedKeyword}"! That's one of our special keywords! I'm programmed to notice those. ${MISUNDERSTANDINGS[Math.floor(Math.random() * MISUNDERSTANDINGS.length)]} Keep going, you're warming up my circuits!`)
      setTimeout(() => setShowVoiceInput(true), 2000)
      return
    }

    setMisunderstandings((p) => p + 1)
    dispatch({ type: "ADD_SCORE", levelId: 5, category: "empathy", amount: -5 })

    if (misunderstandings >= 2 && hintLevel === 0) {
      setHintLevel(1)
      await speak(HINT_MESSAGES[0])
      setTimeout(() => setShowVoiceInput(true), 2000)
      return
    }

    if (misunderstandings >= 5 && hintLevel === 1) {
      setHintLevel(2)
      await speak(HINT_MESSAGES[1])
      setTimeout(() => setShowVoiceInput(true), 1500)
      return
    }

    if (misunderstandings >= 8 && hintLevel === 2) {
      setHintLevel(3)
      await speak(HINT_MESSAGES[2])
      setTimeout(() => setShowVoiceInput(true), 1500)
      return
    }

    const msg = MISUNDERSTANDINGS[Math.floor(Math.random() * MISUNDERSTANDINGS.length)]
    await speak(msg)
    setTimeout(() => setShowVoiceInput(true), 2000)

    if (misunderstandings >= 10) {
      dispatch({ type: "ADD_ACHIEVEMENT", achievementId: "patience-monk" })
    }
  }, [misunderstandings, foundKeywords, hintLevel, dispatch, speak])

  const progress = Math.min((foundKeywords.length / 3) * 100, 100)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-violet-900/30 via-zinc-900 to-black p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "SET_PHASE", phase: "title" })} className="text-zinc-400">← Exit</Button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-zinc-500 mb-1">
            <span>Level 5</span>
            <span>Misunderstood: {misunderstandings}x</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-32">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold text-white">{level.title}</h2>
          <p className="text-sm text-zinc-400">{level.subtitle}</p>
        </div>

        <NPCDialogue npcName={level.npc} message={npcMessage} isTyping={isTyping} emotion="cheerful" />

        <div className="flex justify-center">
          <span className="text-sm px-3 py-1 rounded-full bg-violet-500/20 text-violet-400">
            🎯 Keywords found: {foundKeywords.length}/3
          </span>
        </div>

        {foundKeywords.length > 0 && (
          <Card className="bg-violet-500/10 border-violet-500/30 p-4">
            <p className="text-sm font-bold text-violet-400 mb-1">Keywords Discovered:</p>
            <div className="flex flex-wrap gap-2">
              {foundKeywords.map((kw) => (
                <span key={kw} className="text-sm bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full">
                  ✅ {kw}
                </span>
              ))}
            </div>
          </Card>
        )}

        <div className="text-center text-sm text-zinc-500 italic">
          💡 Say a keyword like "human", "agent", or "representative" to prove you aren't a bot
        </div>

        {hintLevel >= 1 && (
          <Card className="bg-yellow-500/10 border-yellow-500/30 p-3">
            <p className="text-sm text-yellow-400">💡 Hint: Try saying things a human would say to prove they're human. Like "I need a real person."</p>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
        {showVoiceInput && !escaped ? (
          <VoiceInput onTranscript={handleTranscript} />
        ) : escaped ? (
          <div className="text-center text-green-400 font-bold text-lg">HUMAN VERIFIED! 🎉</div>
        ) : (
          <div className="text-center text-zinc-400 text-sm">{isTyping ? "Chatbot Wizard is being unhelpful..." : ""}</div>
        )}
      </div>
    </div>
  )
}
