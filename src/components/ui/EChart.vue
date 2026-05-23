<script setup>
/**
 * EChart —— ECharts 通用封装
 *
 * 接收响应式 option 自动渲染并随容器尺寸 resize，组件卸载时释放实例。
 * Props：
 *   - option:  ECharts 完整配置对象（必填，响应式）
 *   - height:  容器高度，默认 100%
 * Events：
 *   - chart-click: 透传 echarts click（包含 dataIndex / data / name 等）
 */
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'
import echarts from '@/plugins/echarts'

const props = defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '100%' }
})

const emit = defineEmits(['chart-click'])

const chartEl = ref(null)
const chart = shallowRef(null)
let ro = null

onMounted(() => {
  chart.value = echarts.init(chartEl.value, null, { renderer: 'canvas' })
  chart.value.setOption(props.option, true)
  chart.value.on('click', (params) => emit('chart-click', params))
  ro = new ResizeObserver(() => chart.value?.resize())
  ro.observe(chartEl.value)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  chart.value?.dispose()
  chart.value = null
})

watch(
  () => props.option,
  (o) => chart.value?.setOption(o, true),
  { deep: true }
)
</script>

<template>
  <div ref="chartEl" :style="{ width: '100%', height }"></div>
</template>
