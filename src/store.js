import { createStore } from 'vuex'

// Create a new store instance.
export const store = createStore({
  state() {

    let _server_ip = ''
    let _server_port = 0
    if (localStorage.getItem('server_ip') && localStorage.getItem('server_port')) {
      // _settings = JSON.parse(localStorage.getItem('settings'))
      _server_ip = localStorage.getItem('server_ip')
      _server_port = localStorage.getItem('server_port')

    }

    console.log('ready state')


    return {
      // count: 0,
      // settings_ready : false,
      server_ip: _server_ip,
      server_port: _server_port,
      settings : {},
      err_msg : ''
    }
  },
  actions : {
    async loadSettings(context) {
      console.log(context)

      //설정파일 읽어오기 
      try {

        let configData = await(await fetch(`http://${context.state.server_ip}:${context.state.server_port}/rest/download?filepath=./settings.json`)).json()
        console.log(configData)

        context.commit({type : 'updateSettings',data : configData})
        

      }
      catch (e) {
        console.log(e)
        context.state.err_msg = 'can not load settings'

      }


    }
  },
  mutations: {
    // getSettings(state) {
    // },
    updateServerIp(state, playload) {
      // console.log(playload)
      state.server_ip = playload.server_ip
      localStorage.setItem('server_ip', state.server_ip)

    },
    updateServerPort(state, playload) {
      // console.log(playload)
      state.server_port = playload.server_port
      localStorage.setItem('server_port', state.server_port)

    },
    updateSettings(state,playload) {

      state.settings = playload.data

    }
    // increment (state) {
    //   state.count++
    // },
    // decrement (state) {
    //   state.count--
    // },
    // setvalue(state,playload) {
    //   state.count = playload.value
    // }
  }
})


