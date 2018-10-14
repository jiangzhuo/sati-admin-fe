import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { createApolloClient, restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client'

// Install the vue plugin
Vue.use(VueApollo)

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint: process.env.BASE_API,
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  // wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:5000/graphql',
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,
  // Override default http link
  // link: myLink,
  // Override default cache
  // cache: myCache,
  // Additional ApolloClient options
  // apollo: { ... }
  getAuth: tokenName => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem(tokenName)
    // return the headers to the context so httpLink can read them
    return token || ''
  }
}

// Call this in the Vue app file
export function createProvider(options = {}, { router }) {
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient({
    ...defaultOptions,
    ...options
  })
  apolloClient.wsClient = wsClient

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        fetchPolicy: 'cache-and-network'
      }
    },
    errorHandler(error) {
      if (isUnauthorizedError(error)) {
        // Redirect to login page
        if (router.currentRoute.name !== 'login') {
          router.replace({
            name: 'login',
            params: {
              wantedRoute: router.currentRoute.fullPath
            }
          })
        }
      } else {
        console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;', error.message)
      }
    }
  })

  return apolloProvider
}

// Manually call this when user log in
export async function onLogin(apolloClient, token) {
  localStorage.setItem(AUTH_TOKEN, token)
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    if (!isUnauthorizedError(e)) {
      console.log('%cError on cache reset (login)', 'color: orange;', e.message)
    }
  }
}

// Manually call this when user log out
export async function onLogout(apolloClient) {
  localStorage.removeItem(AUTH_TOKEN)
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    if (!isUnauthorizedError(e)) {
      console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
    }
  }
}

function isUnauthorizedError(error) {
  const { graphQLErrors } = error
  return (graphQLErrors && graphQLErrors.some(e => e.message === 'Unauthorized'))
}
// import Vue from 'vue'
// import { ApolloClient } from 'apollo-client'
// import { split } from 'apollo-link'
// import { HttpLink } from 'apollo-link-http'
// import { InMemoryCache } from 'apollo-cache-inmemory'
// import { WebSocketLink } from 'apollo-link-ws'
// import { getMainDefinition } from 'apollo-utilities'
// import { createPersistedQueryLink } from 'apollo-link-persisted-queries'
// import VueApollo from 'vue-apollo'
//
// // Install the vue plugin
// Vue.use(VueApollo)
//
// // Create the apollo client
// export function createApolloClient ({ ssr, req }) {
//   let link
//
//   const httpLink = createPersistedQueryLink().concat(
//     new HttpLink({
//       // You should use an absolute URL here
//       uri: 'http://localhost:5000/graphql',
//       credentials: 'include',
//       ...(ssr ? {
//         headers: {
//           cookie: req.header('Cookie'),
//         },
//       } : {}),
//     })
//   )
//
//   const cache = new InMemoryCache()
//
//   if (!ssr) {
//     // If on the client, recover the injected state
//     if (typeof window !== 'undefined') {
//       const state = window.__APOLLO_STATE__
//       if (state) {
//         // If you have multiple clients, use `state.<client_id>`
//         cache.restore(state.defaultClient)
//       }
//     }
//
//     // Create the subscription websocket link
//     const wsLink = new WebSocketLink({
//       uri: 'ws://localhost:5000/graphql',
//       options: {
//         reconnect: true,
//       }
//     })
//
//     // using the ability to split links, you can send data to each link
//     // depending on what kind of operation is being sent
//     link = split(
//       // split based on operation type
//       ({ query }) => {
//         const { kind, operation } = getMainDefinition(query)
//         return kind === 'OperationDefinition' &&
//           operation === 'subscription'
//       },
//       wsLink,
//       httpLink
//     )
//   } else {
//     link = httpLink
//   }
//
//   const apolloClient = new ApolloClient({
//     link,
//     cache,
//     ...(ssr ? {
//       // Set this on the server to optimize queries when SSR
//       ssrMode: true,
//     } : {
//       // This will temporary disable query force-fetching
//       ssrForceFetchDelay: 100,
//       // Apollo devtools
//       connectToDevTools: process.env.NODE_ENV !== 'production',
//     }),
//   })
//
//   return apolloClient
// }
