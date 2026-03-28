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
        <form onSubmit={handleSubmit} className="glass-input rounded-2xl flex items-center px-5 py-3.5">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isLoading ? 'Generating visual...' : 'Ask me anything...'}
            disabled={isLoading}
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none disabled:opacity-50"
            autoFocus
          />
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="ml-3 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/80 text-white transition hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-500/80"
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
