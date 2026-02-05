import { cn } from '@/lib/utils'

interface TerminalFrameProps {
  title: string
  pid?: string
  status?: string
  statusLabel?: string
  accent?: 'green' | 'cyan'
  borderStyle?: 'double' | 'single' | 'mixed'
  children: React.ReactNode
  className?: string
}

const BORDER_CHARS = {
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  mixed: { tl: '╓', tr: '╖', bl: '╙', br: '╜', h: '─', v: '║' },
}

const ACCENTS = {
  green: {
    border: 'text-[#00FF41]/40',
    title: 'text-[#00FF41]',
    titleGlow: '0 0 8px rgba(0,255,65,0.6)',
    divider: 'border-[#00FF41]/20',
    status: 'text-[#00FF41]/30',
    cursor: 'text-[#00FF41]',
    led: {},
    shadow: '0 0 1px #00FF41, inset 0 0 30px rgba(0,255,65,0.03)',
  },
  cyan: {
    border: 'text-[#00FFFF]/40',
    title: 'text-[#00FFFF]',
    titleGlow: '0 0 8px rgba(0,255,255,0.6)',
    divider: 'border-[#00FFFF]/20',
    status: 'text-[#00FFFF]/30',
    cursor: 'text-[#00FFFF]',
    led: { background: '#00FFFF', boxShadow: '0 0 4px #00FFFF, 0 0 8px rgba(0,255,255,0.5)' },
    shadow: '0 0 1px #00FFFF, inset 0 0 30px rgba(0,255,255,0.03)',
  },
}

export function TerminalFrame({
  title,
  pid = '000',
  status = 'SYS',
  statusLabel = 'READY',
  accent = 'green',
  borderStyle = 'double',
  children,
  className,
}: TerminalFrameProps) {
  const chars = BORDER_CHARS[borderStyle]
  const colors = ACCENTS[accent]

  return (
    <div
      className={cn('terminal-frame relative font-mono bg-black/80 overflow-hidden', className)}
      style={{ boxShadow: colors.shadow }}
    >
      {/* Top border */}
      <div className={cn('flex items-center text-xs select-none overflow-hidden', colors.border)}>
        <span>{chars.tl}</span>
        <span className="flex-1 overflow-hidden whitespace-nowrap">{chars.h.repeat(120)}</span>
        <span>{chars.tr}</span>
      </div>

      {/* Title bar */}
      <div className={cn('flex items-center justify-between px-3 py-1.5 border-b', colors.divider)}>
        <div className="flex items-center gap-2">
          <span className="led-online" style={colors.led} />
          <span
            className={cn('text-xs font-bold uppercase tracking-widest', colors.title)}
            style={{ textShadow: colors.titleGlow }}
          >
            {title}
          </span>
        </div>
        <span className={cn('text-[10px]', colors.status)}>[PID {pid}]</span>
      </div>

      {/* Content */}
      <div className="relative glitch-scanlines">{children}</div>

      {/* Status bar */}
      <div
        className={cn(
          'flex items-center justify-between px-3 py-1 border-t text-[10px]',
          colors.divider,
          colors.status
        )}
      >
        <span>{status}</span>
        <span className="inline-flex items-center gap-1">
          <span className={cn('animate-cursor-blink', colors.cursor)}>█</span>
          {statusLabel}
        </span>
      </div>

      {/* Bottom border */}
      <div className={cn('flex items-center text-xs select-none overflow-hidden', colors.border)}>
        <span>{chars.bl}</span>
        <span className="flex-1 overflow-hidden whitespace-nowrap">{chars.h.repeat(120)}</span>
        <span>{chars.br}</span>
      </div>
    </div>
  )
}
