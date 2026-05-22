<script setup>
/**
 * GaugeRing —— 环形仪表
 *
 * 用 SVG 圆环可视化 value/max 占比，中心显示当前值与单位，下方可显示标签。
 * 适用于有阈值意义的数据（CO₂、PM2.5、PM10、电量、风速等）。
 * Props：
 *   - value:   当前数值（必填）
 *   - max:     满量程值，默认 100
 *   - label:   底部标签（可选）
 *   - unit:    单位（可选，显示在数值下方）
 *   - size:    直径像素值，默认 88
 *   - status:  normal | warning | danger，决定圆环描边颜色，默认 normal
 */
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, default: 100 },
  label: { type: String, default: '' },
  unit: { type: String, default: '' },
  size: { type: Number, default: 88 },
  // normal | warning | danger
  status: { type: String, default: 'normal' },
  // 值和单位同一行（baseline 对齐）；默认换行显示
  inline: { type: Boolean, default: false }
})

const ratio = computed(() => Math.min(1, Math.max(0, props.value / props.max)))
const radius = computed(() => props.size / 2 - 6)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - ratio.value))

const ringColor = computed(() => {
  if (props.status === 'danger') return '#fb7185'
  if (props.status === 'warning') return '#fcd34d'
  return '#13eaeb'
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="relative" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size" :height="size" class="-rotate-90">
        <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="none" stroke="rgba(19,234,235,0.12)" stroke-width="6" />
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :stroke="ringColor"
          stroke-width="6"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          class="transition-all duration-500"
        />
      </svg>
      <div v-if="inline" class="absolute inset-0 flex items-center justify-center">
        <div class="inline-flex items-baseline gap-0.5">
          <span class="text-lg font-bold font-mono text-cyan-50 leading-none">{{ value }}</span>
          <span v-if="unit" class="text-sm text-cyan-200/60 leading-none">{{ unit }}</span>
        </div>
      </div>
      <div v-else class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-lg font-bold font-mono text-cyan-50 leading-none">{{ value }}</span>
        <span v-if="unit" class="mt-0.5 text-sm text-cyan-200/60 leading-none">{{ unit }}</span>
      </div>
    </div>
    <div v-if="label" class="mt-1 text-sm text-cyan-200/70">{{ label }}</div>
  </div>
</template>
