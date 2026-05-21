<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BasePanel from '@/components/ui/BasePanel.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import GaugeRing from '@/components/ui/GaugeRing.vue'

const store = useViewerStore()
const { level, materialNames, rooms, currentFloor, currentRoom, selectedMaterial, selectedRoom } = storeToRefs(store)

const title = computed(() => {
  if (level.value === 'floor') return `房间清单 · ${currentFloor.value?.name ?? ''}`
  return `组件清单 · ${selectedRoom.value ?? ''}`
})

const itemBase =
  'flex items-center justify-between gap-2 px-2 py-1 rounded cursor-pointer text-cyan-100 transition-colors hover:bg-primary/15'
const itemActive = 'bg-primary/25 text-primary hover:bg-primary/25'

// ---------- 楼栋级 DEMO 数据 ----------
const weatherBasic = [
  { icon: 'lucide:thermometer', label: '温度', value: '24.6', unit: '°C' },
  { icon: 'lucide:droplets', label: '湿度', value: '87', unit: '%', status: 'warning' },
  { icon: 'lucide:droplet', label: '露点', value: '15.8', unit: '°C' },
  { icon: 'lucide:gauge', label: '气压', value: '1013', unit: 'hPa' },
  { icon: 'lucide:compass', label: '风向', value: 'ENE', unit: '67°' },
  { icon: 'lucide:wind', label: '风速', value: '3.2', unit: 'm/s' },
  { icon: 'lucide:cloud-rain', label: '降水量', value: '78.0', unit: 'mm', status: 'danger' }
]

// 阈值类指标 → 环形仪表
const airQuality = [
  { label: 'CO₂', value: 612, max: 1500, unit: 'ppm', status: 'normal' },
  { label: 'PM2.5', value: 42, max: 150, unit: 'μg/m³', status: 'warning' },
  { label: 'PM10', value: 68, max: 200, unit: 'μg/m³', status: 'danger' }
]

const solarRadiation = [
  { icon: 'lucide:sun', label: '直接辐射', value: '786', unit: 'W/m²', status: 'normal' },
  { icon: 'lucide:sun-dim', label: '散射辐射', value: '142', unit: 'W/m²', status: 'warning' },
  { icon: 'lucide:rainbow', label: '光谱辐射', value: '923', unit: 'W/m²', status: 'danger' }
]
</script>

<template>
  <div class="level-side left-3">
    <!-- ========== 楼栋级 ========== -->
    <template v-if="level === 'building'">
      <BasePanel title="全参数气象站">
        <!-- 基础参数 -->
        <div class="grid grid-cols-2 gap-2 mt-2">
          <MetricCard
            v-for="m in weatherBasic"
            :key="m.label"
            :icon="m.icon"
            :label="m.label"
            :value="m.value"
            :unit="m.unit"
            :status="m.status"
          />
        </div>

        <!-- 空气质量（带阈值） -->
        <div class="mt-3 pt-3 border-t border-primary/20">
          <div class="flex items-center gap-1.5 mb-2 text-sm text-cyan-200/80">
            <Icon icon="mdi:weather-fog" class="text-primary text-base" />
            <span>空气质量</span>
          </div>
          <div class="grid grid-cols-3 gap-1">
            <GaugeRing
              v-for="a in airQuality"
              :key="a.label"
              :value="a.value"
              :max="a.max"
              :label="a.label"
              :unit="a.unit"
              :status="a.status"
              :size="78"
            />
          </div>
        </div>
      </BasePanel>

      <BasePanel title="太阳辐射观测系统" class="mt-5">
        <div class="mt-2 grid grid-cols-1 gap-2">
          <MetricCard
            v-for="s in solarRadiation"
            :key="s.label"
            :icon="s.icon"
            :label="s.label"
            :value="s.value"
            :unit="s.unit"
            :status="s.status"
            :hint="s.hint"
          />
        </div>
        <div class="mt-3 pt-2 border-t border-primary/20 flex items-center gap-2 text-sm text-cyan-200/60">
          <Icon icon="mdi:solar-power-variant" class="text-amber-300 text-base" />
          <span>当日峰值 1024 W/m² · 14:20</span>
        </div>
      </BasePanel>
    </template>

    <!-- ========== 楼层级 ========== -->
    <template v-else-if="level === 'floor'">
      <BasePanel :title="title" class="min-h-60">
        <div class="flex-1 min-h-0 overflow-y-auto">
          <div v-if="!currentFloor?.roomNames.length" class="px-2 py-1 text-cyan-200/50">本层未侦测到房间</div>
          <div
            v-for="name in currentFloor?.roomNames || []"
            :key="name"
            :class="[itemBase, selectedRoom === name && itemActive]"
            @click="store.enterRoom(name)"
          >
            <span class="truncate">{{ name }}</span>
            <span class="text-sm text-cyan-200/60 shrink-0">{{ rooms[name]?.meshCount ?? 0 }} 件</span>
          </div>
        </div>
      </BasePanel>
    </template>

    <!-- ========== 房间级 ========== -->
    <template v-else>
      <BasePanel :title="title" class="min-h-60">
        <div class="px-2 py-1.5 text-sm text-cyan-200/70 border-b border-cyan-400/20">
          所属：{{ currentFloor?.name ?? '—' }}
        </div>
        <div class="px-2 py-1.5 flex items-center justify-between">
          <span class="text-cyan-100">组件数</span>
          <span class="font-mono font-semibold text-primary">{{ currentRoom?.meshCount ?? 0 }}</span>
        </div>

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
      </BasePanel>
    </template>
  </div>
</template>
