<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'

const store = useViewerStore()
const { level, floors, rooms, materialNames, currentFloor, currentRoom, transparentMode } = storeToRefs(store)

const metrics = computed(() => {
  if (level.value === 'building') {
    const totalMeshes = floors.value.reduce((s, f) => s + f.meshCount, 0)
    return [
      { label: '楼层', value: floors.value.length },
      { label: '房间', value: Object.keys(rooms.value).length },
      { label: '组件', value: totalMeshes },
      { label: '材质', value: materialNames.value.length }
    ]
  }
  if (level.value === 'floor') {
    return [
      { label: '楼层', value: currentFloor.value?.name ?? '—' },
      { label: '房间', value: currentFloor.value?.roomNames.length ?? 0 },
      { label: '组件', value: currentFloor.value?.meshCount ?? 0 },
      { label: '材质', value: currentFloor.value?.materialCount ?? 0 }
    ]
  }
  return [
    { label: '房间', value: store.selectedRoom ?? '—' },
    { label: '所属', value: currentFloor.value?.name ?? '—' },
    { label: '组件', value: currentRoom.value?.meshCount ?? 0 }
  ]
})
</script>

<template>
  <div
    class="absolute left-1/2 -translate-x-1/2 bottom-3 z-10 max-w-[calc(100vw-43rem)] flex items-stretch divide-x divide-primary/15 rounded border border-primary/40 bg-primary/4 backdrop-blur shadow-(--shadow-glow-md) overflow-hidden"
  >
    <div v-for="m in metrics" :key="m.label" class="px-5 py-2 min-w-26 flex flex-col items-center justify-center">
      <div class="text-sm uppercase tracking-wider text-cyan-200/70">{{ m.label }}</div>
      <div class="text-xl font-bold text-cyan-50 mt-0.5 truncate max-w-40">
        {{ m.value }}
      </div>
    </div>

    <!-- 快捷控制 -->
    <div class="px-3 py-2 flex items-center gap-2">
      <button :class="transparentMode ? 'btn-primary' : 'btn'" @click="store.toggleTransparent" title="透明模式 (T)">
        透明
      </button>
      <button class="btn" @click="store.fitView" title="重新适配 (F)">适配</button>
      <button class="btn" @click="store.resetView" title="重设视图 (R)">重设</button>
    </div>
  </div>
</template>
