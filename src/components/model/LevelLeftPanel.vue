<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import FloatPanel from '@/components/FloatPanel.vue'

const store = useViewerStore()
const {
  level,
  materialNames,
  floors,
  rooms,
  currentFloor,
  currentRoom,
  selectedMaterial,
  selectedFloor,
  selectedRoom
} = storeToRefs(store)

const title = computed(() => {
  if (level.value === 'building') return `楼层清单 (${floors.value.length})`
  if (level.value === 'floor') return `房间清单 · ${currentFloor.value?.name ?? ''}`
  return `组件清单 · ${selectedRoom.value ?? ''}`
})

const showMaterials = computed(() => level.value === 'building')

const itemBase =
  'flex items-center justify-between gap-2 px-2 py-1 rounded cursor-pointer text-cyan-100 transition-colors hover:bg-primary/15'
const itemActive = 'bg-primary/25 text-primary hover:bg-primary/25'

const videoCamera = ['camera1', 'camera2', 'camera3', 'camera4', 'camera5', 'camera6']
</script>

<template>
  <div class="level-side left-3">
    <FloatPanel :title="title" class="min-h-60">
      <div class="flex-1 min-h-0 overflow-y-auto">
        <!-- Building: Floor list -->
        <template v-if="level === 'building'">
          <div v-if="floors.length === 0" class="px-2 py-1 text-cyan-200/50">无楼层资料</div>
          <div
            v-for="f in floors"
            :key="f.index"
            :class="[itemBase, selectedFloor === f.index && itemActive]"
            @click="store.selectFloor(f.index)"
          >
            <span class="truncate">{{ f.name }}</span>
            <span class="text-sm text-cyan-200/60 shrink-0">{{ f.meshCount }} 件</span>
          </div>
        </template>

        <!-- Floor: Room list -->
        <template v-else-if="level === 'floor'">
          <div v-if="!currentFloor?.roomNames.length" class="px-2 py-1 text-cyan-200/50">本层未侦测到房间</div>
          <div
            v-for="name in currentFloor?.roomNames || []"
            :key="name"
            :class="[itemBase, selectedRoom === name && itemActive]"
            @click="store.enterRoom(name)"
          >
            <span class="truncate">{{ name }}</span>
            <span class="text-sm text-cyan-200/60 shrink-0"> {{ rooms[name]?.meshCount ?? 0 }} 件 </span>
          </div>
        </template>

        <!-- Room: Mesh count stats -->
        <template v-else>
          <div class="px-2 py-1.5 text-sm text-cyan-200/70 border-b border-cyan-400/20">
            所属：{{ currentFloor?.name ?? '—' }}
          </div>
          <div class="px-2 py-1.5 flex items-center justify-between">
            <span class="text-cyan-100">组件数</span>
            <span class="font-mono font-semibold text-primary">
              {{ currentRoom?.meshCount ?? 0 }}
            </span>
          </div>
        </template>
      </div>

      <!-- Sub-section: Materials (building level only) -->
      <template v-if="showMaterials">
        <div class="shrink-0 mt-2 pt-2 px-1 text-sm font-semibold text-primary border-t border-cyan-400/25">
          材质 ({{ materialNames.length }})
        </div>
        <div class="max-h-48 mt-1 overflow-y-auto">
          <div v-if="materialNames.length === 0" class="px-2 py-1 text-cyan-200/50">无资料</div>
          <div
            v-for="name in materialNames"
            :key="name"
            :class="[itemBase, 'text-sm', selectedMaterial === name && itemActive]"
            @click="store.selectMaterial(name)"
          >
            <span class="truncate">{{ name }}</span>
          </div>
        </div>
      </template>
    </FloatPanel>

    <FloatPanel title="实时监控" class="mt-5">
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="item in videoCamera"
          :key="item"
          class="flex items-center justify-center h-20 rounded-sm bg-white/10"
        >
          <Icon icon="lucide:video" class="text-2xl text-slate-500" />
        </div>
      </div>
    </FloatPanel>

    <FloatPanel title="数据图表" class="mt-5">
      <div class="flex items-center justify-center h-36 rounded-sm bg-white/10">
        <Icon icon="lucide:chart-spline" class="text-5xl text-slate-500" />
      </div>
    </FloatPanel>
  </div>
</template>
