<script setup>
// 两侧 SVG 线条 + 中间标题（中间用 CSS 线衔接两侧 SVG 线端点）
</script>

<template>
  <header class="absolute top-0 left-0 right-0 z-30 h-16 flex pointer-events-none select-none">
    <!-- 左侧线条 -->
    <div class="flex-1 mt-7 bg-[url(/imgs/header-left-line.svg)] bg-top-right bg-size-[auto_100%] bg-no-repeat" />

    <!-- 标题 -->
    <div class="relative h-full flex items-center px-8 whitespace-nowrap">
      <div class="absolute -left-px -right-px bottom-px h-px bg-primary" />
      <span class="relative text-2xl font-bold tracking-[0.4em] text-primary text-shadow-(--text-shadow-title)"
        >设备监测系统</span
      >
    </div>

    <!-- 右侧线条 -->
    <div class="flex-1 mt-7 bg-[url(/imgs/header-right-line.svg)] bg-top-left bg-size-[auto_100%] bg-no-repeat" />
  </header>
</template>
