<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatMessage from './ChatMessage.vue'
import VoiceInput from './VoiceInput.vue'

const props = defineProps<{
  placeholder?: string
  showHeader?: boolean
  headerTitle?: string
  headerDesc?: string
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
}>()

const store = useChatStore()
const inputText = ref('')
const messagesContainer = ref<HTMLElement>()

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || store.isLoading) return
  inputText.value = ''
  await nextTick()
  emit('send', text)
  scrollToBottom()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleVoiceResult(text: string) {
  inputText.value = text
  nextTick(() => {
    handleSend()
  })
}

watch(() => store.messages.length, scrollToBottom)
onMounted(scrollToBottom)
</script>

<template>
  <div class="chat-window">
    <!-- Header -->
    <div class="chat-header" v-if="showHeader">
      <h3 class="chat-header-title">{{ headerTitle || 'AI 陪练助手' }}</h3>
      <p class="chat-header-desc" v-if="headerDesc">{{ headerDesc }}</p>
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="store.messages.length === 0" class="chat-empty">
        <div class="chat-empty-icon">🤖</div>
        <p>开始你的销售AI陪练之旅</p>
        <p class="chat-empty-sub">选择一个模块或直接输入你的问题</p>
      </div>
      <ChatMessage
        v-for="msg in store.messages"
        :key="msg.id"
        :role="msg.role"
        :content="msg.content"
        :timestamp="msg.timestamp"
      />
      <div v-if="store.isLoading && store.messages[store.messages.length - 1]?.content === ''" class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input-area">
      <VoiceInput @result="handleVoiceResult" />
      <a-textarea
        v-model:value="inputText"
        :placeholder="placeholder || '输入你的消息... (Enter 发送，Shift+Enter 换行)'"
        :auto-size="{ minRows: 1, maxRows: 4 }"
        @keydown="handleKeydown"
        :disabled="store.isLoading"
      />
      <a-button
        type="primary"
        :loading="store.isLoading"
        :disabled="!inputText.trim()"
        @click="handleSend"
        size="large"
      >
        发送
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.chat-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.chat-header-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.chat-header-desc {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.chat-empty {
  text-align: center;
  padding-top: 80px;
  color: #999;
}

.chat-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.chat-empty p {
  font-size: 16px;
  margin-bottom: 8px;
}

.chat-empty-sub {
  font-size: 13px !important;
  color: #bbb;
}

.chat-input-area {
  padding: 12px 24px 16px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-shrink: 0;
}

.chat-input-area :deep(.ant-input) {
  font-size: 14px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #bbb;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}
</style>
