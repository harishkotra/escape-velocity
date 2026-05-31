"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LEVELS, type LevelId } from "@/lib/types"

interface ShareCardProps {
  levelId: LevelId
  score: number
}

const shareTexts: Record<LevelId, string> = {
  1: "I survived The Refund Maze!",
  2: "I escaped IVR Hell!",
  3: "I conquered Transfer Dungeon!",
  4: "I broke out of Subscription Prison!",
  5: "I beat the Chatbot Labyrinth!",
  6: "I defeated Karen Queen!",
}

export function ShareCard({ levelId, score }: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const level = LEVELS.find((l) => l.id === levelId)

  const text = `${shareTexts[levelId]} 🎮\nScore: ${score} pts\nCan you survive being a customer?\n#CustomerEscapeRoom #CustomerService`

  const shareUrl = typeof window !== "undefined" ? window.location.origin : ""

  const handleShare = async (platform: string) => {
    const urls: Record<string, string> = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`,
    }

    if (platform === "copy") {
      await navigator.clipboard.writeText(text + " " + shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }

    const url = urls[platform]
    if (url) window.open(url, "_blank", "width=600,height=400")
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-zinc-500 text-center">
        Share your escape
      </p>
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("x")}
          className="text-xs"
        >
          𝕏
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("linkedin")}
          className="text-xs"
        >
          in
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className="text-xs"
        >
          WA
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("copy")}
          className="text-xs"
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  )
}
