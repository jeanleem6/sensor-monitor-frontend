<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import BasePanel from '@/components/ui/BasePanel.vue'
import EChart from '@/components/ui/EChart.vue'
import MetricHistoryModal from '@/components/ui/MetricHistoryModal.vue'
import CollapsedSummary from '@/components/panels/CollapsedSummary.vue'
import { useRoomData } from '@/composables/useRoomData.js'

const { sidesCollapsed } = storeToRefs(useViewerStore())

const {
  acTodayKwh,
  acPeakHour,
  acHistoryStat,
  acTrendOpt,
  acHistoryOpt,
  lightTodayKwh,
  lightHistoryStat,
  lightTrendOpt,
  lightHistoryOpt,
  irCurrentActivity,
  irOccupied,
  irHistoryStat,
  irTrendOpt,
  irHistoryOpt
} = useRoomData()

const acModal = ref(false)
const lightModal = ref(false)
const irModal = ref(false)

const AC_STATS = [
  { key: 'today', label: '今日', cls: 'text-primary', unit: 'kWh' },
  { key: 'max', label: '30日最高', cls: 'text-rose-400', unit: 'kWh' },
  { key: 'min', label: '30日最低', cls: 'text-emerald-300', unit: 'kWh' },
  { key: 'avg', label: '30日均值', cls: 'text-cyan-50', unit: 'kWh' }
]
const LIGHT_STATS = [
  { key: 'today', label: '今日', cls: 'text-amber-300', unit: 'kWh' },
  { key: 'max', label: '30日最高', cls: 'text-rose-400', unit: 'kWh' },
  { key: 'min', label: '30日最低', cls: 'text-emerald-300', unit: 'kWh' },
  { key: 'avg', label: '30日均值', cls: 'text-cyan-50', unit: 'kWh' }
]
const IR_STATS = [
  { key: 'today', label: '今日', cls: 'text-primary', unit: '占用小时' },
  { key: 'max', label: '30日最多', cls: 'text-rose-400', unit: '占用小时' },
  { key: 'min', label: '30日最少', cls: 'text-emerald-300', unit: '占用小时' },
  { key: 'avg', label: '30日均值', cls: 'text-cyan-50', unit: '占用小时' }
]

// ---- 折叠态摘要 ----
const acMetrics = computed(() => [
  { icon: 'mdi:flash', label: '今日', value: acTodayKwh.value, unit: 'kWh' },
  { icon: 'mdi:clock-outline', label: '峰值时段', value: acPeakHour.value.hour },
  { icon: 'mdi:chart-bell-curve', label: '峰值功率', value: acPeakHour.value.value, unit: 'kWh/h' }
])
const lightMetrics = computed(() => [
  { icon: 'mdi:flash', label: '今日', value: lightTodayKwh.value, unit: 'kWh' },
  { icon: 'mdi:trending-up', label: '月均最高', value: lightHistoryStat.value.max, unit: 'kWh/日' }
])
const irMetrics = computed(() => [
  {
    icon: 'mdi:motion-sensor',
    label: '当前状态',
    valueIcon: irOccupied.value ? 'mdi:account' : 'mdi:account-off-outline',
    value: irOccupied.value ? '有人' : '空闲',
    status: irOccupied.value ? 'warning' : 'normal'
  },
  { icon: 'mdi:pulse', label: '活跃度', value: irCurrentActivity.value, unit: '%' }
])
</script>

