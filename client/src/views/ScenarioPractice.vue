<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatWindow from '../components/ChatWindow.vue'
import ModuleHero from '../components/ModuleHero.vue'

const store = useChatStore()

const scenarios = [
  {
    id: 1,
    title: '初次拜访客户',
    desc: '模拟首次接触潜在客户的场景，练习开场白、需求挖掘和关系建立',
    role: 'SaaS销售代表',
    difficulty: '⭐',
    icon: '🤝',
  },
  {
    id: 2,
    title: '处理价格异议',
    desc: '客户认为价格过高，练习谈判技巧、价值传递和让步策略',
    role: '销售经理',
    difficulty: '⭐⭐',
    icon: '💰',
  },
  {
    id: 3,
    title: '挽回流失客户',
    desc: '说服考虑更换供应商的客户留下，练习危机处理和关系修复',
    role: '客户成功经理',
    difficulty: '⭐⭐⭐',
    icon: '🛡️',
  },
]

const selectedScenario = ref<number | null>(null)
const selectedTitle = ref('')

function selectScenario(id: number) {
  selectedScenario.value = id
  const s = scenarios.find((s) => s.id === id)
  if (s) {
    selectedTitle.value = s.title
    store.sendMessage(`开始情景演练：《${s.title}》，我的角色是：${s.role}。${s.desc}`)
  }
}

function handleSend(message: string) {
  store.sendMessage(message)
}

onMounted(() => {
  store.setModule('scenario-prac')
  store.clearMessages()
  selectedScenario.value = null
})
</script>

<template>
  <div class="module-page">
    <ModuleHero
      icon="🎭"
      title="情景演练"
      description="AI 扮演真实客户角色与你进行多轮销售对话，覆盖常见场景，练习后给出详细反馈和改进建议"
      color="#52c41a"
    />

    <!-- Scenario selection screen -->
    <div v-if="selectedScenario === null" class="scenario-select">
      <h3 class="section-title">选择演练场景</h3>
      <p class="section-desc">AI 将扮演客户角色与你展开真实对话，每次练习后给出专业评价</p>
      <div class="scenario-list">
        <div
          v-for="s in scenarios"
          :key="s.id"
          class="scenario-card"
          @click="selectScenario(s.id)"
        >
          <div class="scenario-card-top">
            <span class="scenario-icon">{{ s.icon }}</span>
            <span class="scenario-diff">{{ s.difficulty }}</span>
          </div>
          <h4 class="scenario-title">{{ s.title }}</h4>
          <p class="scenario-desc">{{ s.desc }}</p>
          <div class="scenario-footer">
            <a-tag color="green">你扮演：{{ s.role }}</a-tag>
            <span class="scenario-start">开始演练 →</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat area -->
    <ChatWindow
      v-else
      :show-header="true"
      :header-title="`🎭 情景演练 · ${selectedTitle}`"
      header-desc="AI 正在扮演客户角色，请开始你的销售对话"
      placeholder="输入你的对话内容..."
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

.scenario-select {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #fafafa;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.section-desc {
  font-size: 14px;
  color: #999;
  margin: 0 0 24px 0;
}

.scenario-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.scenario-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
}

.scenario-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #52c41a;
}

.scenario-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.scenario-icon {
  font-size: 28px;
}

.scenario-diff {
  font-size: 14px;
}

.scenario-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.scenario-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.scenario-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scenario-start {
  font-size: 13px;
  color: #52c41a;
  font-weight: 500;
}
</style>
