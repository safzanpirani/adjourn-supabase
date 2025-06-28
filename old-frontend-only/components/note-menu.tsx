"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Copy, Trash2, Share, Download } from "lucide-react"

interface NoteMenuProps {
  onCopy: () => void
  onDelete: () => void
  onShare?: () => void
  onExport?: () => void
}

export function NoteMenu({ onCopy, onDelete, onShare, onExport }: NoteMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onCopy} className="font-mono text-sm">
          <Copy className="w-4 h-4 mr-2" />
          Copy Note
        </DropdownMenuItem>

        {onShare && (
          <DropdownMenuItem onClick={onShare} className="font-mono text-sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </DropdownMenuItem>
        )}

        {onExport && (
          <DropdownMenuItem onClick={onExport} className="font-mono text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onDelete}
          className="font-mono text-sm text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
