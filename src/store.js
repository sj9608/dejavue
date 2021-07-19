import { createStore } from 'vuex'
import jsyaml from 'js-yaml'

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
      settings: {},
      projectName: (localStorage.prj_name ? localStorage.prj_name : ''),
      err_msg: '',
      bWaitWindow: false,
      dataset_conf: {},
    }
  },
  actions: {
    async loadSettings(context) {
      // console.log(context)

      //설정파일 읽어오기 
      try {

        let configData = await (await fetch(`http://${context.state.server_ip}:${context.state.server_port}/rest/download?filepath=./settings.json`)).json()
        console.log(configData)

        context.commit({ type: 'updateSettings', data: configData })

        //data.yaml 로딩 
        if (context.state.projectName && context.state.projectName != "") {
          // console.log(`${context.state.settings.dataset_base_path}/${context.state.settings.prjs[context.state.projectName].dataset_path}/data.yaml`)

          let _url = `${context.state.settings.dataset_base_path}/${context.state.settings.prjs[context.state.projectName].dataset_path}/data.yaml`;

          let dataset_conf = await (await fetch(`http://${context.state.server_ip}:${context.state.server_port}/rest/download?filepath=${_url}`)).text()

          dataset_conf = jsyaml.load(dataset_conf)

          console.log(dataset_conf)
          context.commit({ type: 'updateDataSetConf', data: dataset_conf })
        }
      }
      catch (e) {
        console.log(e)
        context.state.err_msg = 'can not load settings'

      }
    },
    async updateProjrctName(context, playload) {

      context.commit({
        type: "updateProjrctName",
        prj_name: playload.prj_name,
      });

      try {

        let _url = `${context.state.settings.dataset_base_path}/${context.state.settings.prjs[playload.prj_name].dataset_path}/data.yaml`;
        let dataset_conf = await (await fetch(`http://${context.state.server_ip}:${context.state.server_port}/rest/download?filepath=${_url}`)).text()
        dataset_conf = jsyaml.load(dataset_conf)

        console.log(dataset_conf)
        context.commit({ type: 'updateDataSetConf', data: dataset_conf })

      } catch (e) {
        console.log(e)
      }



    },
    async updateSettings(context, playload) {
      let _out = JSON.stringify(playload.data);

      let _ = await (
        await fetch(`http://${context.state.server_ip}:${context.state.server_port}/rest/upload2`, {
          method: "POST",
          body: _out,
          headers: new Headers({
            "Content-Type": "text/xml",
            "Upload-Name": "settings.json",
            "upload-path": "./",
            "file-size": _out.length,
          }),
        })
      ).json();

      console.log(_)

      //서버에 저장된것으로 다시 갱신 
      await context.dispatch('loadSettings')

      // context.commit({type:'updateSettings',data:playload.data})
    }
  },
  mutations: {
    // getSettings(state) {
    // },
    showWaitWindow(state) {
      state.bWaitWindow = true
      // console.log(state.bWaitWindow)
    },
    hideWaitWindow(state) {
      state.bWaitWindow = false
    },
    updateProjrctName(state, playload) {
      state.projectName = playload.prj_name
      console.log(state.projectName)
      localStorage.setItem('prj_name', state.projectName)
    },
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
    updateSettings(state, playload) {
      state.settings = playload.data
    },
    updateDataSetConf(state, playload) {
      state.dataset_conf = playload.data
    }
  }
})


