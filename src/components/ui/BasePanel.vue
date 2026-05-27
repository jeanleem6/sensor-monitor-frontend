<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div
    class="panel-hoverable relative overflow-visible flex flex-col text-body border border-primary/30 bg-primary/4 backdrop-blur-md"
  >
    <!-- 四角上的直角括号 -->
    <!-- <span class="corner-brackets -top-px -left-px border-t-2 border-l-2" aria-hidden="true"></span>
    <span class="corner-brackets -top-px -right-px border-t-2 border-r-2" aria-hidden="true"></span>
    <span class="corner-brackets -bottom-px -left-px border-b-2 border-l-2" aria-hidden="true"></span>
    <span class="corner-brackets -bottom-px -right-px border-b-2 border-r-2" aria-hidden="true"></span> -->

    <!-- Title 光晕 -->
    <div
      class="absolute -z-1 -top-2.5 w-15 h-15 left-1/2 -translate-x-1/2 rounded-full bg-radial from-primary/50 to-primary/0 to-60% opacity-40"
    ></div>

    <!-- title -->
    <div class="relative shrink-0">
      <!-- max-w 对齐窄栏 panel 宽度（400px），保证 SVG 在宽 panel 中也以约 400x23 渲染，
           顶部留出自然空隙，避免 SVG 等比拉伸后几乎贴住顶部边框 -->
      <div
        class="mx-auto max-w-100 text-center text-base font-semibold text-primary tracking-widest py-1.5 select-none bg-no-repeat bg-bottom bg-size-[100%_auto] bg-[url(/imgs/title-line-down.svg)]"
      >
        {{ title }}
      </div>
    </div>

    <!-- content -->
    <div class="flex-1 min-h-0 flex flex-col pt-3 pb-4 px-5 text-sm">
      <slot />
    </div>
  </div>
</template>
