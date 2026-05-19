<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'

const store = useViewerStore()
const { rooms, selectedRoom, inRoom } = storeToRefs(store)
</script>

<template>
  <div class="panel-card level-side right-3">
    <div class="panel-header flex items-center justify-between">
      <span>Rooms ({{ rooms?.length }})</span>
      <button v-if="inRoom" class="btn" @click="store.exitRoom">Exit</button>
    </div>
    <div class="panel-body">
      <div v-if="rooms?.length === 0" class="text-slate-400 px-2 py-1">无资料</div>
      <div v-for="name in rooms" :key="name" :class="['panel-item', selectedRoom === name && 'panel-item-active']">
        <span class="truncate">{{ name }}</span>
        <span class="shrink-0 flex gap-1">
          <button class="btn-primary" @click="store.enterRoom(name)">Enter</button>
        </span>
      </div>
    </div>
  </div>
</template>
