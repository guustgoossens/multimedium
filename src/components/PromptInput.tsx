import { useState, useRef } from 'react'

export function PromptInput({
  onSubmit,
  isLoading,
}: {
  onSubmit: (text: string) => void
  isLoading: boolean
}) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || isLoading) return
    onSubmit(text)
    setValue('')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6">
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="glass-input rounded-lg flex items-center px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isLoading ? 'Generating...' : 'Ask anything...'}
            disabled={isLoading}
            className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm font-mono outline-none disabled:opacity-50"
            autoFocus
          />
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
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
