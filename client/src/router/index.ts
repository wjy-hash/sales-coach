import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('../views/MainChat.vue'),
    },
    {
      path: '/product-check',
      name: 'product-check',
      component: () => import('../views/ProductCheck.vue'),
    },
    {
      path: '/scenario-prac',
      name: 'scenario-prac',
      component: () => import('../views/ScenarioPractice.vue'),
    },
    {
      path: '/scenario-qa',
      name: 'scenario-qa',
      component: () => import('../views/ScenarioQA.vue'),
    },
    {
      path: '/mistakes',
      name: 'mistakes',
      component: () => import('../views/MistakeReview.vue'),
    },
  ],
})

export default router
