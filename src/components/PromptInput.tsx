import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { useSpeechToText } from '../hooks/useSpeechToText'

export function PromptInput({
  onSubmit,
  isLoading,
}: {
  onSubmit: (text: string) => void
  isLoading: boolean
}) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { isListening, transcript, interimTranscript, startListening, stopListening, isSupported } =
    useSpeechToText()

  // When speech recognition finalizes, put transcript in the input
  useEffect(() => {
    if (transcript) {
      setValue(transcript)
      inputRef.current?.focus()
    }
  }, [transcript])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || isLoading) return
    onSubmit(text)
    setValue('')
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Show interim transcript while listening
  const displayValue = isListening && interimTranscript ? interimTranscript : value

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6">
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="glass-input rounded-lg flex items-center px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isListening ? 'Listening...' : isLoading ? 'Generating...' : 'Ask anything...'}
            disabled={isLoading}
            className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm font-mono outline-none disabled:opacity-50"
            autoFocus
          />
          {isSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              className="ml-3 flex h-7 w-7 items-center justify-center rounded transition disabled:opacity-20"
            >
              {isListening ? (
                <Mic size={16} className="text-red-400 animate-pulse" />
              ) : (
                <MicOff size={16} className="text-gray-400 hover:text-white" />
              )}
            </button>
          )}
          <button
            type="submit"
            disabled={!displayValue.trim() || isLoading}
            className="ml-3 flex h-7 w-7 items-center justify-center rounded bg-white text-black transition hover:bg-gray-200 disabled:opacity-20"
          >
            {isLoading ? (
              <span className="loading-breathe text-xs">...</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
