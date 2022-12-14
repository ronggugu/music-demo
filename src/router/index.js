// 这是vue3.0提供的两种路由模式路径 createWebHistory不带#号，在生产环境下不能直接访问项目，需要nginx转发
import { createRouter, createWebHashHistory } from 'vue-router'
// import { createRouter, createWebHistory } from 'vue-router'

// 异步组件
const Recommend = () => import('@/views/recommend'/* webpackChunkName: 'recommend' */)
const Search = () => import('@/views/search'/* webpackChunkName: 'search' */)
const Singer = () => import('@/views/singer'/* webpackChunkName: 'singer' */)
const TopList = () => import('@/views/top-list'/* webpackChunkName: 'top-list' */)

const Album = () => import('@/views/album'/* webpackChunkName: 'album' */)
const SingerDetail = () => import('@/views/singer-detail'/* webpackChunkName: 'singer-detail' */)
const TopDetail = () => import('@/views/top-detail'/* webpackChunkName: 'top-detail' */)

const UserCenter = () => import('@/views/user-center'/* webpackChunkName: 'user-center' */)

const routes = [
    {
        path: '/',
        redirect: '/recommend'
    },
    {
        path: '/recommend',
        component: Recommend,
        children: [
            {
                path: ':id',
                component: Album
            }
        ]
    },
    {
        path: '/search',
        component: Search,
        children: [
            {
                path: ':id',
                component: SingerDetail
            }
        ]
    },
    {
        path: '/singer',
        component: Singer,
        children: [
            {
                path: ':id',
                component: SingerDetail
            }
        ]
    },
    {
        path: '/top-list',
        component: TopList,
        children: [
            {
                path: ':id',
                component: TopDetail
            }
        ]
    },
    {
        path: '/user',
        components: {
            user: UserCenter
        }
    }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
