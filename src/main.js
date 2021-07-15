import { createApp } from 'vue'
import { router } from './router'; 
import {store}  from './store';
import App from './App.vue'

createApp(App).use(router).use(store).mount('#app') // 메서드 체인 (함수형 프로그래밍)

