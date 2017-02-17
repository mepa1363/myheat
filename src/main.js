import Vue from 'vue'
import App from './App.vue'
import VueMaterial from 'vue-material'
import {store} from './store'

Vue.use(VueMaterial)

Vue.material.registerTheme('default', {
  primary: 'blue',
  accent: 'indigo',
  warn: 'red'
})

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
