"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export function VoiceRecorder({ onTranscription, className = "", size = "md" }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64 for API call
      const formData = new FormData()
      formData.append("file", audioBlob, "audio.wav")
      formData.append("model", "whisper-large-v3")

      // Simulate Groq Whisper API call
      // In a real app, you'd call: https://api.groq.com/openai/v1/audio/transcriptions
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock transcription result
      const mockTranscription =
        "This is a sample transcription of what you just said. The voice recognition is working!"

      onTranscription(mockTranscription)
    } catch (error) {
      console.error("Error transcribing audio:", error)
      onTranscription("Sorry, I couldn't transcribe that. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8"
      case "lg":
        return "h-12 w-12"
      default:
        return "h-10 w-10"
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-3 h-3"
      case "lg":
        return "w-6 h-6"
      default:
        return "w-4 h-4"
    }
  }

  if (isProcessing) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className={`${getButtonSize()} ${className} text-[var(--color-primary)] animate-pulse`}
      >
        <div
          className={`${getIconSize()} border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin`}
        />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      className={`${getButtonSize()} ${className} ${
        isRecording
          ? "text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
          : "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
      }`}
    >
      {isRecording ? <Square className={getIconSize()} /> : <Mic className={getIconSize()} />}
    </Button>
  )
}
