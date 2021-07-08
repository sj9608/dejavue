import { createRouter, createWebHistory } from "vue-router";


const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home')
    },
    {
        path: '/detector',
        name: 'detector',
        component: () => import('@/views/detector')
    },
    {
        path: '/opserver',
        name: 'opserver',
        component: () => import('@/views/opserver')
    },
    {
        path: '/data_mng',
        name: 'data_mng',
        component: () => import('@/views/data_mng')
    },
    {
        path: '/img_labeler',
        name: 'img_labeler',
        component: () => import('@/views/img_labeler')
    },
    {
        path: '/project_mng',
        name: 'project_mng',
        component: () => import('@/views/project_mng')
    },
    {
        path: '/trainer',
        name: 'trainer',
        component: () => import('@/views/trainer')
    },
    {
        path: '/help',
        name: 'help',
        component: () => import('@/views/Help')
    },
    {
        path: '/todo',
        name: 'todo',
        component: () => import('@/views/todo')
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});