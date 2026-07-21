import { Router, Request, Response } from 'express'
import { streamChat } from '../services/coze'

export const chatRouter = Router()

chatRouter.post('/', async (req: Request, res: Response) => {
  const { message, module = 'main', conversationId, history } = req.body

  if (!message) {
    res.status(400).json({ error: 'message is required' })
    return
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  try {
    const stream = streamChat(message, { module, conversationId, history })

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`)
    }

    // Send done signal
    res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`)
    res.end()
  } catch (err) {
    console.error('[chat] stream error:', err)
    res.write(`data: ${JSON.stringify({ content: '', done: true, error: 'Stream error' })}\n\n`)
    res.end()
  }
})

// Non-streaming endpoint for simpler clients
chatRouter.post('/send', async (req: Request, res: Response) => {
  const { message, module = 'main', conversationId, history } = req.body

  if (!message) {
    res.status(400).json({ error: 'message is required' })
    return
  }

  try {
    let fullResponse = ''
    const stream = streamChat(message, { module, conversationId, history })

    for await (const chunk of stream) {
      fullResponse += chunk
    }

    res.json({ content: fullResponse, done: true })
  } catch (err) {
    console.error('[chat] error:', err)
    res.status(500).json({ error: 'Chat error' })
  }
})
