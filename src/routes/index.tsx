import { useState, useCallback, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { FrameContainer } from '../components/FrameContainer'
import { PromptInput } from '../components/PromptInput'
import TalkingHead, { type TalkingHeadHandle } from '../components/TalkingHead'

export const Route = createFileRoute('/')({ component: AppShell })

/** SSR-safe wrapper — mounts client-only content after hydration */
function AppShell() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="canvas" />
  return <App />
}

function App() {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const loadingRef = useRef(false)
  const threadRef = useRef<string | null>(null)
  const doneCountRef = useRef(0)
  const headRef = useRef<TalkingHeadHandle>(null)
  const spokenCountRef = useRef(0)

  const createThread = useAction(api.chat.createNewThread)
  const sendMessage = useAction(api.chat.sendMessageStreaming)

  // Keep refs in sync
  loadingRef.current = isLoading
  threadRef.current = threadId

  const explanations = useQuery(
    api.explanations.getByThread,
    threadId ? { threadId } : 'skip'
  )

  // Clear isLoading when a new _done marker appears
  const doneCount = explanations?.filter((e) => e.skill === '_done').length ?? 0
  useEffect(() => {
    if (doneCount > doneCountRef.current) {
      setIsLoading(false)
    }
    doneCountRef.current = doneCount
  }, [doneCount])

  // Speak new narrations on the avatar
  useEffect(() => {
    if (!explanations || !headRef.current) return
    const newOnes = explanations.slice(spokenCountRef.current)
    spokenCountRef.current = explanations.length
    for (const exp of newOnes) {
      if (exp.narration) headRef.current.speak(exp.narration)
    }
  }, [explanations])

  const handleSubmit = useCallback(async (text: string) => {
    if (loadingRef.current) return
    setIsLoading(true)

    // Immediately animate the avatar with user text
    headRef.current?.speak(text)

    try {
      let currentThreadId = threadRef.current
      if (!currentThreadId) {
        currentThreadId = await createThread({})
        setThreadId(currentThreadId)
      }
      sendMessage({ threadId: currentThreadId, prompt: text })
        .catch((err) => {
          console.error('Agent error:', err)
          setIsLoading(false)
        })
    } catch (err) {
      console.error('Failed to send message:', err)
      setIsLoading(false)
    }
  }, [createThread, sendMessage])

  return (
    <div className="canvas">
      {/* Talking head — disabled for now to focus on visual flow
      <div className="talking-head-bg">
        <TalkingHead ref={headRef} />
      </div>
      */}

      <FrameContainer
        explanations={explanations ?? []}
        isLoading={isLoading}
        onAction={handleSubmit}
      />
      <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
