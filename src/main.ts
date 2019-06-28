import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueAxios from 'vue-axios';
import axios from './libnary/request/axios';

import App from './App.vue';
import router from './router';
import store from './store';
// import Util from './libnary/util/util';
import '@/assets/css/style.css';

Vue.use(ElementUI);
// Vue.use(Util);
Vue.use(VueAxios, axios);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
