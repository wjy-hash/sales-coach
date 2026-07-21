<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatWindow from '../components/ChatWindow.vue'
import ModuleHero from '../components/ModuleHero.vue'

const store = useChatStore()
const hasStarted = ref(false)

const knowledgeAreas = [
  { label: '天枢', icon: '🛰️' },
  { label: '富媒体消息', icon: '📱' },
  { label: '5G消息', icon: '📶' },
  { label: '语音线路', icon: '📞' },
  { label: 'CRM系统', icon: '💼' },
]

function startCheck(topic?: string) {
  hasStarted.value = true
  const msg = topic ? `检核${topic}` : '开始产品检核'
  store.sendMessage(msg)
}

function handleSend(message: string) {
  store.sendMessage(message)
}

onMounted(() => {
  store.setModule('product-check')
  store.clearMessages()
  hasStarted.value = false
})
</script>

<template>
  <div class="module-page">
    <ModuleHero
      icon="📋"
      title="产品检核"
      description="AI 智能出题考核你的产品知识，覆盖多个产品线，实时评分并提供针对性改进建议，帮你快速提升产品专业度"
      color="#1677ff"
    />

    <!-- Entry panel (before starting) -->
    <div v-if="!hasStarted" class="entry-panel">
      <div class="entry-actions">
        <a-button type="primary" size="large" @click="startCheck()">
          开始综合检核
        </a-button>
        <span class="entry-or">或选择检核领域</span>
      </div>
      <div class="area-tags">
        <a-tag
          v-for="area in knowledgeAreas"
          :key="area.label"
          class="area-tag"
          color="processing"
          @click="startCheck(area.label)"
        >
          {{ area.icon }} {{ area.label }}
        </a-tag>
      </div>
    </div>

    <ChatWindow
      :show-header="true"
      header-title="📋 产品检核"
      header-desc="AI 出题考核你的产品知识，实时评分并提供改进建议"
      placeholder="输入你的答案..."
      @send="handleSend"
    />
  </div>
</template>

<style scoped>
.module-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.entry-panel {
  padding: 24px 32px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.entry-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.entry-or {
  font-size: 13px;
  color: #999;
}

.area-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.area-tag {
  cursor: pointer;
  font-size: 14px;
  padding: 6px 16px;
  transition: all 0.2s;
}

.area-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}
</style>
