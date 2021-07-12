import { createApp } from 'vue'
import App from './App.vue'

import { router } from './router'; // 라우터 추가하고 
import {store}  from './store';

createApp(App).use(router).use(store).mount('#app')
