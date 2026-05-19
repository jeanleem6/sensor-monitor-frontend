<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'

const store = useViewerStore()
const { materialNames, selectedMaterial } = storeToRefs(store)
</script>

<template>
  <div class="panel-card level-side left-3">
    <div class="panel-header">Materials ({{ materialNames.length }})</div>
    <div class="panel-body">
      <div v-if="materialNames.length === 0" class="text-slate-300 px-2 py-1">无资料</div>
      <div
        v-for="name in materialNames"
        :key="name"
        :class="['panel-item', selectedMaterial === name && 'panel-item-active']"
        @click="store.selectMaterial(name)"
      >
        <span class="truncate">{{ name }}</span>
      </div>
    </div>
  </div>
</template>
