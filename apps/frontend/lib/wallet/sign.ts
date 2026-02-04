import bs58 from 'bs58'

export function createSignMessage(challenge: string): Uint8Array {
  return new TextEncoder().encode(challenge)
}

export function encodeSignature(signature: Uint8Array): string {
  return bs58.encode(signature)
}
