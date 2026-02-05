// Web Worker for hash mining
// This file runs in a Web Worker context - no DOM access

interface MineMessage {
  type: 'start' | 'stop'
  roundId?: string
  playerId?: string
  difficulty?: number
}

interface MineResult {
  type: 'valid_hash' | 'stats' | 'stopped'
  nonce?: string
  hash?: string
  leadingZeros?: number
  hashRate?: number
  totalHashes?: number
}

let mining = false
let totalHashes = 0
let lastStatsTime = Date.now()
let lastStatsHashes = 0

self.onmessage = async (e: MessageEvent<MineMessage>) => {
  const { type, roundId, playerId, difficulty } = e.data

  if (type === 'stop') {
    mining = false
    self.postMessage({ type: 'stopped', totalHashes } satisfies MineResult)
    return
  }

  if (type === 'start' && roundId && playerId && difficulty) {
    mining = true
    totalHashes = 0
    lastStatsTime = Date.now()
    lastStatsHashes = 0

    while (mining) {
      // Generate random nonce
      const nonce = crypto.randomUUID()
      const challenge = `${roundId}:${playerId}:${nonce}`

      // Compute SHA-256
      const encoder = new TextEncoder()
      const data = encoder.encode(challenge)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

      totalHashes++

      // Count leading zeros
      let leadingZeros = 0
      for (const char of hash) {
        if (char === '0') leadingZeros++
        else break
      }

      // If valid, post back the result
      if (leadingZeros >= difficulty) {
        self.postMessage({
          type: 'valid_hash',
          nonce,
          hash,
          leadingZeros,
          totalHashes,
        } satisfies MineResult)
      }

      // Report stats every 500ms
      const now = Date.now()
      if (now - lastStatsTime >= 500) {
        const elapsed = (now - lastStatsTime) / 1000
        const hashRate = Math.round((totalHashes - lastStatsHashes) / elapsed)
        lastStatsTime = now
        lastStatsHashes = totalHashes

        self.postMessage({
          type: 'stats',
          hashRate,
          totalHashes,
        } satisfies MineResult)
      }

      // Yield to event loop every 100 hashes to stay responsive
      if (totalHashes % 100 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }
  }
}
