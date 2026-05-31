"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useVoice } from "@/lib/voice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export function VoiceInput({ onTranscript, disabled, placeholder = "Type your response..." }: VoiceInputProps) {
  const { isRecording, isProcessing, startRecording, stopRecording, hasSupport } = useVoice()
  const [textValue, setTextValue] = useState("")
  const [showTextInput, setShowTextInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showTextInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showTextInput])

  const handleToggleRecording = async () => {
    if (isRecording) {
      const text = await stopRecording()
      if (text.trim()) {
        onTranscript(text)
      }
    } else {
      await startRecording()
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (textValue.trim()) {
      onTranscript(textValue.trim())
      setTextValue("")
      setShowTextInput(false)
    }
  }

  if (!hasSupport) {
    return (
      <form onSubmit={handleTextSubmit} className="flex w-full gap-2">
        <Input
          ref={inputRef}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-base"
        />
        <Button
          type="submit"
          disabled={disabled || !textValue.trim()}
          className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl text-sm"
        >
          Send
        </Button>
      </form>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {showTextInput ? (
        <form onSubmit={handleTextSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-base"
          />
          <Button
            type="submit"
            disabled={disabled || !textValue.trim()}
            className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl text-sm"
          >
            Send
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowTextInput(false)}
            className="h-12 w-12 p-0 text-zinc-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </Button>
        </form>
      ) : (
        <div className="flex items-center gap-4">
          <motion.button
            onClick={handleToggleRecording}
            disabled={disabled || isProcessing}
            whileTap={{ scale: 0.9 }}
            className={`
              relative w-20 h-20 rounded-full flex items-center justify-center
              transition-all duration-300 shrink-0
              ${isRecording
                ? "bg-red-500 shadow-lg shadow-red-500/50"
                : "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30"
              }
              ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
              />
            ) : isRecording ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-6 h-8 bg-white rounded-sm"
              />
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </motion.button>
          <Button
            variant="outline"
            onClick={() => setShowTextInput(true)}
            className="h-12 px-4 border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-sm"
          >
            ⌨️ Type instead
          </Button>
        </div>
      )}
      <span className="text-xs font-medium text-zinc-500">
        {isProcessing ? "Processing..." : isRecording ? "Tap to stop" : showTextInput ? "Type your response" : "Tap mic or type"}
      </span>
    </div>
  )
}
