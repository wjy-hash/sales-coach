import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Mistake } from '../types'
import { fetchMistakes, addMistake as apiAddMistake, deleteMistake as apiDeleteMistake } from '../api'

export const useMistakesStore = defineStore('mistakes', () => {
  const mistakes = ref<Mistake[]>([])
  const isLoading = ref(false)

  async function load() {
    isLoading.value = true
    try {
      mistakes.value = await fetchMistakes()
    } catch (err) {
      console.error('Failed to load mistakes:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function add(data: Omit<Mistake, 'id' | 'createdAt'>) {
    try {
      const m = await apiAddMistake(data)
      mistakes.value.unshift(m)
    } catch (err) {
      console.error('Failed to add mistake:', err)
    }
  }

  async function remove(id: string) {
    try {
      await apiDeleteMistake(id)
      mistakes.value = mistakes.value.filter((m) => m.id !== id)
    } catch (err) {
      console.error('Failed to delete mistake:', err)
    }
  }

  return { mistakes, isLoading, load, add, remove }
})
