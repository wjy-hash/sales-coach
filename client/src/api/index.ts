import type { ChatRequest, ChatResponse, Mistake } from '../types'

const BASE = '/api'

export async function* streamChat(req: ChatRequest): AsyncGenerator<ChatResponse> {
  const response = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const match = line.match(/^data: (.+)$/m)
      if (match) {
        try {
          yield JSON.parse(match[1]) as ChatResponse
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}

export async function fetchMistakes(): Promise<Mistake[]> {
  const res = await fetch(`${BASE}/mistakes`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function addMistake(mistake: Omit<Mistake, 'id' | 'createdAt'>): Promise<Mistake> {
  const res = await fetch(`${BASE}/mistakes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mistake),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteMistake(id: string): Promise<void> {
  await fetch(`${BASE}/mistakes/${id}`, { method: 'DELETE' })
}
