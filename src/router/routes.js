export default [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'monitor',
        component: () => import('@/views/MonitorView.vue'),
        meta: { title: '建筑实时监测子系统' }
      },
      {
        path: 'lab-dayou',
        name: 'lab-dayou',
        component: () => import('@/views/LabDayouView.vue'),
        meta: { title: '专业实验与教学子系统 · 大有' }
      },
      {
        path: 'lab-chint',
        name: 'lab-chint',
        component: () => import('@/views/LabChintView.vue'),
        meta: { title: '专业实验与教学子系统 · 正泰' }
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
