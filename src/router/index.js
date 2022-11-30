import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: () => import('@/views/recommend')
  },
  {
    path: '/singer',
    name: 'singer',
    component: () => import('@/views/singer')
  },
  {
    path: '/top-list',
    name: 'topList',
    component: () => import('@/views/topList')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/search')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
