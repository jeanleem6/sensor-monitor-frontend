<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useViewerStore } from '@/stores/viewer'
import { createThreeScene } from '@/composables/useThreeScene'

const container = ref(null)
const store = useViewerStore()
let api = null

onMounted(async () => {
  api = createThreeScene(container.value, store)
  store.bindScene(api)
  try {
    await api.loadModel()
  } catch (err) {
    console.error('[ThreeViewer] failed to load model', err)
  } finally {
    store.loading = false
  }
})

onBeforeUnmount(() => {
  api?.dispose()
})
</script>

<template>
  <transition
    enter-active-class="transition duration-600"
    leave-active-class="transition duration-600"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div ref="container" class="absolute inset-0 z-0"></div>
  </transition>
</template>
