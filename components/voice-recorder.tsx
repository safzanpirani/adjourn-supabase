"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export function VoiceRecorder({ 
  onTranscription, 
  className = "", 
  size = "md",
  disabled = false 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    if (disabled) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || "audio/wav"
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      alert('Failed to start recording. Please check microphone permissions.')
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
      const formData = new FormData()
      const extension = audioBlob.type.includes('webm') ? 'webm' : 'wav'
      formData.append("file", audioBlob, `audio.${extension}`)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.text) {
        onTranscription(data.text)
      } else {
        alert(`Transcription failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      alert('Network error during transcription')
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
