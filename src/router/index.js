import { createRouter, createWebHistory } from 'vue-router'
import ViewerView from '@/views/ViewerView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'viewer',
      component: ViewerView,
      meta: { title: 'OBJ Building Demo' },
    },
  ],
})

router.afterEach((to) => {
  if (to.meta?.title) document.title = to.meta.title
})

export default router
