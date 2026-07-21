<script setup lang="ts">
import { onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatWindow from '../components/ChatWindow.vue'
import ModuleHero from '../components/ModuleHero.vue'

const store = useChatStore()

const questionGroups = [
  {
    label: '异议处理',
    questions: ['客户说价格太贵怎么办？', '客户说需要再考虑怎么跟进？', '如何应对竞争对手的诋毁？'],
  },
  {
    label: '需求挖掘',
    questions: ['如何挖掘客户的真实需求？', '怎样判断客户的预算范围？'],
  },
  {
    label: '产品演示',
    questions: ['怎样做好产品演示？', '如何突出产品差异化优势？'],
  },
  {
    label: '成交推进',
    questions: ['如何创造紧迫感促成成交？', '客户迟迟不签合同怎么办？'],
  },
]

function handleSend(message: string) {
  store.sendMessage(message)
}

function askQuick(q: string) {
  store.sendMessage(q)
}

onMounted(() => {
  store.setModule('scenario-qa')
  store.clearMessages()
})
</script>

<template>
  <div class="module-page">
    <ModuleHero
      icon="💬"
      title="场景问答"
      description="描述你在销售中遇到的真实问题或困惑场景，AI 教练结合最佳实践为你提供专业建议和话术指导"
      color="#fa8c16"
    />

    <!-- Quick questions panel -->
    <div v-if="store.messages.length === 0" class="qa-panel">
      <h3 class="section-title">💡 试试这些常见问题</h3>
      <div class="qa-groups">
        <div v-for="group in questionGroups" :key="group.label" class="qa-group">
          <h4 class="qa-group-label">{{ group.label }}</h4>
          <div class="qa-group-items">
            <div
              v-for="q in group.questions"
              :key="q"
              class="qa-item"
              @click="askQuick(q)"
            >
              {{ q }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <ChatWindow
      :show-header="true"
      header-title="💬 场景问答"
      header-desc="提出销售场景问题，AI 教练为你解答并提供专业建议"
      placeholder="描述你遇到的销售场景或问题..."
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

.qa-panel {
  padding: 24px 32px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1a1a1a;
}

.qa-groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.qa-group-label {
  font-size: 13px;
  font-weight: 600;
  color: #fa8c16;
  margin: 0 0 8px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #fa8c16;
  display: inline-block;
}

.qa-group-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.qa-item {
  font-size: 13px;
  color: #555;
  padding: 8px 12px;
  background: #fffaf0;
  border: 1px solid #ffe7ba;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.4;
}

.qa-item:hover {
  background: #fff1cc;
  border-color: #fa8c16;
  transform: translateX(4px);
}
</style>
