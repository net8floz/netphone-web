import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import vuetify from '@/plugins/vuetify';
import '@/plugins/auth';
import apolloProvider from '@/plugins/apollo';
import '@/scss/main.scss';

console.log("BEGIN");
console.log(process.env);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app');
