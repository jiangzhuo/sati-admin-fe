import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import i18n from './lang' // Internationalization
import './icons' // icon
import './errorLog' // error log
import './permission' // permission control
// import './mock' // simulation data

import * as filters from './filters' // global filters

// import ApolloClient from 'apollo-boost'
// import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'
// import VueApollo from 'vue-apollo'
import { createProvider } from './vue-apollo'

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})
// const apolloProvider = new VueApollo({
//   defaultClient: new ApolloClient({
//     uri: 'http://localhost:5000/graphql'
//   })
// })

// Vue.use(VueApollo)

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  // apolloProvider,
  apolloProvider: createProvider({}, { router }),
  // provide: createProvider({}, { router }).provide(),
  render: h => h(App)
})
