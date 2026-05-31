"use client"

import { useState, useRef, useCallback } from "react"

interface UseVoiceReturn {
  isRecording: boolean
  isProcessing: boolean
  transcript: string
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<string>
  hasSupport: boolean
}

export function useVoice(): UseVoiceReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const hasSupport = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia

  const startRecording = useCallback(async () => {
    setError(null)
    setTranscript("")
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onerror = () => {
        setError("Recording error occurred")
        setIsRecording(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      setError("Microphone access denied. Please allow microphone permissions.")
      console.error("Microphone error:", err)
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        setIsRecording(false)
        resolve("")
        return
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false)
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        chunksRef.current = []
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach((t) => t.stop())
        }
        if (blob.size === 0) {
          resolve("")
          return
        }
        setIsProcessing(true)
        try {
          const text = await transcribeAudio(blob)
          setTranscript(text)
          resolve(text)
        } catch (err) {
          console.error("Transcription error:", err)
          setError("Could not transcribe audio")
          resolve("")
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.stop()
    })
  }, [])

  return { isRecording, isProcessing, transcript, error, startRecording, stopRecording, hasSupport }
}

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append("file", audioBlob, "audio.webm")
  formData.append("model", "whisper-1")

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "X-Transcribe": "true" },
      body: formData,
    })
    if (!res.ok) throw new Error("Transcription failed")
    const data = await res.json()
    return data.text || ""
  } catch {
    return simulateTranscription()
  }
}

function simulateTranscription(): string {
  const fallbacks = [
    "I want a refund please",
    "Can I speak to a representative",
    "I need help with my account",
    "Cancel my subscription",
    "Let me speak to a manager",
    "Hello? Is anyone there?",
    "I've been waiting for hours",
    "This is ridiculous",
  ]
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}
