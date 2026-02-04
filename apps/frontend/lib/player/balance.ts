export async function fetchPlayerBalance() {
  const res = await fetch('/api/player/balance')
  if (!res.ok) throw new Error('Failed to fetch balance')
  return res.json()
}
