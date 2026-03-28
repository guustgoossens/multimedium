import { lazy, Suspense } from 'react'

const ExcalidrawWrapper = lazy(async () => {
  const mod = await import('@excalidraw/excalidraw')
  await import('@excalidraw/excalidraw/index.css')
  return {
    default: ({ elements }: { elements: any[] }) => (
      <mod.Excalidraw
        initialData={{
          elements,
          appState: {
            viewBackgroundColor: '#000000',
            theme: 'dark',
            zenModeEnabled: true,
            viewModeEnabled: true,
            gridSize: 0,
          },
          scrollToContent: true,
        }}
        viewModeEnabled
        zenModeEnabled
        theme="dark"
      />
    ),
  }
})

interface DiagramConfig {
  elements: any[]
}

export function DiagramRenderer({ config }: { config: DiagramConfig }) {
  if (!config.elements?.length) {
    return (
      <div className="glass-card p-8 text-center text-gray-600 text-xs font-mono">
        no diagram elements
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden" style={{ height: 500 }}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-mono">
            loading excalidraw...
          </div>
        }
      >
        <ExcalidrawWrapper elements={config.elements} />
      </Suspense>
    </div>
  )
}
