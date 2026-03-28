import { UIRenderer } from './renderers/UIRenderer'
import { ParticlesRenderer } from './renderers/particles'
import { ManimRenderer } from './renderers/ManimRenderer'
import { DiagramRenderer } from './renderers/DiagramRenderer'

type Explanation = {
  _id: string
  skill: string
  config: string
  narration?: string
  step?: number
}

function PlaceholderRenderer({ skill, narration }: { skill: string; narration?: string }) {
  return (
    <div className="glass-card p-8 text-center space-y-3">
      <div className="text-gray-500 text-xs font-mono uppercase tracking-widest">
        {skill}
      </div>
      <div className="text-gray-600 text-xs font-mono">renderer pending</div>
      {narration && (
        <p className="text-gray-300 text-sm italic mt-4 max-w-md mx-auto">
          "{narration}"
        </p>
      )}
    </div>
  )
}

export function SkillRouter({ explanation, onAction }: { explanation: Explanation; onAction?: (prompt: string) => void }) {
  let config: any
  try {
    config = JSON.parse(explanation.config)
  } catch {
    return (
      <div className="glass-card p-6 text-red-400 text-sm">
        Failed to parse visual config
      </div>
    )
  }

  switch (explanation.skill) {
    case 'ui':
      return <UIRenderer config={config} onAction={onAction} />
    case 'particles':
      return <ParticlesRenderer config={config} />
    case 'manim':
      return <ManimRenderer config={config} />
    case 'diagram':
      return <DiagramRenderer config={config} />
    default:
      return <PlaceholderRenderer skill={explanation.skill} narration={explanation.narration} />
  }
}
