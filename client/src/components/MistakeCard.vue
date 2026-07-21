<script setup lang="ts">
import type { Mistake } from '../types'

defineProps<{
  mistake: Mistake
}>()

defineEmits<{
  (e: 'delete', id: string): void
  (e: 'retry', mistake: Mistake): void
}>()

const moduleLabels: Record<string, string> = {
  'product-check': '产品检核',
  'scenario-prac': '情景演练',
  'scenario-qa': '场景问答',
  main: '主聊天',
  mistakes: '错题回顾',
}
</script>

<template>
  <a-card size="small" class="mistake-card">
    <template #title>
      <span class="mistake-module-tag">
        {{ moduleLabels[mistake.module] || mistake.module }}
      </span>
      <span class="mistake-score">得分: {{ mistake.score }}</span>
    </template>
    <template #extra>
      <a-space>
        <a-button type="link" size="small" @click="$emit('retry', mistake)">重新练习</a-button>
        <a-button type="link" danger size="small" @click="$emit('delete', mistake.id)">删除</a-button>
      </a-space>
    </template>
    <div class="mistake-body">
      <p class="mistake-question"><strong>问题：</strong>{{ mistake.question }}</p>
      <p class="mistake-answer"><strong>你的回答：</strong>{{ mistake.userAnswer || '(未回答)' }}</p>
      <p class="mistake-correct" v-if="mistake.correctAnswer">
        <strong>正确答案：</strong>{{ mistake.correctAnswer }}
      </p>
      <p class="mistake-date">{{ new Date(mistake.createdAt).toLocaleString('zh-CN') }}</p>
    </div>
  </a-card>
</template>

<style scoped>
.mistake-card {
  margin-bottom: 12px;
}

.mistake-module-tag {
  display: inline-block;
  padding: 1px 8px;
  background: #f0f5ff;
  color: #1677ff;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.mistake-score {
  font-size: 13px;
  color: #ff4d4f;
  font-weight: 600;
}

.mistake-body p {
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 1.6;
}

.mistake-question {
  color: #1a1a1a;
}

.mistake-answer {
  color: #ff4d4f;
}

.mistake-correct {
  color: #52c41a;
}

.mistake-date {
  color: #ccc;
  font-size: 12px !important;
}
</style>
