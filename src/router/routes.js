export default [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'viewer',
        component: () => import('@/views/ViewerView.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 'grid',
        name: 'grid',
        component: () => import('@/views/GridView.vue'),
        meta: { title: 'Grid' }
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: '页面未找到' }
      }
    ]
  }
]
