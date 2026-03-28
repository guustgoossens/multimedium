import { createFileRoute } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { api } from '../../convex/_generated/api'
import TalkingHead, { type TalkingHeadHandle } from '../components/TalkingHead'

export const Route = createFileRoute('/')({ component: ChatPage })

function ChatPage() {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const headRef = useRef<TalkingHeadHandle>(null)
  const prevCountRef = useRef(0)

  const createThread = useAction(api.chat.createNewThread)
  const sendMessage = useAction(api.chat.sendMessageStreaming)

  // Create a thread on mount
  useEffect(() => {
    createThread({}).then(setThreadId).catch(console.error)
  }, [createThread])

  // Subscribe to explanations — speak new narrations as they arrive
  const explanations = useQuery(
    api.explanations.getByThread,
    threadId ? { threadId } : 'skip',
  )

  useEffect(() => {
    if (!explanations || !headRef.current) return
    const newOnes = explanations.slice(prevCountRef.current)
    prevCountRef.current = explanations.length
    for (const exp of newOnes) {
      if (exp.narration) headRef.current.speak(exp.narration)
    }
  }, [explanations])

  async function handleSend() {
    if (!input.trim() || !threadId || sending) return
    const prompt = input.trim()
    setInput('')
    setSending(true)
    try {
      await sendMessage({ threadId, prompt })
    } catch (err) {
      console.error('[chat] send failed:', err)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-black pt-14">
      {/* Talking head — fills available vertical space */}
      <div className="relative flex-1">
        <TalkingHead ref={headRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-white/10 bg-black/80 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-end gap-3">
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/20 focus:bg-white/8 disabled:opacity-40"
            placeholder={threadId ? 'Ask something...' : 'Connecting...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!threadId || sending}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!threadId || !input.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M1.5 1.5L14.5 8L1.5 14.5V9.5L10.5 8L1.5 6.5V1.5Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
