import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ViewerView from '@/views/ViewerView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'viewer',
          component: ViewerView,
          meta: { title: 'Dashboard' }
        }
      ]
    }
  ]
})

router.afterEach((to) => {
  if (to.meta?.title) document.title = to.meta.title
})

export default router
