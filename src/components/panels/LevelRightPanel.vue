<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BuildingRightPanel from './right/BuildingRightPanel.vue'
import FloorRightPanel    from './right/FloorRightPanel.vue'
import RoomRightPanel     from './right/RoomRightPanel.vue'

const { level } = storeToRefs(useViewerStore())
</script>

<template>
  <div class="level-side right-3">
    <BuildingRightPanel v-if="level === 'building'" />
    <FloorRightPanel    v-else-if="level === 'floor'" />
    <RoomRightPanel     v-else />
  </div>
</template>
