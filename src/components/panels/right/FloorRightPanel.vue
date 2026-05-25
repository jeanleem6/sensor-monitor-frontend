<script setup>
import BasePanel from '@/components/ui/BasePanel.vue'
import EChart from '@/components/ui/EChart.vue'
import { useViewerStore } from '@/stores/viewer'
import { storeToRefs } from 'pinia'
import { useFloorData } from '@/composables/useFloorData.js'

const store = useViewerStore()
const { selectedRoom } = storeToRefs(store)

const { roomNames, tempHumidityRows, co2Rows, irRows, scatterOption, heatmapOption } = useFloorData()

const statusText = { normal: 'text-cyan-50', warning: 'text-amber-300', danger: 'text-rose-400' }

const itemBase =
  'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-cyan-100 transition-colors hover:bg-primary/15'
const itemActive = 'bg-primary/25 hover:bg-primary/25'
</script>

<template>
  <!-- 温湿度散点 -->
  <BasePanel title="温湿度监测" class="flex-4 min-h-max">
    <div v-if="!tempHumidityRows.length" class="px-2 py-1 text-sm text-cyan-200/50">本层未侦测到房间</div>
    <div v-else class="flex-1 min-h-46">
      <EChart
        :option="scatterOption"
        height="100%"
        @chart-click="(p) => p?.data?.name && store.enterRoom(p.data.name)"
      />
    </div>
    <div class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-between text-sm text-cyan-200/60">
      <span class="flex items-center gap-1">
        <span class="size-2 rounded-sm bg-emerald-400/40 border border-emerald-400/60"></span>
        舒适区 22-26°C · 40-60%
      </span>
      <span class="flex items-center gap-1 text-cyan-200/50">
        <Icon icon="lucide:mouse-pointer-click" class="text-primary" />
        点击点进入房间
      </span>
    </div>
  </BasePanel>

  <!-- 二氧化碳 -->
  <BasePanel title="二氧化碳监测" class="flex-4 min-h-50">
    <div class="flex-1 min-h-0 overflow-y-auto">
      <div v-if="!co2Rows.length" class="px-2 py-1 text-sm text-cyan-200/50">本层未侦测到房间</div>
      <div
        v-for="r in co2Rows"
        :key="r.name"
        :class="[itemBase, selectedRoom === r.name && itemActive]"
        @click="store.enterRoom(r.name)"
      >
        <Icon icon="mdi:molecule-co2" :class="['text-base shrink-0', statusText[r.status]]" />
        <span class="flex-1 truncate text-sm">{{ r.name }}</span>
        <div class="flex-1 h-1.5 rounded bg-cyan-400/10 overflow-hidden">
          <div
            class="h-full transition-all"
            :class="{
              'bg-emerald-400': r.status === 'normal',
              'bg-amber-300': r.status === 'warning',
              'bg-rose-400': r.status === 'danger'
            }"
            :style="{ width: Math.min(100, (r.value / 2000) * 100) + '%' }"
          ></div>
        </div>
        <span :class="['font-mono text-sm shrink-0 w-16 text-right', statusText[r.status]]">{{ r.value }} ppm</span>
      </div>
    </div>
  </BasePanel>

  <!-- 红外线热力图 -->
  <BasePanel title="红外线监测" class="flex-5 min-h-73.5">
    <div v-if="!irRows.length" class="px-2 py-1 text-sm text-cyan-200/50">本层未侦测到房间</div>
    <template v-else>
      <div class="flex items-center justify-between text-sm text-cyan-200/70">
        <span class="flex items-center gap-1">
          <Icon icon="mdi:motion-sensor" class="text-primary text-base" />
          房间 × 时段 活跃度
        </span>
        <span class="text-cyan-200/50">24h</span>
      </div>
      <div class="mt-1 flex-1 min-h-0 overflow-y-auto rounded border border-primary/10 bg-primary/4 p-1">
        <EChart
          :option="heatmapOption"
          :height="Math.max(200, Math.min(600, roomNames.length * 24 + 60)) + 'px'"
          @chart-click="
            (p) => {
              const name = roomNames[p?.data?.[1]]
              if (name) store.enterRoom(name)
            }
          "
        />
      </div>
      <div class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-between text-sm text-cyan-200/60">
        <span class="flex items-center gap-1">
          <Icon icon="mdi:account-group" class="text-primary text-base" />
          当前活跃房间
          <span class="font-mono text-cyan-100 ml-1"
            >{{ irRows.filter((r) => r.occupied).length }} / {{ roomNames.length }}</span
          >
        </span>
        <span class="flex items-center gap-1 text-cyan-200/50">
          <span class="text-sm mr-1">低</span>
          <span class="h-2 w-3 rounded-sm bg-[rgba(19,234,235,0.25)] border border-primary/20"></span>
          <span class="h-2 w-3 rounded-sm bg-amber-300/55"></span>
          <span class="h-2 w-3 rounded-sm bg-rose-400"></span>
          <span class="text-sm ml-1">高</span>
        </span>
      </div>
    </template>
  </BasePanel>
</template>
