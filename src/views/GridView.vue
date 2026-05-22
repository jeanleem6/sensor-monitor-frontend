<script setup>
import BasePanel from '@/components/ui/BasePanel.vue'
</script>

<template>
  <div class="h-[calc(100vh-4rem)] grid grid-cols-3 grid-rows-2 gap-4 p-12">
    <BasePanel v-for="i in 6" :key="i" :title="`Grid ${i}`">
      <div>Grid Item {{ i }}</div>
    </BasePanel>
  </div>
</template>
