import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage, ModuleType } from '../types'
import { streamChat } from '../api'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const currentModule = ref<ModuleType>('main')

  let msgIdCounter = 0

  function addMessage(role: 'user' | 'assistant' | 'system', content: string) {
    messages.value.push({
      id: `msg-${++msgIdCounter}`,
      role,
      content,
      timestamp: Date.now(),
      module: currentModule.value,
    })
  }

  async function sendMessage(text: string) {
    addMessage('user', text)
    isLoading.value = true

    // Add empty assistant message for streaming
    const assistantMsg: ChatMessage = {
      id: `msg-${++msgIdCounter}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      module: currentModule.value,
    }
    messages.value.push(assistantMsg)

    try {
      // Collect recent conversation history (last 20 messages, exclude the empty assistant placeholder)
      const history = messages.value
        .filter((m) => m.content && m.role !== 'system')
        .slice(-20)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const stream = streamChat({
        message: text,
        module: currentModule.value,
        history,
      })

      for await (const chunk of stream) {
        if (chunk.error) {
          assistantMsg.content = `[错误] ${chunk.error}`
          break
        }
        if (!chunk.done) {
          assistantMsg.content += chunk.content
        }
      }
    } catch (err) {
      assistantMsg.content = `[网络错误] ${err instanceof Error ? err.message : '请检查后端服务是否启动'}`
    } finally {
      isLoading.value = false
    }
  }

  function setModule(module: ModuleType) {
    currentModule.value = module
  }

  function clearMessages() {
    messages.value = []
  }

  return { messages, isLoading, currentModule, addMessage, sendMessage, setModule, clearMessages }
})
