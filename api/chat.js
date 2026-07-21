// Vercel serverless function — proxies to Coze API
const https = require('https')

const COZE = {
  endpoint: process.env.COZE_ENDPOINT || '5h2xdqq24g.coze.site',
  projectId: Number(process.env.COZE_PROJECT_ID) || 7662220730351747113,
  token: process.env.COZE_TOKEN || '',
}

const sessionIds = {}
const moduleHints = {
  'product-check': '【产品检核模式】请出题考核并评分指导。',
  'scenario-prac': '【情景演练模式】请扮演客户角色进行对话练习。',
  'scenario-qa': '【场景问答模式】请给出专业建议和话术。',
  main: '',
}

function buildPrompt(message, moduleKey, history) {
  let text = ''
  if (history && history.length > 0) {
    text += '【指令：基于历史继续对话，不要重新开始。】\n--- 历史 ---\n'
    for (const h of history) text += `[${h.role === 'user' ? '用户' : '助手'}]: ${h.content}\n`
    text += '--- 结束 ---\n\n【最新消息】'
  }
  const hint = moduleHints[moduleKey] || ''
  if (hint) text += hint + '\n'
  text += message
  if (history && history.length > 0) text += '\n\n【请直接回复，不重复历史】'
  return text
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { message, module = 'main', conversationId, history } = req.body || {}
  if (!message) return res.status(400).json({ error: 'message required' })

  const sid = conversationId || sessionIds[module] || `sc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  if (!sessionIds[module]) sessionIds[module] = sid

  const body = JSON.stringify({
    content: { query: { prompt: [{ type: 'text', content: { text: buildPrompt(message, module, history) } }] } },
    type: 'query', session_id: sid, project_id: COZE.projectId,
  })

  // Check if client wants streaming
  const isStream = req.headers.accept?.includes('text/event-stream')

  try {
    const cozeRes = await cozeRequest(body)
    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      for await (const chunk of parseStream(cozeRes)) {
        if (chunk.text) res.write(`data: ${JSON.stringify({ content: chunk.text, done: false })}\n\n`)
      }
      res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`)
      res.end()
    } else {
      let full = ''
      for await (const chunk of parseStream(cozeRes)) {
        if (chunk.text) full += chunk.text
      }
      res.json({ content: full, done: true })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

function cozeRequest(body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: COZE.endpoint, path: '/stream_run', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${COZE.token}` },
      timeout: 55000,
    }, resolve)
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function* parseStream(response) {
  const chunks = []
  for await (const c of response) chunks.push(c)
  const data = Buffer.concat(chunks).toString()
  for (const part of data.split('\n\n')) {
    if (!part.startsWith('event: message')) continue
    const dl = part.split('\n').find(l => l.startsWith('data: '))
    if (!dl) continue
    try {
      const p = JSON.parse(dl.slice(6))
      if (p.type === 'answer' && p.content?.answer) yield { text: p.content.answer }
      if (p.session_id) sessionIds[req.body?.module || 'main'] = p.session_id
    } catch {}
  }
}
