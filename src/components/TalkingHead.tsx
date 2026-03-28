import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface TalkingHeadHandle {
  speak: (text: string) => void
}

const AVATAR_URL =
  'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@main/avatars/mpfb.glb'

const TalkingHeadComponent = forwardRef<TalkingHeadHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    speak(text: string) {
      headRef.current?.speakText(text, { avatarMute: true })
    },
  }))

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    let cancelled = false

    ;(async () => {
      try {
        const { TalkingHead } = await import('@met4citizen/talkinghead')
        if (cancelled) return

        const head = new TalkingHead(container, {
          cameraView: 'head',
          cameraRotateEnable: false,
          avatarMute: true,
          lipsyncModules: ['en'],
          lipsyncLang: 'en',
        })

        await head.showAvatar(
          { url: AVATAR_URL, lipsyncLang: 'en', avatarMute: true },
          (e: { lengthComputable: boolean; loaded: number; total: number }) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              const el = container.querySelector<HTMLElement>('[data-loading]')
              if (el) el.textContent = `Loading... ${pct}%`
            }
          },
        )

        if (cancelled) return

        // Apply wireframe material — white grid on black bg like the reference image
        const THREE = await import('three')
        head.armature.traverse((child: any) => {
          if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              wireframe: true,
            })
          }
        })
        head.renderer.setClearColor(0x000000, 1)

        // Hide loading overlay
        const overlay = container.querySelector<HTMLElement>('[data-loading]')
        if (overlay) overlay.style.display = 'none'

        headRef.current = head
      } catch (err) {
        console.error('[TalkingHead] init failed:', err)
        const el = container.querySelector<HTMLElement>('[data-loading]')
        if (el) el.textContent = 'Failed to load avatar'
      }
    })()

    return () => {
      cancelled = true
      headRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black"
      style={{ minHeight: '300px' }}
    >
      {/* Loading overlay — hidden after avatar loads */}
      <div
        data-loading
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white/40"
      >
        Loading...
      </div>
    </div>
  )
})

TalkingHeadComponent.displayName = 'TalkingHead'

export default TalkingHeadComponent
