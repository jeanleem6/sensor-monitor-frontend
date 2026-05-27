<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BuildingRightPanel from './right/BuildingRightPanel.vue'
import FloorRightPanel    from './right/FloorRightPanel.vue'
import RoomRightPanel     from './right/RoomRightPanel.vue'

const { level, sidesCollapsed } = storeToRefs(useViewerStore())
</script>

<template>
  <div :class="['level-side right-3', sidesCollapsed ? 'w-44 gap-3' : 'w-100 gap-5']">
    <BuildingRightPanel v-if="level === 'building'" />
    <FloorRightPanel    v-else-if="level === 'floor'" />
    <RoomRightPanel     v-else />
  </div>
</template>
