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
      }
    ]
  }
]
