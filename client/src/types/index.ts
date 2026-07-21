export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  module: ModuleType
}

export type ModuleType = 'main' | 'product-check' | 'scenario-prac' | 'scenario-qa' | 'mistakes'

export interface ModuleInfo {
  key: ModuleType
  title: string
  description: string
  icon: string
  color: string
}

export interface Mistake {
  id: string
  module: string
  question: string
  userAnswer: string
  correctAnswer: string
  score: number
  createdAt: string
}

export interface ChatRequest {
  message: string
  module: ModuleType
  conversationId?: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}

export interface ChatResponse {
  content: string
  done: boolean
  error?: string
}
