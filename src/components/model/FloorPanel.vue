<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'

const store = useViewerStore()
const { floorCount, selectedFloor } = storeToRefs(store)
const floors = computed(() => Array.from({ length: floorCount.value }, (_, i) => i))
</script>

<template>
  <div class="panel-card level-side left-3 bottom-3 top-auto!">
    <div class="panel-header">Floors ({{ floorCount }})</div>
    <div class="panel-body">
      <div v-if="floorCount === 0" class="text-slate-400 px-2 py-1">无资料</div>
      <div
        v-for="i in floors"
        :key="i"
        :class="['panel-item', selectedFloor === i && 'panel-item-active']"
        @click="store.selectFloor(i)"
      >
        Floor {{ i }}
      </div>
    </div>
  </div>
</template>
