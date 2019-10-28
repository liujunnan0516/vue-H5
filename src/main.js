// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from './util/axios'
import dialog from '@/plugin/dialog'
//ui 框架
import Vant from 'vant'

Vue.use(Vant);

Vue.config.productionTip = false

Vue.prototype.$dialog = dialog
Vue.prototype.$axios = axios
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
