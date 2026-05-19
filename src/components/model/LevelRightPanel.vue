<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import FloatPanel from '@/components/FloatPanel.vue'

const store = useViewerStore()
const { level, materialNames, floors, rooms, currentFloor, currentRoom, selectedRoom } = storeToRefs(store)

const title = computed(() => {
  if (level.value === 'building') return '楼层分布'
  if (level.value === 'floor') return '本层概览'
  return '房间统计'
})

// Building: 每层 mesh 数量作为条形图
const floorChart = computed(() => {
  const max = Math.max(1, ...floors.value.map((f) => f.meshCount))
  return floors.value.map((f) => ({
    label: f.name,
    value: f.meshCount,
    pct: (f.meshCount / max) * 100
  }))
})

// Floor: 本层房间 mesh 数量
const roomChart = computed(() => {
  const names = currentFloor.value?.roomNames || []
  const arr = names.map((n) => ({ label: n, value: rooms.value[n]?.meshCount ?? 0 }))
  const max = Math.max(1, ...arr.map((a) => a.value))
  return arr.map((a) => ({ ...a, pct: (a.value / max) * 100 }))
})

// Room: 假数据点面板 (可用作 KPI)
const roomStats = computed(() => {
  const meshCount = currentRoom.value?.meshCount ?? 0
  return [
    { label: '组件总数', value: meshCount },
    { label: '所属楼层', value: currentFloor.value?.name ?? '—' },
    {
      label: '相对占比',
      value: floors.value.length
        ? `${((meshCount / Math.max(1, currentFloor.value?.meshCount ?? 1)) * 100).toFixed(1)}%`
        : '—'
    }
  ]
})
</script>

<template>
  <div class="level-side right-3">
    <FloatPanel :title="title">
      <div class="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        <!-- Building -->
        <template v-if="level === 'building'">
          <div class="text-sm text-cyan-200/70 px-1">各楼层组件数（点图示快速切换）</div>
          <div v-for="row in floorChart" :key="row.label" class="px-1">
            <div class="flex justify-between text-sm mb-0.5">
              <span
                class="text-cyan-100 cursor-pointer hover:text-primary"
                @click="store.selectFloor(floors.findIndex((f) => f.name === row.label))"
              >
                {{ row.label }}
              </span>
              <span class="font-mono text-cyan-200/70">{{ row.value }}</span>
            </div>
            <div class="h-2 rounded bg-cyan-400/10 overflow-hidden">
              <div
                class="h-full bg-linear-to-r from-primary/60 to-primary transition-all"
                :style="{ width: row.pct + '%' }"
              ></div>
            </div>
          </div>
          <div class="border-t border-cyan-400/25 pt-2 mt-2 px-1">
            <div class="text-sm text-cyan-200/70 mb-1">材质总类</div>
            <div class="text-2xl font-bold text-cyan-50">{{ materialNames.length }}</div>
          </div>
        </template>

        <!-- Floor -->
        <template v-else-if="level === 'floor'">
          <div class="grid grid-cols-2 gap-2 px-1">
            <div class="rounded bg-cyan-400/10 p-2">
              <div class="text-sm text-cyan-200/70">组件</div>
              <div class="text-xl font-bold text-cyan-50">
                {{ currentFloor?.meshCount ?? 0 }}
              </div>
            </div>
            <div class="rounded bg-cyan-400/10 p-2">
              <div class="text-sm text-cyan-200/70">材质类</div>
              <div class="text-xl font-bold text-cyan-50">
                {{ currentFloor?.materialCount ?? 0 }}
              </div>
            </div>
          </div>
          <div class="text-sm text-cyan-200/70 px-1 pt-1">房间组件数</div>
          <div v-if="!roomChart.length" class="text-cyan-200/50 px-1 text-sm">本层未侦测到房间</div>
          <div v-for="row in roomChart" :key="row.label" class="px-1">
            <div class="flex justify-between text-sm mb-0.5">
              <span
                :class="[
                  'cursor-pointer hover:text-primary',
                  selectedRoom === row.label ? 'text-primary font-semibold' : 'text-cyan-100'
                ]"
                @click="store.enterRoom(row.label)"
              >
                {{ row.label }}
              </span>
              <span class="font-mono text-cyan-200/70">{{ row.value }}</span>
            </div>
            <div class="h-2 rounded bg-cyan-400/10 overflow-hidden">
              <div
                class="h-full bg-linear-to-r from-emerald-300/60 to-emerald-400"
                :style="{ width: row.pct + '%' }"
              ></div>
            </div>
          </div>
        </template>

        <!-- Room -->
        <template v-else>
          <div
            v-for="s in roomStats"
            :key="s.label"
            class="rounded bg-cyan-400/10 p-2 flex justify-between items-baseline"
          >
            <span class="text-sm text-cyan-200/70">{{ s.label }}</span>
            <span class="text-lg font-bold text-cyan-50">{{ s.value }}</span>
          </div>
          <div class="border-t border-cyan-400/25 pt-2 mt-2 px-1 text-sm text-cyan-200/70">
            提示：按
            <kbd class="px-1 py-0.5 rounded bg-cyan-400/15 text-cyan-100 font-mono">Esc</kbd>
            返回上一层
          </div>
        </template>
      </div>
    </FloatPanel>

    <FloatPanel title="数据图表" class="mt-5">
      <div class="flex items-center justify-center h-50 rounded-sm bg-white/10">
        <Icon icon="lucide:chart-spline" class="text-5xl text-slate-500" />
      </div>
    </FloatPanel>

    <FloatPanel title="数据图表" class="mt-5">
      <div class="flex items-center justify-center h-50 rounded-sm bg-white/10">
        <Icon icon="lucide:chart-spline" class="text-5xl text-slate-500" />
      </div>
    </FloatPanel>
  </div>
</template>
