"use client"

import { X } from "lucide-react"
import { useEffect } from "react"

type UndoBannerProps = {
  message: string
  onUndo: () => void
  onDismiss: () => void
  durationMs?: number
}

export function UndoBanner({
  message,
  onUndo,
  onDismiss,
  durationMs = 6000,
}: UndoBannerProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, durationMs)

    return () => window.clearTimeout(timeout)
  }, [durationMs, onDismiss])

  return (
    <div className="fixed inset-x-[14px] bottom-20 z-30 rounded-[10px] border border-border bg-card px-3 py-3 text-text-dark md:left-auto md:right-8 md:w-96">
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-[13px] font-normal">{message}</p>
        <button
          type="button"
          onClick={onUndo}
          className="rounded-[10px] bg-green-dark px-3 py-2 text-[12px] font-semibold text-cream"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-[10px] p-2 text-text-mid hover:bg-idle-bg"
          aria-label="Dismiss undo message"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}
