<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'

const store = useViewerStore()
const { transparentMode, exploded } = storeToRefs(store)
const collapsed = ref(false)

const keys = [
  { key: 'T', label: '透明模式', action: () => store.toggleTransparent() },
  { key: 'E', label: '楼层爆炸', action: () => store.toggleExplode() },
  { key: 'F', label: '重新适配', action: () => store.fitView() },
  { key: 'R', label: '重设视图', action: () => store.resetView() }
]
</script>

<template>
  <div class="panel-card level-side right-3 bottom-3 top-auto!">
    <div class="panel-header flex items-center justify-between cursor-pointer" @click="collapsed = !collapsed">
      <span>控制 / 快捷键</span>
      <span class="text-xs text-primary">{{ collapsed ? '+' : '-' }}</span>
    </div>
    <div v-show="!collapsed" class="panel-body space-y-1.5">
      <div v-for="item in keys" :key="item.key" class="flex items-center justify-between gap-2 px-1">
        <span class="flex items-center gap-2">
          <kbd class="px-1.5 py-0.5 rounded border border-primary/30 bg-primary text-black text-xs font-mono">{{
            item.key
          }}</kbd>
          <span>{{ item.label }}</span>
        </span>
        <button class="btn" @click="item.action">执行</button>
      </div>
      <div class="border-t border-primary/15 pt-2 mt-2 text-xs text-slate-300 space-y-1">
        <div>Shift + 拖拽：调整剖切面</div>
        <div>鼠标左键：旋转 / 滚轮：缩放</div>
        <div>
          透明：<span :class="transparentMode ? 'text-primary font-semibold' : ''">{{
            transparentMode ? 'ON' : 'OFF'
          }}</span>
          · 爆炸：<span :class="exploded ? 'text-primary font-semibold' : ''">{{ exploded ? 'ON' : 'OFF' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
