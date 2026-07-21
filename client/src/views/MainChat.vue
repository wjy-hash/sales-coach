<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import ChatWindow from '../components/ChatWindow.vue'
import ModuleCard from '../components/ModuleCard.vue'
import ModuleHero from '../components/ModuleHero.vue'
import type { ModuleInfo } from '../types'

const router = useRouter()
const store = useChatStore()

const modules: ModuleInfo[] = [
  {
    key: 'product-check',
    title: '产品检核',
    description: 'AI 出题测试你的产品知识掌握程度，实时评分与反馈',
    icon: '📋',
    color: '#1677ff',
  },
  {
    key: 'scenario-prac',
    title: '情景演练',
    description: 'AI 扮演客户角色，模拟真实销售场景进行对话练习',
    icon: '🎭',
    color: '#52c41a',
  },
  {
    key: 'scenario-qa',
    title: '场景问答',
    description: '提出你在销售中遇到的问题，AI 给出专业建议和话术',
    icon: '💬',
    color: '#fa8c16',
  },
  {
    key: 'mistakes',
    title: '错题回顾',
    description: '查看和回顾之前的错题，针对性巩固薄弱环节',
    icon: '📝',
    color: '#ff4d4f',
  },
]

function goModule(key: string) {
  store.setModule(key)
  store.clearMessages()
  router.push(`/${key}`)
}

function handleSend(message: string) {
  store.sendMessage(message)
}

onMounted(() => {
  store.setModule('main')
  store.clearMessages()
})
</script>

<template>
  <div class="main-chat">
    <div class="main-chat-left">
      <ModuleHero
        icon="🤖"
        title="销售AI陪练"
        description="AI 驱动的销售技能训练平台，选择训练模块或直接开始对话，全方位提升你的销售能力"
        color="#1677ff"
      />
      <div class="module-grid">
        <ModuleCard
          v-for="m in modules"
          :key="m.key"
          :module="m"
          @click="goModule"
        />
      </div>
    </div>
    <div class="main-chat-right">
      <ChatWindow
        placeholder="输入消息开始对话，或点击 🎤 语音输入..."
        :show-header="true"
        header-title="AI 陪练助手"
        header-desc="随时向我提问销售相关的问题"
        @send="handleSend"
      />
    </div>
  </div>
</template>

<style scoped>
.main-chat {
  display: flex;
  height: 100vh;
}

.main-chat-left {
  flex: 1;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
  background: #fafafa;
}

.module-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
}

.main-chat-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 992px) {
  .main-chat {
    flex-direction: column;
  }
  .main-chat-left {
    flex: none;
  }
  .main-chat-right {
    flex: 1;
  }
}
</style>
