console.log("BEGIN");
console.log(process.env);

import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import vuetify from '@/plugins/vuetify';
import '@/plugins/auth';
import apolloProvider from '@/plugins/apollo';
import '@/scss/main.scss';



Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app');
