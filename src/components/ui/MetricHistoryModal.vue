<script setup>
import BaseModal from './BaseModal.vue'
import EChart from './EChart.vue'

// statDefs: [{ key, label, cls, unit }]
// statValues: { [key]: value }
defineProps({
  modelValue:  { type: Boolean, default: false },
  title:       { type: String,  default: '' },
  icon:        { type: String,  default: '' },
  statDefs:    { type: Array,   default: () => [] },
  statValues:  { type: Object,  default: () => ({}) },
  chartOption: { type: Object,  default: null },
  width:       { type: String,  default: '700px' }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    :icon="icon"
    :width="width"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="grid grid-cols-4 gap-3 mb-4">
      <div
        v-for="s in statDefs"
        :key="s.key"
        class="rounded border border-primary/20 bg-primary/6 p-2.5 text-center"
      >
        <div class="text-sm text-cyan-200/60">{{ s.label }}</div>
        <div :class="['text-xl font-bold font-mono mt-1', s.cls]">{{ statValues[s.key] }}</div>
        <div class="text-sm text-cyan-200/50">{{ s.unit }}</div>
      </div>
    </div>
    <EChart v-if="chartOption" :option="chartOption" height="260px" />
    <template #footer>
      <button class="btn" @click="emit('update:modelValue', false)">关闭</button>
    </template>
  </BaseModal>
</template>
