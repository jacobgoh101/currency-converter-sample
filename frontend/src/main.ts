import Vue from 'vue';
import App from './App.vue';
import router from './router';
import VueCompositionAPI from '@vue/composition-api';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

Vue.use(VueCompositionAPI);
Vue.use(Buefy);

Vue.config.productionTip = false;
Vue.prototype.log = console.log;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
