<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BuildingLeftPanel from './left/BuildingLeftPanel.vue'
import FloorLeftPanel    from './left/FloorLeftPanel.vue'
import RoomLeftPanel     from './left/RoomLeftPanel.vue'

const { level, sidesCollapsed } = storeToRefs(useViewerStore())
</script>

<template>
  <div :class="['level-side left-3', sidesCollapsed ? 'w-44 gap-3' : 'w-100 gap-5']">
    <BuildingLeftPanel v-if="level === 'building'" />
    <FloorLeftPanel    v-else-if="level === 'floor'" />
    <RoomLeftPanel     v-else />
  </div>
</template>
