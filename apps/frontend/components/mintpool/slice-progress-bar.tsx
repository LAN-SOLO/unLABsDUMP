'use client'

interface SliceProgressBarProps {
  owned: number
  required: number
}

export function SliceProgressBar({ owned, required }: SliceProgressBarProps) {
  const percentage = Math.min((owned / required) * 100, 100)
  const isFull = owned >= required

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className={isFull ? 'text-[#00FF41] font-bold' : 'text-[#00AA2A]'}>
          {owned}/{required} _unSLC
        </span>
        <span className="text-[#00AA2A]">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-[#0D3B1E] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFull ? 'bg-[#00FF41]' : 'bg-[#00FFFF]'
          }`}
          style={{
            width: `${percentage}%`,
            boxShadow: isFull ? '0 0 6px rgba(0,255,65,0.6)' : '0 0 4px rgba(0,255,255,0.4)',
          }}
        />
      </div>
    </div>
  )
}
