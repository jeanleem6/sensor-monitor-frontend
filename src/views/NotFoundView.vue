<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.replace('/')
}

function goBack() {
  if (window.history.length > 1) router.back()
  else goHome()
}
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center px-6">
    <div
      class="relative px-12 py-10 rounded-lg border border-primary/30 bg-primary/4 backdrop-blur shadow-(--shadow-glow-md)"
    >
      <!-- 四角直角括号 -->
      <!-- <span class="corner-brackets top-2 left-2 border-l-2 border-t-2"></span>
      <span class="corner-brackets top-2 right-2 border-r-2 border-t-2"></span>
      <span class="corner-brackets bottom-2 left-2 border-l-2 border-b-2"></span>
      <span class="corner-brackets bottom-2 right-2 border-r-2 border-b-2"></span> -->

      <div class="flex flex-col items-center">
        <div
          class="text-[8rem] leading-none font-700 tracking-[0.15em] text-primary text-shadow-(--text-shadow-title) select-none"
        >
          404
        </div>

        <div class="mt-2 h-px w-48 bg-linear-to-r from-transparent via-primary/70 to-transparent"></div>

        <div class="mt-4 text-base tracking-[0.4em] text-cyan-100/80">PAGE NOT FOUND</div>
        <div class="mt-1 text-sm text-cyan-100/60">您访问的页面不存在或已被移除</div>

        <div class="mt-8 flex items-center gap-3">
          <button class="btn" @click="goBack">返回上一页</button>
          <button class="btn-primary" @click="goHome">回到首页</button>
        </div>
      </div>
    </div>
  </div>
</template>
