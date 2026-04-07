import { createContext, useContext, useState, type ReactNode } from 'react'

// ─── Action Context (for ActionCard clicks) ───

type ActionHandler = (prompt: string) => void
const ActionContext = createContext<ActionHandler | null>(null)

// ─── Types ───

type JsonNode = {
  component: string
  props?: Record<string, any>
  children?: JsonNode[] | string
}

// ─── Component Map ───

function renderChildren(children: JsonNode[] | string | undefined): ReactNode {
  if (!children) return null
  if (typeof children === 'string') return children
  return children.map((child, i) => renderNode(child, i))
}

function renderNode(node: JsonNode | string, key: number): ReactNode {
  if (typeof node === 'string') return node

  const { component, props = {}, children } = node
  const Comp = COMPONENTS[component]
  if (!Comp) {
    return (
      <div key={key} className="text-red-400 text-sm">
        Unknown component: {component}
      </div>
    )
  }
  return <Comp key={key} {...props}>{renderChildren(children)}</Comp>
}

// ─── Layout Components ───

function Stack({ children, gap = 4, align }: { children: ReactNode; gap?: number; align?: string }) {
  return (
    <div className={`flex flex-col min-w-0 gap-${gap} ${align ? `items-${align}` : ''}`} style={{ gap: `${gap * 4}px` }}>
      {children}
    </div>
  )
}

function Grid({ children, columns = 2, gap = 4 }: { children: ReactNode; columns?: number; gap?: number }) {
  return (
    <div
      className="grid min-w-0"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 4}px`,
      }}
    >
      {children}
    </div>
  )
}

function Flex({ children, direction = 'row', gap = 4, justify, align }: {
  children: ReactNode; direction?: string; gap?: number; justify?: string; align?: string
}) {
  return (
    <div
      className="flex flex-wrap min-w-0"
      style={{
        flexDirection: direction as any,
        gap: `${gap * 4}px`,
        justifyContent: justify,
        alignItems: align,
      }}
    >
      {children}
    </div>
  )
}

// ─── Content Components ───

function Heading({ children, level = 2 }: { children: ReactNode; level?: number }) {
  const sizes: Record<number, string> = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-bold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-semibold',
    5: 'text-base font-semibold',
    6: 'text-sm font-semibold',
  }
  const cls = `${sizes[level] || sizes[2]} text-white tracking-tight break-words`
  if (level === 1) return <h1 className={cls}>{children}</h1>
  if (level === 3) return <h3 className={cls}>{children}</h3>
  if (level === 4) return <h4 className={cls}>{children}</h4>
  return <h2 className={cls}>{children}</h2>
}

function Text({ children, size, weight }: {
  children: ReactNode; size?: string; color?: string; weight?: string
}) {
  return (
    <p className={`${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'} text-gray-300 leading-relaxed break-words ${weight === 'bold' ? 'font-bold' : ''}`}>
      {children}
    </p>
  )
}

const BADGE_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  yellow: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  purple: 'bg-white/10 text-gray-200 border-white/20',
}

function Badge({ children, variant = 'blue' }: { children: ReactNode; variant?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${BADGE_COLORS[variant] || BADGE_COLORS.blue}`}>
      {children}
    </span>
  )
}

function Code({ children }: { children: ReactNode; language?: string }) {
  return (
    <pre className="rounded-xl bg-gray-900/80 border border-white/5 p-4 overflow-x-auto max-w-full">
      <code className="text-sm text-gray-200 font-mono">{children}</code>
    </pre>
  )
}

// ─── Data Components ───

function Card({ children, variant = 'outlined' }: { children: ReactNode; variant?: string }) {
  const styles: Record<string, string> = {
    outlined: 'glass-card',
    filled: 'bg-white/8 rounded-2xl border border-white/10',
    elevated: 'glass-card shadow-lg shadow-black/20',
  }
  return (
    <div className={`${styles[variant] || styles.outlined} p-5 min-w-0 break-words`}>
      {children}
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][]; children?: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-white/5">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-300">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function List({ children, ordered, items }: { children?: ReactNode; ordered?: boolean; items?: string[] }) {
  const Tag = ordered ? 'ol' : 'ul'
  if (items) {
    return (
      <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1.5 text-gray-300`}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </Tag>
    )
  }
  return (
    <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1.5 text-gray-300`}>
      {children}
    </Tag>
  )
}

function Progress({ value = 0, label }: { value: number; label?: string; children?: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && <div className="flex justify-between text-sm"><span className="text-gray-300">{label}</span><span className="text-gray-400">{value}%</span></div>}
      <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ─── Interactive Components ───

function Tabs({ tabs }: { tabs: { label: string; content: JsonNode | string }[]; children?: ReactNode }) {
  const [active, setActive] = useState(0)
  if (!tabs) return null
  return (
    <div>
      <div className="flex gap-1 border-b border-white/8 mb-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
              i === active
                ? 'text-white bg-white/8 border-b border-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{renderNode(tabs[active].content as any, active)}</div>
    </div>
  )
}

function Accordion({ items }: { items: { title: string; content: JsonNode | string }[]; children?: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!items) return null
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="glass-card overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full px-5 py-3.5 text-left text-sm font-medium text-gray-200 hover:text-white flex justify-between items-center"
          >
            {item.title}
            <span className={`transition-transform ${open === i ? 'rotate-180' : ''}`}>&#9662;</span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-gray-300 text-sm">
              {typeof item.content === 'string' ? item.content : renderNode(item.content, i)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const ALERT_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'i' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '!' },
  error: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'x' },
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '✓' },
}

function Alert({ variant = 'info', title, message, children }: {
  variant?: string; title?: string; message?: string; children?: ReactNode
}) {
  const style = ALERT_STYLES[variant] || ALERT_STYLES.info
  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-4`}>
      {title && <div className="text-sm font-semibold text-gray-200 mb-1">{title}</div>}
      {message && <div className="text-sm text-gray-300">{message}</div>}
      {children}
    </div>
  )
}

// ─── Action Components ───

function ActionCard({ children, prompt, icon, label, title, text, variant = 'default' }: {
  children?: ReactNode; prompt: string; icon?: string; label?: string; title?: string; text?: string; variant?: string
}) {
  const onAction = useContext(ActionContext)
  // Agent might put the label as children, label, title, or text prop — handle all
  const displayText = children || label || title || text || prompt
  const variants: Record<string, string> = {
    default: 'border-white/8 hover:border-white/25 hover:bg-white/5',
    primary: 'border-white/15 bg-white/5 hover:bg-white/8',
    subtle: 'border-white/5 hover:border-white/12 hover:bg-white/3',
  }
  return (
    <button
      onClick={() => onAction?.(prompt)}
      className={`glass-card w-full text-left px-5 py-4 transition-all cursor-pointer group ${variants[variant] || variants.default}`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
          {displayText}
        </span>
        <svg className="ml-auto shrink-0 w-4 h-4 text-gray-600 group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  )
}

// ─── Component Registry ───

const COMPONENTS: Record<string, React.FC<any>> = {
  Stack,
  Grid,
  Flex,
  Heading,
  Text,
  Badge,
  Code,
  Card,
  Table,
  List,
  Progress,
  Tabs,
  Accordion,
  Alert,
  ActionCard,
}

// ─── Public API ───

export function UIRenderer({ config, onAction }: { config: JsonNode; onAction?: ActionHandler }) {
  return (
    <ActionContext.Provider value={onAction ?? null}>
      <div className="space-y-4">{renderNode(config, 0)}</div>
    </ActionContext.Provider>
  )
}
