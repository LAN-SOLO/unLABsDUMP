// Hash puzzle utilities - shared between client and server

export function generateChallenge(roundId: string, playerId: string, nonce: string): string {
  return `${roundId}:${playerId}:${nonce}`
}

export async function computeHash(challenge: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(challenge)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function countLeadingZeros(hash: string): number {
  let count = 0
  for (const char of hash) {
    if (char === '0') {
      count++
    } else {
      break
    }
  }
  return count
}

export async function verifyHash(
  roundId: string,
  playerId: string,
  nonce: string,
  hash: string,
  difficulty: number
): Promise<{ valid: boolean; leadingZeros: number }> {
  const challenge = generateChallenge(roundId, playerId, nonce)
  const computed = await computeHash(challenge)

  if (computed !== hash) {
    return { valid: false, leadingZeros: 0 }
  }

  const leadingZeros = countLeadingZeros(hash)
  return { valid: leadingZeros >= difficulty, leadingZeros }
}
