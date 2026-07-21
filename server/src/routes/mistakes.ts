import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { readJSON, writeJSON } from '../services/storage'

interface Mistake {
  id: string
  module: string
  question: string
  userAnswer: string
  correctAnswer: string
  score: number
  createdAt: string
}

export const mistakesRouter = Router()

// Get all mistakes
mistakesRouter.get('/', (_req: Request, res: Response) => {
  const mistakes = readJSON<Mistake[]>('mistakes.json')
  res.json(mistakes)
})

// Add a mistake
mistakesRouter.post('/', (req: Request, res: Response) => {
  const { module, question, userAnswer, correctAnswer, score } = req.body

  if (!module || !question) {
    res.status(400).json({ error: 'module and question are required' })
    return
  }

  const mistakes = readJSON<Mistake[]>('mistakes.json')
  const newMistake: Mistake = {
    id: uuid(),
    module,
    question,
    userAnswer: userAnswer || '',
    correctAnswer: correctAnswer || '',
    score: score || 0,
    createdAt: new Date().toISOString(),
  }

  mistakes.push(newMistake)
  writeJSON('mistakes.json', mistakes)

  res.status(201).json(newMistake)
})

// Delete a mistake
mistakesRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const mistakes = readJSON<Mistake[]>('mistakes.json')
  const index = mistakes.findIndex((m) => m.id === id)

  if (index === -1) {
    res.status(404).json({ error: 'Mistake not found' })
    return
  }

  mistakes.splice(index, 1)
  writeJSON('mistakes.json', mistakes)

  res.json({ success: true })
})

// Clear all mistakes
mistakesRouter.delete('/', (_req: Request, res: Response) => {
  writeJSON('mistakes.json', [])
  res.json({ success: true })
})
