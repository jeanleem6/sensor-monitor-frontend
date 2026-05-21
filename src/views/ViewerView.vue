<script setup>
import { storeToRefs } from 'pinia'
import { useViewerStore } from '@/stores/viewer'
import AppHeader from '@/components/layout/AppHeader.vue'
import LevelBreadcrumb from '@/components/layout/LevelBreadcrumb.vue'
import ThreeViewer from '@/components/scene/ThreeViewer.vue'
import InfoPanel from '@/components/scene/InfoPanel.vue'
import LevelLeftPanel from '@/components/panels/LevelLeftPanel.vue'
import LevelRightPanel from '@/components/panels/LevelRightPanel.vue'
import LevelBottomPanel from '@/components/panels/LevelBottomPanel.vue'
import BuildingAlarmStrip from '@/components/panels/BuildingAlarmStrip.vue'

const store = useViewerStore()
const { loading, level } = storeToRefs(store)
</script>

<template>
  <div
    class="relative h-screen w-screen overflow-hidden bg-[url(/imgs/model-bg.png)] bg-size-[auto_100%] bg-no-repeat bg-center"
  >
    <ThreeViewer />
    <AppHeader />

    <transition
      enter-active-class="transition duration-100"
      leave-active-class="transition duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-dark/85 backdrop-blur-sm"
      >
        <div class="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <div class="mt-3 text-sm text-cyan-100/80 tracking-widest">模型加载中...</div>
      </div>
    </transition>

    <template v-if="!loading">
      <LevelBreadcrumb />
      <LevelLeftPanel />
      <LevelRightPanel />
      <BuildingAlarmStrip v-if="level === 'building'" />
      <LevelBottomPanel v-else />
      <InfoPanel />
    </template>
  </div>
</template>
