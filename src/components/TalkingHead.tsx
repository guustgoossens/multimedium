import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface AudioTimings {
  words: string[]
  wtimes: number[]
  wdurations: number[]
}

export interface TalkingHeadHandle {
  speak: (text: string) => void
  speakWithAudio: (audioUrl: string, timings: AudioTimings) => void
  stopSpeaking: () => void
  /** Call from a user-gesture handler to unlock AudioContext before reactive playback */
  warmUpAudio: () => void
}

const AVATAR_URL = '/avatars/avatarsdk.glb'

const TalkingHeadComponent = forwardRef<TalkingHeadHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headRef = useRef<any>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Lazily create AudioContext (must happen after user gesture)
  function getAudioContext(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    // Also resume the library's internal AudioContext
    if (headRef.current?.audioCtx?.state === 'suspended') {
      headRef.current.audioCtx.resume()
    }
    return audioCtxRef.current
  }

  useImperativeHandle(ref, () => ({
    speak(_text: string) {
      // No-op: lipsync module can't load in Vite/Vercel, so speakText crashes.
      // Real speech uses speakWithAudio with pre-computed timings instead.
    },
    warmUpAudio() {
      // Must be called during a user gesture to unlock AudioContext
      getAudioContext()
      if (headRef.current?.audioCtx?.state === 'suspended') {
        headRef.current.audioCtx.resume()
      }
    },
    stopSpeaking() {
      headRef.current?.stopSpeaking()
      headRef.current?.setMood('neutral')
    },
    async speakWithAudio(audioUrl: string, timings: AudioTimings) {
      if (!headRef.current) return
      try {
        const audioCtx = getAudioContext()
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

        // Set an expressive mood while speaking
        headRef.current.setMood('happy')

        headRef.current.speakAudio(
          {
            audio: audioBuffer,
            words: timings.words,
            wtimes: timings.wtimes,
            wdurations: timings.wdurations,
            visemes: [], // skip lipsync module (not loaded)
          },
          {},
          undefined,
        )

        // Return to neutral when speech ends
        const durationMs = timings.wtimes.at(-1)! + timings.wdurations.at(-1)!
        setTimeout(() => {
          headRef.current?.setMood('neutral')
        }, durationMs + 500)
      } catch (err) {
        console.error('[TalkingHead] speakWithAudio failed:', err)
      }
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
          lipsyncModules: [],
          lipsyncLang: 'en',
          avatarMood: 'neutral',
          avatarIdleEyeContact: 0.7,
          avatarIdleHeadMove: 0.5,
          avatarSpeakingEyeContact: 0.8,
          avatarSpeakingHeadMove: 0.7,
        })

        await head.showAvatar(
          { url: AVATAR_URL, lipsyncLang: 'en' },
          (e: { lengthComputable: boolean; loaded: number; total: number }) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              const el = container.querySelector<HTMLElement>('[data-loading]')
              if (el) el.textContent = `Loading... ${pct}%`
            }
          },
        )

        if (cancelled) return

        // Two-pass render: solid black occluder hides back geometry,
        // wireframe clone on top shows only front-facing lines.
        const THREE = await import('three')

        const occluderMat = new THREE.MeshBasicMaterial({
          color: 0x000000,
          side: THREE.FrontSide,
          depthWrite: true,
        })

        const wireframeMat = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          wireframe: true,
          shininess: 0,
          depthTest: true,
        })

        // Track original→wireframe pairs so we can sync morph targets each frame
        const morphPairs: Array<{ original: any; clone: any }> = []
        const clones: Array<{ clone: any; parent: any }> = []

        head.armature.traverse((child: any) => {
          if (!child.isMesh) return

          // Original mesh becomes solid black mask
          child.material = occluderMat
          child.renderOrder = 0

          // Clone for wireframe overlay sharing the same skeleton
          const wireClone = child.clone()
          wireClone.material = wireframeMat
          wireClone.renderOrder = 1
          if (child.isSkinnedMesh) {
            wireClone.bind(child.skeleton, child.bindMatrix.clone())
          }
          clones.push({ clone: wireClone, parent: child.parent })

          // If mesh has morph targets, track the pair for per-frame sync
          if (child.morphTargetInfluences?.length) {
            morphPairs.push({ original: child, clone: wireClone })
          }
        })

        clones.forEach(({ clone, parent }) => parent.add(clone))

        // Sync morph target influences (lip-sync, expressions) from originals
        // to wireframe clones every frame so they're visible through the wireframe
        function syncMorphTargets() {
          for (const { original, clone } of morphPairs) {
            if (original.morphTargetInfluences && clone.morphTargetInfluences) {
              for (let i = 0; i < original.morphTargetInfluences.length; i++) {
                clone.morphTargetInfluences[i] = original.morphTargetInfluences[i]
              }
            }
          }
          if (!cancelled) requestAnimationFrame(syncMorphTargets)
        }
        requestAnimationFrame(syncMorphTargets)
        head.renderer.setClearColor(0x000000, 1)

        // Hide loading overlay
        const overlay = container.querySelector<HTMLElement>('[data-loading]')
        if (overlay) overlay.style.display = 'none'

        // Resume the library's AudioContext on first user gesture (required on production HTTPS)
        const resumeAudio = () => {
          if (head.audioCtx?.state === 'suspended') {
            head.audioCtx.resume()
          }
          document.removeEventListener('click', resumeAudio)
          document.removeEventListener('touchstart', resumeAudio)
          document.removeEventListener('keydown', resumeAudio)
        }
        document.addEventListener('click', resumeAudio)
        document.addEventListener('touchstart', resumeAudio)
        document.addEventListener('keydown', resumeAudio)

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
