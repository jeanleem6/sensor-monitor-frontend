<script setup>
/**
 * MetricCard —— 指标卡片
 *
 * 用于呈现单一数值（图标 + 标签 + 数值 + 单位），可附状态色与提示。
 * 典型场景：气象站参数、太阳辐射、能耗读数等。
 * Props：
 *   - icon:    iconify 图标名（必填）
 *   - label:   指标名称（必填）
 *   - value:   当前数值（必填，String | Number）
 *   - unit:    单位文本（可选）
 *   - status:  normal | warning | danger，决定数值与图标颜色，默认 normal
 *   - hint:    辅助说明文本（可选，显示在数值下方）
 */
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  // normal | warning | danger
  status: { type: String, default: 'normal' },
  hint: { type: String, default: '' }
})

const statusColor = {
  normal: 'text-cyan-50',
  warning: 'text-amber-300',
  danger: 'text-rose-400'
}

const statusIconColor = {
  normal: 'text-primary',
  warning: 'text-amber-300',
  danger: 'text-rose-400'
}
</script>

<template>
  <div
    class="relative px-2.5 py-2 rounded border border-primary/20 bg-primary/4 hover:bg-primary/8 transition-colors"
  >
    <div class="flex items-center gap-1.5 text-sm text-cyan-200/70">
      <Icon :icon="icon" :class="['text-base shrink-0', statusIconColor[status]]" />
      <span class="truncate">{{ label }}</span>
    </div>
    <div class="mt-1 flex items-baseline gap-1">
      <span :class="['text-xl font-bold font-mono leading-none', statusColor[status]]">{{ value }}</span>
      <span v-if="unit" class="text-sm text-cyan-200/60">{{ unit }}</span>
    </div>
    <div v-if="hint" class="mt-1 text-sm text-cyan-200/50 leading-tight">{{ hint }}</div>
  </div>
</template>
