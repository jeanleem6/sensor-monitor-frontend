<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BuildingLeftPanel from './left/BuildingLeftPanel.vue'
import FloorLeftPanel    from './left/FloorLeftPanel.vue'
import RoomLeftPanel     from './left/RoomLeftPanel.vue'

const { level } = storeToRefs(useViewerStore())
</script>

<template>
  <div class="level-side left-3">
    <BuildingLeftPanel v-if="level === 'building'" />
    <FloorLeftPanel    v-else-if="level === 'floor'" />
    <RoomLeftPanel     v-else />
  </div>
</template>
