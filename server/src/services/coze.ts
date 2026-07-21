// Coze AI Service — Published Bot API integration
// Endpoint from Bot publish page: 发布 → API → stream_run

import https from 'node:https'
import http from 'node:http'

const COZE_CONFIG = {
  endpoint: process.env.COZE_ENDPOINT || '5h2xdqq24g.coze.site',
  projectId: Number(process.env.COZE_PROJECT_ID) || 7662220730351747113,
  token:
    process.env.COZE_TOKEN ||
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImYxMWY5N2VhLWEyNmEtNGE1NC05YmVmLWM5ZGUyZGE5ZjkyZiJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbIlJ6cjA2QWVWa2dSY3dVbE9ISjE3TklaQUZxc2NtSXpPIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzg0MTg2NjM1LCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjYyMjI5ODMzMDE0ODM3MjkwIiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjYzMDIzMjUwMjAwMzMwMjUwIn0.DWY4YM88zeur5_My319FtHpXBPXhx7QNYeL9ALAV5O3dfKHX4gXRL8kEVcGUZj6qDZfufEWiw9wm4GkGUgvdwzVP60_YGGsr8itwLgLduNBUYEzDuDiDVupd9DFAEkyuxVqjd_szIWGAWQ_riQNeSaD9H5mVbLw6Lw-RuPjY36lDpe2ZkBXXFqKDGbIAw46AYQUiYXkOf8sJUWnD9Ef_HpodIcKO0DUcUZMGD7JRTM61rVaGuycNG6AHtTaiz_Pe9TrfqWKGpcuQk9IlON1DWDCrH6uXKURB-P-5M1EWdqD7A_zekAzvEhUvg1OwKzx29pboD0BshtGO8ZMVBGwa2w',
}

interface ChatOptions {
  module: 'main' | 'product-check' | 'scenario-prac' | 'scenario-qa'
  conversationId?: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}

// Session IDs for multi-turn conversation (one per module)
const sessionIds: Record<string, string> = {}

// Module context hints
const moduleHints: Record<string, string> = {
  main: '',
  'product-check': '【产品检核模式】请以产品知识考官身份，出题考核用户并评分指导。',
  'scenario-prac': '【情景演练模式】请扮演客户角色与用户进行销售对话练习，对话结束后给出反馈。',
  'scenario-qa': '【场景问答模式】用户会提出销售场景中的问题，请给出专业建议和话术。',
}

function buildRequestBody(
  message: string,
  moduleKey: string,
  sessionId?: string,
  history?: { role: 'user' | 'assistant'; content: string }[]
) {
  const hint = moduleHints[moduleKey] || ''

  // Build prompt: embed history with clear markers so the Bot continues the conversation
  let promptText = ''

  if (history && history.length > 0) {
    promptText += '【指令：以下是对话上下文，请基于历史继续对话，不要重新开始。下面是对话记录和用户最新消息，请直接回复最新消息。】\n\n'
    promptText += '--- 对话历史 ---\n'
    for (let i = 0; i < history.length; i++) {
      const h = history[i]
      promptText += `[${h.role === 'user' ? '用户' : '助手'}]: ${h.content}\n`
    }
    promptText += '--- 结束 ---\n\n'
    promptText += `【用户最新消息】`
    if (hint) promptText += hint + '\n'
    promptText += message
    promptText += '\n\n【请直接回复用户最新消息，不需要重复历史内容】'
  } else {
    if (hint) {
      promptText = `${hint}\n${message}`
    } else {
      promptText = message
    }
  }

  return {
    content: {
      query: {
        prompt: [
          {
            type: 'text',
            content: { text: promptText },
          },
        ],
      },
    },
    type: 'query',
    session_id: sessionId || generateSessionId(),
    project_id: COZE_CONFIG.projectId,
  }
}

function generateSessionId(): string {
  return `sales-coach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function apiRequest(body: unknown): Promise<http.IncomingMessage> {
  const postData = JSON.stringify(body)

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: COZE_CONFIG.endpoint,
        path: '/stream_run',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${COZE_CONFIG.token}`,
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 60000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          let errorData = ''
          res.on('data', (chunk: Buffer) => {
            errorData += chunk.toString()
          })
          res.on('end', () => {
            reject(new Error(`Coze API HTTP ${res.statusCode}: ${errorData}`))
          })
          return
        }
        resolve(res)
      }
    )

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Coze API timeout'))
    })

    req.write(postData)
    req.end()
  })
}

// Parse the Coze published Bot SSE stream
async function* parseCozeStream(response: http.IncomingMessage): AsyncGenerator<{
  type: string
  answer?: string
  sessionId?: string
  error?: string
}> {
  const readable = response as unknown as AsyncIterable<Buffer>
  let buffer = ''

  for await (const chunk of readable) {
    buffer += chunk.toString()
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (!part.trim() || !part.startsWith('event: message')) continue

      // Extract the data line
      const dataLine = part
        .split('\n')
        .find((line) => line.startsWith('data: '))
      if (!dataLine) continue

      try {
        const parsed = JSON.parse(dataLine.slice(6))

        if (parsed.type === 'answer' && parsed.content?.answer) {
          yield { type: 'answer', answer: parsed.content.answer }
        }

        if (parsed.session_id) {
          yield { type: 'meta', sessionId: parsed.session_id }
        }

        if (parsed.content?.error) {
          yield { type: 'error', error: JSON.stringify(parsed.content.error) }
        }
      } catch {
        // skip malformed
      }
    }
  }
}

export async function* streamChat(
  message: string,
  options: ChatOptions
): AsyncGenerator<string> {
  const moduleKey = options.module
  const existingId = options.conversationId || sessionIds[moduleKey]
  const body = buildRequestBody(message, moduleKey, existingId, options.history)

  // Save the session ID BEFORE the request so subsequent messages reuse it
  if (!sessionIds[moduleKey]) {
    sessionIds[moduleKey] = body.session_id as string
  }

  console.log(
    `[coze] → ${moduleKey}`,
    existingId ? `(继续 ${existingId.slice(-8)})` : `(新会话 ${(body.session_id as string).slice(-8)})`
  )

  try {
    const response = await apiRequest(body)
    const events = parseCozeStream(response)

    for await (const evt of events) {
      if (evt.type === 'answer' && evt.answer) {
        yield evt.answer
      }
      if (evt.type === 'meta' && evt.sessionId) {
        sessionIds[moduleKey] = evt.sessionId
      }
      if (evt.type === 'error') {
        yield `\n\n[错误] ${evt.error}`
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[coze] Error:', msg)
    yield `\n\n[AI 服务异常] ${msg}\n\n请检查网络连接或稍后重试。`
  }
}
