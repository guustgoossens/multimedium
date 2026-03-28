import { UIRenderer } from './renderers/UIRenderer'
import { ParticlesRenderer } from './renderers/particles'

type Explanation = {
  _id: string
  skill: string
  config: string
  narration?: string
  step?: number
}

function PlaceholderRenderer({ skill, narration }: { skill: string; narration?: string }) {
  return (
    <div className="glass-card p-8 text-center space-y-4">
      <div className="text-4xl">
        {skill === 'manim' ? '📐' : skill === 'diagram' ? '🔲' : skill === 'particles' ? '✨' : '🎨'}
      </div>
      <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">
        {skill} renderer
      </div>
      <div className="text-gray-500 text-xs">Coming soon — teammate building this</div>
      {narration && (
        <p className="text-gray-300 text-sm italic mt-4 max-w-md mx-auto">
          "{narration}"
        </p>
      )}
    </div>
  )
}

export function SkillRouter({ explanation }: { explanation: Explanation }) {
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
      return <UIRenderer config={config} />
    case 'particles':
      return <ParticlesRenderer config={config} />
    case 'manim':
    case 'diagram':
      return <PlaceholderRenderer skill={explanation.skill} narration={explanation.narration} />
    default:
      return <PlaceholderRenderer skill={explanation.skill} narration={explanation.narration} />
  }
}
