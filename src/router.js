// Vuex 때 처럼 create* 함수를 제공한다.
import { createWebHistory, createRouter } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home'), // 동적 import
  },
  {
    path: '/datamng',
    name: 'DataMng',
    component: () => import('@/views/dataMng'), // 동적 import
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About'),
  },
];

// 이렇게 해도 된다.
// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// });
// export default router;

export const router = createRouter({
  history: createWebHistory(),
  routes,
});