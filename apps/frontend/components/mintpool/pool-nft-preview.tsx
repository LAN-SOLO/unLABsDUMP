'use client'

interface PoolNFTPreviewProps {
  nftCount: number
}

export function PoolNFTPreview({ nftCount }: PoolNFTPreviewProps) {
  // Show placeholder silhouettes for hidden NFTs in the pool
  const previewCount = Math.min(nftCount, 6)

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-[#00FFFF] text-xs font-bold uppercase tracking-wider">Pool NFTs</h4>

      {nftCount === 0 ? (
        <div className="text-[#1A3A2A] text-xs font-mono py-4 text-center">No NFTs in pool</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: previewCount }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-[#0D1117] border border-[#0D3B1E] rounded-sm overflow-hidden relative"
              >
                <div className="absolute inset-0 backdrop-blur-md bg-[#0D1117]/60 flex items-center justify-center">
                  <span className="text-amber-400/40 text-lg">?</span>
                </div>
                {/* Abstract silhouette */}
                <div
                  className="absolute inset-4 rounded-full opacity-10"
                  style={{
                    background: `linear-gradient(${i * 60}deg, #00FFFF, #00FF41)`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="text-[#00AA2A] text-[10px] text-center font-mono">
            {nftCount} hidden NFT{nftCount !== 1 ? 's' : ''} available
          </div>
        </>
      )}
    </div>
  )
}
