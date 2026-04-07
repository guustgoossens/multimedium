import { useEffect, useState, useCallback, useRef } from 'react'
import { SkillRouter } from './SkillRouter'

type Explanation = {
  _id: string
  skill: string
  config: string
  narration?: string
  step?: number
  createdAt: number
}

export function FrameContainer({
  explanations,
  isLoading,
  onAction,
}: {
  explanations: Explanation[]
  isLoading: boolean
  onAction?: (prompt: string) => void
}) {
  // Filter out _done markers, but track if generation is complete
  const isDone = explanations.some((e) => e.skill === '_done')
  const visuals = explanations.filter((e) => e.skill !== '_done' && e.skill !== 'intro')

  const sorted = [...visuals].sort((a, b) => {
    if (a.step != null && b.step != null) return a.step - b.step
    return a.createdAt - b.createdAt
  })

  const hasExplanations = sorted.length > 0
  const frameCount = (hasExplanations ? sorted.length : 1) + (isLoading && !isDone ? 1 : 0)

  const [activeIndex, setActiveIndex] = useState(0)
  const prevCountRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const wasLoadingRef = useRef(false)
  const generationStartCountRef = useRef(0)

  useEffect(() => {
    const prevCount = prevCountRef.current
    prevCountRef.current = sorted.length

    // Loading just started — remember where we were
    if (isLoading && !wasLoadingRef.current) {
      generationStartCountRef.current = prevCount
    }
    wasLoadingRef.current = isLoading

    // New frame arrived during this generation — jump to it
    if (sorted.length > prevCount && sorted.length > generationStartCountRef.current) {
      setActiveIndex(sorted.length - 1)
    }

    // Loading with no frames yet — show loading indicator
    if (isLoading && sorted.length === 0 && !isDone) {
      setActiveIndex(0)
    }
  }, [sorted.length, isLoading, isDone])

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(i + 1, frameCount - 1))
  }, [frameCount])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(i - 1, 0))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  // Wheel navigation — only switch frames on a deliberate overscroll gesture.
  useEffect(() => {
    let accumulated = 0
    let lastDir = 0
    let lastWheelAt = 0
    let lastInFrameScrollAt = 0
    let switchCooldownUntil = 0
    const THRESHOLD = 180
    const IDLE_RESET_MS = 250
    const POST_INFRAME_QUIET_MS = 300
    const SWITCH_COOLDOWN_MS = 400

    const handleWheel = (e: WheelEvent) => {
      // Ignore pinch-zoom and ⌘/ctrl-scroll zoom gestures.
      if (e.ctrlKey || e.metaKey) return

      // Let interactive embeds (manim canvas, code blocks, anything opted out)
      // handle their own wheel/zoom events.
      const target = e.target as Element | null
      if (target?.closest?.('canvas, .manim-scene, pre, [data-no-frame-scroll]')) return

      const container = containerRef.current
      if (!container) return
      const activeFrame = container.querySelector('.frame.active') as HTMLElement | null
      if (!activeFrame) { e.preventDefault(); return }

      const now = performance.now()

      // Reset accumulator on idle or direction flip.
      if (now - lastWheelAt > IDLE_RESET_MS) accumulated = 0
      const dir = Math.sign(e.deltaY)
      if (dir !== 0 && lastDir !== 0 && dir !== lastDir) accumulated = 0
      if (dir !== 0) lastDir = dir
      lastWheelAt = now

      const { scrollTop, scrollHeight, clientHeight } = activeFrame
      const atTop = scrollTop <= 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      const isScrollable = scrollHeight > clientHeight + 1

      // Inside in-frame scroll range — let the browser scroll normally and
      // remember when we last did so, so the inertial tail can't bleed into
      // a frame switch.
      if (isScrollable) {
        if (e.deltaY > 0 && !atBottom) { lastInFrameScrollAt = now; accumulated = 0; return }
        if (e.deltaY < 0 && !atTop) { lastInFrameScrollAt = now; accumulated = 0; return }
      }

      // At a boundary. Suppress for the inertial tail of an in-frame scroll
      // and during the post-switch cooldown.
      if (now - lastInFrameScrollAt < POST_INFRAME_QUIET_MS) { e.preventDefault(); return }
      if (now < switchCooldownUntil) { e.preventDefault(); return }

      e.preventDefault()
      accumulated += e.deltaY
      if (accumulated >= THRESHOLD) {
        accumulated = 0
        switchCooldownUntil = now + SWITCH_COOLDOWN_MS
        goNext()
      } else if (accumulated <= -THRESHOLD) {
        accumulated = 0
        switchCooldownUntil = now + SWITCH_COOLDOWN_MS
        goPrev()
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [goNext, goPrev])

  // Build frames list
  const frames: { key: string; content: React.ReactNode }[] = []

  if (!hasExplanations && !isLoading) {
    frames.push({
      key: 'welcome',
      content: (
        <div className="frame-content text-center space-y-4">
          <h1 className="text-3xl font-mono font-bold text-white tracking-tight">
            multimedium
          </h1>
          <p className="text-gray-500 text-sm font-mono max-w-sm mx-auto">
            ask anything. see it visually.
          </p>
        </div>
      ),
    })
  }

  for (const explanation of sorted) {
    frames.push({
      key: explanation._id,
      content: (
        <div className="frame-content space-y-6">
          <SkillRouter explanation={explanation} onAction={onAction} />
          {explanation.narration && (
            <div className="glass-card px-6 py-4 mt-4">
              <p className="text-gray-300 text-sm leading-relaxed italic">
                {explanation.narration}
              </p>
            </div>
          )}
        </div>
      ),
    })
  }

  if (isLoading) {
    frames.push({
      key: 'loading',
      content: (
        <div className="frame-content text-center space-y-4">
          <div className="loading-breathe">
            <div className="w-12 h-12 mx-auto rounded border border-white/10 flex items-center justify-center">
              <div className="w-4 h-4 rounded-sm bg-white/10" />
            </div>
          </div>
          <p className="text-gray-600 text-xs font-mono">generating...</p>
        </div>
      ),
    })
  }

  return (
    <div ref={containerRef} className="frame-container">
      {frames.map((frame, i) => (
        <div
          key={frame.key}
          className={`frame ${i === activeIndex ? 'active' : ''}`}
        >
          {frame.content}
        </div>
      ))}

      {/* Frame indicator dots */}
      {frames.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          {frames.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all ${
                i === activeIndex
                  ? 'w-5 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
