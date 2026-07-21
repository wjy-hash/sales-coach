<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMistakesStore } from '../stores/mistakes'
import { useChatStore } from '../stores/chat'
import MistakeCard from '../components/MistakeCard.vue'
import ModuleHero from '../components/ModuleHero.vue'
import type { Mistake } from '../types'
import { message } from 'ant-design-vue'

const mistakesStore = useMistakesStore()
const chatStore = useChatStore()
const router = useRouter()

const stats = computed(() => {
  const list = mistakesStore.mistakes
  const moduleCount: Record<string, number> = {}
  const totalScore = list.reduce((sum, m) => sum + m.score, 0)

  list.forEach((m) => {
    moduleCount[m.module] = (moduleCount[m.module] || 0) + 1
  })

  return {
    total: list.length,
    avgScore: list.length > 0 ? Math.round(totalScore / list.length) : 0,
    moduleBreakdown: Object.entries(moduleCount).sort((a, b) => b[1] - a[1]),
  }
})

const moduleLabels: Record<string, string> = {
  'product-check': '产品检核',
  'scenario-prac': '情景演练',
  'scenario-qa': '场景问答',
  main: '主聊天',
  mistakes: '错题回顾',
}

async function handleDelete(id: string) {
  await mistakesStore.remove(id)
  message.success('已删除')
}

async function handleRetry(mistake: Mistake) {
  chatStore.setModule(mistake.module as any)
  chatStore.clearMessages()
  router.push(`/${mistake.module}`)
}

function clearAll() {
  mistakesStore.mistakes = []
  message.success('已清空所有错题')
}

onMounted(() => {
  mistakesStore.load()
})
</script>

<template>
  <div class="module-page">
    <ModuleHero
      icon="📝"
      title="错题回顾"
      description="系统记录你在各模块中答错的题目，支持查看、删除和重新练习，帮你快速定位并巩固薄弱环节"
      color="#ff4d4f"
    />

    <div class="mistakes-body">
      <a-spin :spinning="mistakesStore.isLoading">
        <div v-if="mistakesStore.mistakes.length === 0" class="empty-state">
          <div class="empty-icon">🎉</div>
          <p>暂无错题记录</p>
          <p class="empty-sub">完成产品检核或情景演练后，答错的题目会自动记录在这里</p>
        </div>
        <template v-else>
          <!-- Stats bar -->
          <div class="stats-bar">
            <div class="stat-item">
              <span class="stat-value">{{ stats.total }}</span>
              <span class="stat-label">错题总数</span>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <span class="stat-value">{{ stats.avgScore }}分</span>
              <span class="stat-label">平均得分</span>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <div class="stat-modules">
                <a-tag
                  v-for="[mod, count] in stats.moduleBreakdown.slice(0, 3)"
                  :key="mod"
                  color="error"
                >
                  {{ moduleLabels[mod] || mod }}: {{ count }}
                </a-tag>
              </div>
              <span class="stat-label">模块分布</span>
            </div>
            <div class="stat-spacer" />
            <a-button danger size="small" @click="clearAll">清空全部</a-button>
          </div>
          <!-- Mistake list -->
          <div class="mistakes-list">
            <MistakeCard
              v-for="m in mistakesStore.mistakes"
              :key="m.id"
              :mistake="m"
              @delete="handleDelete"
              @retry="handleRetry"
            />
          </div>
        </template>
      </a-spin>
    </div>
  </div>
</template>

<style scoped>
.module-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.mistakes-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ffe8e8;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e8e8e8;
}

.stat-modules {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-spacer {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding-top: 100px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-sub {
  font-size: 13px;
  color: #bbb;
}

.mistakes-list {
  max-width: 900px;
}
</style>
