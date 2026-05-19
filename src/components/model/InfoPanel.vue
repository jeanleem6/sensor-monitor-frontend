<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'

const store = useViewerStore()
const { infoPanel } = storeToRefs(store)
</script>

<template>
  <transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="infoPanel.visible"
      class="absolute left-1/2 top-32 -translate-x-1/2 z-10 bg-primary/5 text-white px-3 py-2 rounded-md text-sm shadow-lg"
    >
      <div><span class="text-slate-400">Mesh:</span> {{ infoPanel.meshName }}</div>
      <div><span class="text-slate-400">Material:</span> {{ infoPanel.materialName }}</div>
    </div>
  </transition>
</template>
