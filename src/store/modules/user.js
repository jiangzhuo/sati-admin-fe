// import { loginByUsername, logout, getUserInfo } from '@/api/login'
// import { logout } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
// import USER_LOGIN from '@/graphqls/userLoginByMobileAndPassword.graphql'

const user = {
  state: {
    user: '',
    status: '',
    code: '',
    id: '',
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    setting: {
      articlePlatform: []
    }
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_ID: (state, id) => {
      state.id = id
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit, vue }, tokenRes) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', 'bearer ' + tokenRes.accessToken)
        setToken('bearer ' + tokenRes.accessToken, tokenRes.expiresIn)
        resolve()
      })
      // return new Promise((resolve, reject) => {
      //
      //
      //
      //   loginByUsername(username, userInfo.password).then(response => {
      //     const data = response.data
      //     commit('SET_TOKEN', data.token)
      //     setToken(response.data.token)
      //     resolve()
      //   }).catch(error => {
      //     reject(error)
      //   })
      // })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }, response) {
      console.log(response)
      return new Promise((resolve, reject) => {
        if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
          reject('error')
        }
        const data = response.data
        const ROLE_MAP = {
          sadmin: 0b1,
          admin: 0b10,
          editor: 0b100
        }
        if (data.role === 0) {
          reject('no permission')
        }
        data.roles = []
        Object.entries(ROLE_MAP).forEach(([key, value]) => {
          console.log(key, value)
          if (data.role & value) {
            data.roles.push(key)
          }
        })
        // data.roles = ['admin']

        if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
          commit('SET_ROLES', data.roles)
        } else {
          reject('getInfo: roles must be a non-null array !')
        }
        console.log(data)
        commit('SET_NAME', data.nickname)
        commit('SET_AVATAR', data.avatar)
        commit('SET_INTRODUCTION', data.introduction)
        commit('SET_ID', data.id)
        resolve(response)
        // getUserInfo(state.token).then(response => {
        //   if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
        //     reject('error')
        //   }
        //   const data = response.data
        //
        //   if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
        //     commit('SET_ROLES', data.roles)
        //   } else {
        //     reject('getInfo: roles must be a non-null array !')
        //   }
        //
        //   commit('SET_NAME', data.name)
        //   commit('SET_AVATAR', data.avatar)
        //   commit('SET_INTRODUCTION', data.introduction)
        //   resolve(response)
        // }).catch(error => {
        //   reject(error)
        // })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resolve()
        // logout(state.token).then(() => {
        //   commit('SET_TOKEN', '')
        //   commit('SET_ROLES', [])
        //   removeToken()
        //   resolve()
        // }).catch(error => {
        //   reject(error)
        // })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles({ commit, dispatch }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        setToken(role)
        // getUserInfo(role).then(response => {
        //   const data = response.data
        //   commit('SET_ROLES', data.roles)
        //   commit('SET_NAME', data.name)
        //   commit('SET_AVATAR', data.avatar)
        //   commit('SET_INTRODUCTION', data.introduction)
        //   dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
        //   resolve()
        // })
      })
    }
  }
}

export default user
