"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card
        className="w-full max-w-md bg-[var(--color-surface)] border-[var(--color-text-secondary)]/30 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <CardTitle className="font-mono text-lg text-[var(--color-text)]">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-mono text-sm text-[var(--color-text-secondary)] leading-relaxed">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="font-mono bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-text-secondary)]/30"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="font-mono bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
