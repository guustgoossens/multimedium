import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { FrameContainer } from '../components/FrameContainer'
import { PromptInput } from '../components/PromptInput'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const createThread = useAction(api.chat.createNewThread)
  const sendMessage = useAction(api.chat.sendMessageStreaming)

  const explanations = useQuery(
    api.explanations.getByThread,
    threadId ? { threadId } : 'skip'
  )

  const handleSubmit = async (text: string) => {
    setIsLoading(true)
    try {
      let currentThreadId = threadId
      if (!currentThreadId) {
        currentThreadId = await createThread({})
        setThreadId(currentThreadId)
      }
      await sendMessage({ threadId: currentThreadId, prompt: text })
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="canvas">
      <FrameContainer
        explanations={explanations ?? []}
        isLoading={isLoading}
      />
      <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
