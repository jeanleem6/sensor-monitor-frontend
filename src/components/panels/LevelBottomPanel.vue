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
      { label: '房间', value: Object.keys(rooms.value).length }
      // { label: '组件', value: totalMeshes },
      // { label: '材质', value: materialNames.value.length }
    ]
  }
  if (level.value === 'floor') {
    return [
      { label: '楼层', value: currentFloor.value?.name ?? '—' },
      { label: '房间', value: currentFloor.value?.roomNames.length ?? 0 }
      // { label: '组件', value: currentFloor.value?.meshCount ?? 0 },
      // { label: '材质', value: currentFloor.value?.materialCount ?? 0 }
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
    class="absolute left-108 right-108 bottom-5 z-10 flex items-stretch border border-primary/40 bg-primary/4 backdrop-blur shadow-(--shadow-glow-md) rounded-0 overflow-hidden"
  >
    <!-- 标题块 -->
    <div class="flex items-center gap-2 px-4 py-2 border-r border-primary/25 bg-primary/8 select-none shrink-0">
      <Icon
        :icon="level === 'floor' ? 'mdi:office-building-outline' : 'mdi:door-closed'"
        class="text-2xl text-primary"
      />
      <div class="text-sm tracking-widest text-cyan-200/80">
        {{ level === 'floor' ? '楼层概览' : '房间概览' }}
      </div>
    </div>

    <!-- 指标 -->
    <div class="flex-1 min-w-0 flex items-stretch divide-x divide-primary/15">
      <div v-for="m in metrics" :key="m.label" class="px-5 py-2 min-w-26 flex flex-col items-center justify-center">
        <div class="text-sm uppercase tracking-wider text-cyan-200/70">{{ m.label }}</div>
        <div class="text-xl font-bold text-cyan-50 mt-0.5 truncate max-w-40">
          {{ m.value }}
        </div>
      </div>
    </div>

    <!-- 视图控制 -->
    <div class="flex items-center gap-1.5 px-3 border-l border-primary/25 shrink-0">
      <button :class="transparentMode ? 'btn-primary' : 'btn'" @click="store.toggleTransparent" title="透明模式 (T)">
        <Icon icon="lucide:square-dashed" class="inline-block mr-0.5" />透明
      </button>
      <button class="btn" @click="store.fitView" title="重新适配 (F)">
        <Icon icon="lucide:maximize" class="inline-block mr-0.5" />适配
      </button>
      <button class="btn" @click="store.resetView" title="重设视图 (R)">
        <Icon icon="lucide:rotate-ccw" class="inline-block mr-0.5" />重设
      </button>
    </div>
  </div>
</template>
