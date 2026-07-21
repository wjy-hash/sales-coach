<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}>()

const renderedContent = computed(() => {
  if (props.role === 'assistant') {
    return marked.parse(props.content, { breaks: true }) as string
  }
  return props.content
})

const timeStr = computed(() => {
  const d = new Date(props.timestamp)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <div :class="['message-row', role]">
    <div class="message-avatar">
      <span v-if="role === 'user'">👤</span>
      <span v-else-if="role === 'assistant'">🤖</span>
      <span v-else>📢</span>
    </div>
    <div class="message-body">
      <div class="message-bubble" v-if="role === 'assistant'" v-html="renderedContent" />
      <div class="message-bubble" v-else>{{ content }}</div>
      <div class="message-time">{{ timeStr }}</div>
    </div>
  </div>
</template>

<style scoped>
.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-row.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message-body {
  max-width: 75%;
}

.message-bubble {
  padding: 10px 16px;
  border-radius: 12px;
  line-height: 1.6;
  font-size: 14px;
  word-break: break-word;
}

.message-row.user .message-bubble {
  background: #1677ff;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-row.assistant .message-bubble {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-bottom-left-radius: 4px;
}

.message-row.system .message-bubble {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  text-align: center;
}

.message-row.assistant .message-bubble :deep(p) {
  margin-bottom: 8px;
}

.message-row.assistant .message-bubble :deep(p:last-child) {
  margin-bottom: 0;
}

.message-row.assistant .message-bubble :deep(ul),
.message-row.assistant .message-bubble :deep(ol) {
  padding-left: 20px;
  margin-bottom: 8px;
}

.message-row.assistant .message-bubble :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.message-row.assistant .message-bubble :deep(strong) {
  font-weight: 600;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.message-row.user .message-time {
  text-align: left;
}
</style>
