<script setup lang="ts">
import type { ModuleInfo } from '../types'

defineProps<{
  module: ModuleInfo
}>()

defineEmits<{
  (e: 'click', key: string): void
}>()
</script>

<template>
  <div class="module-card" @click="$emit('click', module.key)">
    <div class="module-card-icon">{{ module.icon }}</div>
    <div class="module-card-content">
      <h4 class="module-card-title">{{ module.title }}</h4>
      <p class="module-card-desc">{{ module.description }}</p>
    </div>
    <div class="module-card-arrow">→</div>
  </div>
</template>

<style scoped>
.module-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e8e8e8;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #1677ff;
}

.module-card-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f5ff;
  border-radius: 12px;
  flex-shrink: 0;
}

.module-card-content {
  flex: 1;
}

.module-card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a1a1a;
}

.module-card-desc {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.module-card-arrow {
  font-size: 18px;
  color: #ccc;
  flex-shrink: 0;
}
</style>
