<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'

const store = useViewerStore()
const { breadcrumb, level } = storeToRefs(store)
</script>

<template>
  <div class="absolute left-1/2 top-20 -translate-x-1/2 z-20 flex items-center gap-2">
    <button
      v-if="level !== 'building'"
      class="px-3 py-1.5 text-sm rounded border border-primary/40 bg-primary/4 backdrop-blur text-cyan-100 hover:bg-primary/15 hover:text-primary transition-colors shadow-(--shadow-glow-sm)"
      @click="store.goBack"
      title="返回 (Esc)"
    >
      ← 返回
    </button>
    <div
      class="flex items-center px-3 py-1.5 gap-1 text-sm rounded border border-primary/40 bg-primary/4 backdrop-blur shadow-(--shadow-glow-sm)"
    >
      <template v-for="(c, i) in breadcrumb" :key="c.key">
        <span
          :class="[
            'cursor-pointer transition-colors',
            i === breadcrumb.length - 1 ? 'font-semibold text-primary' : 'text-cyan-100/70 hover:text-primary'
          ]"
          @click="store.goTo(c.key)"
        >
          {{ c.label }}
        </span>
        <span v-if="i < breadcrumb.length - 1" class="text-cyan-100/30">/</span>
      </template>
    </div>
  </div>
</template>
