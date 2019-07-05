import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueAxios from 'vue-axios';
import axios from './libnary/request/axios';

import App from './App.vue';
import router from './router';
import store from './store';
import Util, { IUtil } from './libnary/util/util';
import '@/assets/css/style.css';

Vue.use(ElementUI);
Vue.use(VueAxios, axios);

Vue.config.productionTip = false;


// 给 vue 声明全局方法
declare module 'vue/types/vue' {
  interface Vue {
    $util: IUtil;
  }
}
Vue.prototype.$util = Util;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
