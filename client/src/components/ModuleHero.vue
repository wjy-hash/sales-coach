<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
  color?: string
}>()
</script>

<template>
  <div class="module-hero" :style="{ borderLeftColor: color || '#1677ff' }">
    <div class="hero-icon" :style="{ background: (color || '#1677ff') + '15', color: color || '#1677ff' }">
      {{ icon }}
    </div>
    <div class="hero-text">
      <h1 class="hero-title">{{ title }}</h1>
      <p class="hero-desc">{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.module-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 32px;
  background: #fff;
  border-left: 4px solid;
  flex-shrink: 0;
}

.hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #1a1a1a;
}

.hero-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}
</style>
