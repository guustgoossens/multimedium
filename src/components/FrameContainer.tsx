import { useEffect, useRef } from 'react'
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
}: {
  explanations: Explanation[]
  isLoading: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest frame
  useEffect(() => {
    if (explanations.length > 0) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [explanations.length])

  const sorted = [...explanations].sort((a, b) => {
    if (a.step != null && b.step != null) return a.step - b.step
    return a.createdAt - b.createdAt
  })

  return (
    <div ref={containerRef} className="frame-container">
      {/* Welcome frame */}
      {sorted.length === 0 && !isLoading && (
        <div className="frame">
          <div className="frame-content text-center space-y-6">
            <div className="text-6xl mb-2">&#9672;</div>
            <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Multimedium
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Ask a question and watch it come to life. No text walls — just visuals and voice.
            </p>
          </div>
        </div>
      )}

      {/* Loading frame */}
      {isLoading && sorted.length === 0 && (
        <div className="frame">
          <div className="frame-content text-center space-y-6">
            <div className="loading-breathe">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-purple-500/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-purple-500/20" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Thinking visually...</p>
          </div>
        </div>
      )}

      {/* Explanation frames */}
      {sorted.map((explanation, i) => (
        <div key={explanation._id} className="frame" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="frame-content space-y-6">
            {/* Step indicator */}
            {sorted.length > 1 && (
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {sorted.map((_, j) => (
                    <div
                      key={j}
                      className={`h-1.5 rounded-full transition-all ${
                        j === i ? 'w-6 bg-purple-400' : 'w-1.5 bg-white/15'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-xs">
                  {i + 1} / {sorted.length}
                </span>
              </div>
            )}

            {/* Visual content */}
            <SkillRouter explanation={explanation} />

            {/* Narration subtitle */}
            {explanation.narration && (
              <div className="glass-card px-6 py-4 mt-4">
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  {explanation.narration}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading indicator when adding more frames */}
      {isLoading && sorted.length > 0 && (
        <div className="frame">
          <div className="frame-content text-center">
            <div className="loading-breathe text-gray-500 text-sm">Generating next visual...</div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
