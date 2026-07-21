<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const router = useRouter()
const route = useRoute()

const currentKey = computed(() => {
  const name = route.name as string
  if (name === 'main') return ['/']
  return [name]
})

const menuItems = [
  { key: '/', icon: '🏠', label: '首页', shortLabel: '首页' },
  { key: '/product-check', icon: '📋', label: '产品检核', shortLabel: '检核' },
  { key: '/scenario-prac', icon: '🎭', label: '情景演练', shortLabel: '演练' },
  { key: '/scenario-qa', icon: '💬', label: '场景问答', shortLabel: '问答' },
  { key: '/mistakes', icon: '📝', label: '错题回顾', shortLabel: '错题' },
]

function onMenuClick(key: string) {
  router.push(key)
}
</script>

<template>
  <a-config-provider :locale="zhCN">
  <a-layout style="min-height: 100vh; min-height: 100dvh">
    <!-- Desktop sidebar -->
    <a-layout-sider
      width="220"
      class="desktop-sidebar"
      :style="{ background: '#001529' }"
      breakpoint="lg"
      collapsed-width="0"
    >
      <div class="logo">
        <span class="logo-icon">🤖</span>
        <span class="logo-text">销售AI陪练</span>
      </div>
      <a-menu
        theme="dark"
        mode="inline"
        :selectedKeys="currentKey"
        @click="({ key }) => onMenuClick(key as string)"
      >
        <a-menu-item v-for="item in menuItems" :key="item.key">
          <span class="menu-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- Mobile top bar -->
      <div class="mobile-header">
        <span class="mobile-logo">🤖 销售AI陪练</span>
      </div>
      <a-layout-content :style="{ margin: 0, background: '#f5f5f5', paddingBottom: 'env(safe-area-inset-bottom)' }">
        <router-view />
      </a-layout-content>
    </a-layout>

    <!-- Mobile bottom tab bar -->
    <div class="mobile-tabs">
      <div
        v-for="item in menuItems"
        :key="item.key"
        :class="['tab-item', { active: currentKey.includes(item.key) || (item.key === '/' && currentKey.includes('/')) }]"
        @click="onMenuClick(item.key)"
      >
        <span class="tab-icon">{{ item.icon }}</span>
        <span class="tab-label">{{ item.shortLabel }}</span>
      </div>
    </div>
  </a-layout>
  </a-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  -webkit-tap-highlight-color: transparent;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon { font-size: 24px; }

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.menu-icon { margin-right: 8px; }

/* Mobile header */
.mobile-header {
  display: none;
  height: 48px;
  background: #1677ff;
  color: #fff;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
}

.mobile-logo {
  font-size: 16px;
  font-weight: 600;
}

/* Mobile bottom tab bar */
.mobile-tabs {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  z-index: 1000;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 0;
  cursor: pointer;
  flex: 1;
  transition: color 0.2s;
  color: #999;
}

.tab-item.active {
  color: #1677ff;
}

.tab-icon { font-size: 20px; line-height: 1; }
.tab-label { font-size: 10px; line-height: 1; }

/* Mobile responsiveness */
@media (max-width: 768px) {
  .desktop-sidebar { display: none !important; }
  .mobile-header { display: flex; }
  .mobile-tabs { display: flex; }

  /* Add bottom padding for tab bar */
  .ant-layout-content {
    padding-bottom: 56px !important;
  }
}
</style>
