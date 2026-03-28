import { useState, useCallback, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { FrameContainer } from '../components/FrameContainer'
import { PromptInput } from '../components/PromptInput'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const loadingRef = useRef(false)
  const threadRef = useRef<string | null>(null)
  const doneCountRef = useRef(0)

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

  const handleSubmit = useCallback(async (text: string) => {
    if (loadingRef.current) return
    setIsLoading(true)
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
      <FrameContainer
        explanations={explanations ?? []}
        isLoading={isLoading}
        onAction={handleSubmit}
      />
      <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
