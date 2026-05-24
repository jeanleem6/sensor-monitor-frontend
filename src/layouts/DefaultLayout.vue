<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppNavMenu from '@/components/layout/AppNavMenu.vue'
</script>

<template>
  <div
    class="relative h-screen w-screen overflow-hidden bg-[url(/imgs/model-bg.png)] bg-size-[auto_100%] bg-no-repeat bg-center"
  >
    <AppHeader />
    <router-view />
    <AppNavMenu />
  </div>
</template>
