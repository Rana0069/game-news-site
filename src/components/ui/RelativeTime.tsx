'use client'

import { useState, useEffect } from 'react'
import { formatRelativeTime } from '@/lib/utils'

/**
 * Renders a relative time string (e.g. "2h ago") only on the client side,
 * avoiding server/client hydration mismatches caused by Date.now() differences.
 */
export default function RelativeTime({ date }: { date: Date | string | null | undefined }) {
  const [text, setText] = useState<string>('')

  useEffect(() => {
    if (!date) return
    setText(formatRelativeTime(date))

    // Update every minute
    const interval = setInterval(() => {
      setText(formatRelativeTime(date!))
    }, 60_000)

    return () => clearInterval(interval)
  }, [date])

  if (!date || !text) return null
  return <span suppressHydrationWarning>{text}</span>
}