<template>
  <!-- 折叠态：纯数据摘要 -->
  <template v-if="sidesCollapsed">
    <CollapsedSummary title="空调能耗" icon="mdi:air-conditioner" :metrics="acMetrics" />
    <CollapsedSummary title="灯光插座" icon="mdi:lightbulb-on-outline" :metrics="lightMetrics" />
    <CollapsedSummary title="红外线" icon="mdi:motion-sensor" :metrics="irMetrics" />
  </template>

  <!-- 展开态：完整内容 -->
  <template v-else>
  <!-- 空调能耗 -->
  <BasePanel title="空调能耗" class="flex-1 min-h-max">
    <div class="flex items-center justify-between mb-3">
      <div>
        <span class="text-3xl font-bold font-mono text-cyan-50">{{ acTodayKwh }}</span>
        <span class="ml-1 text-sm text-cyan-200/60">kWh 今日</span>
      </div>
      <div class="text-right text-sm">
        <div class="text-cyan-200/60">
          峰值时段：<span class="font-mono text-primary">{{ acPeakHour.hour }}</span>
        </div>
        <div class="font-mono text-xs text-cyan-100">{{ acPeakHour.value }} kWh/h</div>
      </div>
    </div>
    <div class="flex items-center gap-1 text-sm text-cyan-200/60 mb-1">
      <Icon icon="mdi:clock-outline" class="text-primary text-base" />
      24小时逐时用电
    </div>
    <div class="flex-1 min-h-23">
      <EChart :option="acTrendOpt" height="100%" />
    </div>
    <div
      class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
      @click="acModal = true"
    >
      <Icon icon="lucide:history" class="text-sm" />
      <span>查看历史数据</span>
      <Icon icon="lucide:chevron-right" class="text-sm" />
    </div>
  </BasePanel>

  <!-- 灯光插座能耗 -->
  <BasePanel title="灯光插座能耗" class="flex-1 min-h-max">
    <div class="flex items-center justify-between mb-3">
      <div>
        <span class="text-3xl font-bold font-mono text-cyan-50">{{ lightTodayKwh }}</span>
        <span class="ml-1 text-sm text-cyan-200/60">kWh 今日</span>
      </div>
      <div class="text-right text-sm">
        <div class="text-cyan-200/60">
          月均最高：<span class="font-mono text-amber-300">{{ lightHistoryStat.max }}</span>
        </div>
        <div class="text-xs text-cyan-200/50">kWh / 日</div>
      </div>
    </div>
    <div class="flex items-center gap-1 text-sm text-cyan-200/60 mb-1">
      <Icon icon="mdi:lightbulb-on-outline" class="text-amber-300 text-base" />
      24小时逐时用电
    </div>
    <div class="flex-1 min-h-23">
      <EChart :option="lightTrendOpt" height="100%" />
    </div>
    <div
      class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
      @click="lightModal = true"
    >
      <Icon icon="lucide:history" class="text-sm" />
      <span>查看历史数据</span>
      <Icon icon="lucide:chevron-right" class="text-sm" />
    </div>
  </BasePanel>

  <!-- 红外线传感器 -->
  <BasePanel title="红外线传感器" class="flex-1 min-h-max">
    <div class="flex items-center justify-between gap-3 mb-3">
      <div
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-semibold',
          irOccupied
            ? 'border-amber-300/50 bg-amber-300/10 text-amber-300'
            : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
        ]"
      >
        <span :class="['size-2 rounded-full animate-pulse', irOccupied ? 'bg-amber-300' : 'bg-emerald-400']"></span>
        {{ irOccupied ? '有人在室' : '无人空置' }}
      </div>
      <div class="text-sm">
        <div class="text-cyan-200/60">
          当前活跃度：
          <span
            class="font-mono text-lg font-bold"
            :class="
              irCurrentActivity > 60 ? 'text-rose-400' : irCurrentActivity > 30 ? 'text-amber-300' : 'text-primary'
            "
          >
            {{ irCurrentActivity }}%
          </span>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1 text-sm text-cyan-200/60 mb-1">
      <Icon icon="mdi:motion-sensor" class="text-primary text-base" />
      24小时活跃度
    </div>
    <div class="flex-1 min-h-23">
      <EChart :option="irTrendOpt" height="100%" />
    </div>
    <div
      class="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center gap-1 text-sm text-primary/80 hover:text-primary cursor-pointer"
      @click="irModal = true"
    >
      <Icon icon="lucide:history" class="text-sm" />
      <span>查看历史数据</span>
      <Icon icon="lucide:chevron-right" class="text-sm" />
    </div>
  </BasePanel>
  </template>

  <!-- 历史 Modals -->
  <MetricHistoryModal
    v-model="acModal"
    title="空调能耗历史"
    icon="mdi:air-conditioner"
    :stat-defs="AC_STATS"
    :stat-values="acHistoryStat"
    :chart-option="acHistoryOpt"
  />
  <MetricHistoryModal
    v-model="lightModal"
    title="灯光插座能耗历史"
    icon="mdi:lightbulb-on-outline"
    :stat-defs="LIGHT_STATS"
    :stat-values="lightHistoryStat"
    :chart-option="lightHistoryOpt"
  />
  <MetricHistoryModal
    v-model="irModal"
    title="红外线传感器历史"
    icon="mdi:motion-sensor"
    :stat-defs="IR_STATS"
    :stat-values="irHistoryStat"
    :chart-option="irHistoryOpt"
  />
</template>
