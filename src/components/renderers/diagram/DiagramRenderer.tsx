import { useState, useCallback, useEffect, useRef } from 'react'
import type { DiagramConfig } from './types'
import { toExcalidrawSkeletons, getVisibleIndices } from './convertToExcalidraw'

function ExcalidrawCanvas({
  skeletons,
  onReady,
}: {
  skeletons: any[]
  onReady?: (api: any) => void
}) {
  const [Comp, setComp] = useState<{
    Excalidraw: any
    convertToExcalidrawElements: any
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    import('@excalidraw/excalidraw').then((mod) => {
      if (!cancelled) {
        setComp({
          Excalidraw: mod.Excalidraw,
          convertToExcalidrawElements: mod.convertToExcalidrawElements,
        })
      }
    })
    return () => { cancelled = true }
  }, [])

  if (!Comp) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Loading diagram...
      </div>
    )
  }

  const { Excalidraw, convertToExcalidrawElements } = Comp
  const elements = convertToExcalidrawElements(skeletons)

  return (
    <Excalidraw
      initialData={{
        elements,
        appState: {
          viewBackgroundColor: 'transparent',
          theme: 'dark',
          viewModeEnabled: true,
          zenModeEnabled: true,
          gridModeEnabled: false,
        },
      }}
      viewModeEnabled={true}
      zenModeEnabled={true}
      UIOptions={{
        canvasActions: {
          export: false,
          saveAsImage: false,
          loadScene: false,
        },
        tools: { image: false },
      }}
      excalidrawAPI={(api: any) => onReady?.(api)}
    />
  )
}

export function DiagramRenderer({ config }: { config: DiagramConfig }) {
  const [mounted, setMounted] = useState(false)
  const hasReveal = config.revealOrder && config.revealOrder.length > 0
  const totalSteps = hasReveal ? config.revealOrder!.length : config.elements.length
  const [step, setStep] = useState(totalSteps)
  const apiRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const visibleIndices = getVisibleIndices(config, step)
  const visibleElements = config.elements.filter((_, i) => visibleIndices.has(i))
  const skeletons = toExcalidrawSkeletons(visibleElements)

  const handleReady = useCallback((api: any) => {
    apiRef.current = api
    setTimeout(() => api.scrollToContent(undefined, { fitToContent: true }), 100)
  }, [])

  // Zoom to fit when step changes
  useEffect(() => {
    if (apiRef.current) {
      setTimeout(() => {
        apiRef.current.scrollToContent(undefined, { fitToContent: true })
      }, 50)
    }
  }, [step])

  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded-2xl relative"
        style={{
          aspectRatio: '16 / 9',
          minHeight: 300,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {mounted ? (
          <div className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
            <ExcalidrawCanvas
              key={step}
              skeletons={skeletons}
              onReady={handleReady}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Loading diagram...
          </div>
        )}
      </div>

      {hasReveal && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step <= 1}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← prev
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < step ? 'bg-blue-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
            disabled={step >= totalSteps}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            next →
          </button>
        </div>
      )}
    </div>
  )
}
