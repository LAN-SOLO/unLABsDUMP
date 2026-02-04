export async function fetchPlayerProfile() {
  const res = await fetch('/api/player/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}
