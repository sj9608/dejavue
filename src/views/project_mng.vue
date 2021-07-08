<template>
  <div class="box-unit">
    <div>name : <input v-model="prj_name" /></div>

    <div>
      base ip : <input v-model="base_ip" /><br />
      rest port : <input v-model="rest_port" class="half_size" /><br />
      wine port : <input v-model="wine_port" class="half_size" /><br />
    </div>

    <div>
      dataset path : <input v-model="dataset_path" class="full_size" /> <br />
      uplload path : <input v-model="upload_path" class="full_size" /> <br />
      repos path : <input v-model="repos_path" class="full_size" /> <br />
    </div>

    <div class="box-unit">image size : <input v-model="imgsz" class="full_size" /></div>

    <div class="box-unit">
      <!-- <button class="apply">apply</button> -->
      <button class="delete">delete</button>
      <button class="export">export</button>
      <button class="clear">clear</button>
      <button class="add">Add Proejct</button>
    </div>

    <div id="prj_list" class="box-unit">
      <ul></ul>
    </div>
  </div>
  <div id="log_text">{{ logMessage }}</div>
</template>

<script>
export default {
  name: "ProjectManager",
  data() {
    // 데이터
    return {
      logMessage: "",
      prj_name: "",
      base_ip: "",
      rest_port: "20831",
      wine_port: "20833",
      dataset_path: "",
      upload_path: "",
      repos_path: "",
      imgsz: "",
    };
  },
  methods: {
    addLog(msg) {
      // add Log to HTML
      this.logMessage = msg;
    },
    _Storage2Dom() {
      // configData load from LocalStorage to v-model
      this.prj_name = localStorage.prj_name;
      this.base_ip = localStorage.base_ip;
      this.rest_port = localStorage.rest_port;
      this.wine_port = localStorage.wine_port;
      this.dataset_path = localStorage.dataset_path;
      this.upload_path = localStorage.upload_path;
      this.repos_path = localStorage.repos_path;
      this.imgsz = localStorage.imgsz;
    },
    _Dom2Storage() {
      // configData save from v-model to localStorage
      localStorage.prj_name = this.prj_name;
      localStorage.base_ip = this.base_ip;
      localStorage.rest_port = this.rest_port;
      localStorage.wine_port = this.wine_port;
      localStorage.dataset_path = this.dataset_path;
      localStorage.upload_path = this.upload_path;
      localStorage.repos_path = this.repos_path;
      localStorage.imgsz = this.imgsz;
    },
  },
  async mounted() {
    // 앱실행시

    let configData = {
      prjs: {},
    };

    // configData json 형식으로 서버에 업로드 (POST)
    // async function _saveConfig() {
    //     let _out = JSON.stringify(configData)

    //     let _ = await (await (fetch(`http://${localStorage.base_ip}:${localStorage.rest_port}/rest/upload2`, {
    //         method: 'POST',
    //         body: _out,
    //         headers: new Headers({
    //             'Content-Type': 'text/xml',
    //             'Upload-Name': '__config.json',
    //             'upload-path': './',
    //             'file-size': _out.length
    //         })
    //     }))).json();
    //     console.log(_);
    //     return _;
    // }

    const dom_prj_list = document.querySelector('#prj_list ul')

    // 설정파일 읽기
    if (localStorage.prj_name) {
        this._Storage2Dom();
        this.addLog(`prject ready : ${localStorage.prj_name}`);
    }
    else {
        // 나중에 location.hostname, port, port + 3 등등 수정해줘야함
        this.prj_name = "__name";
        // this.base_ip = location.hostname;
        this.base_ip = 'gears001.iptime.org'
        // this.rest_port = parseInt(location.port);
        this.rest_port = 21030
        this.wine_port = 21033;
        this.dataset_path = '../../dataset/';
        this.upload_path = '../../dataset/';
        this.imgsz = 416;
    }

    // 설정파일 읽어오기
    try {
        // let port = parseInt(location.port);
        let port = 21030;
        if (localStorage.rest_port) {
            port = localStorage.rest_port;
        }
        // 나중에 이부분 location.hostname, port로 바꿔야함
        configData = await (await fetch(`http://${this.base_ip}:${port}/rest/download?filepath=./__config.json`)).json();
        console.log(configData);

         for (let name in configData.prjs) {
             console.log(name);
             let _li = document.createElement('li')
             _li.name = name
             _li.innerText = name
             dom_prj_list.appendChild(_li);
         }
    }
    catch(e) {
        console.log(e);
    }

    // 리스트 클릭 이벤트
    dom_prj_list.addEventListener('click', async(evt) => {
      let name = evt.target.name;
      let _prj_config = configData.prjs[name];


      this.prj_name = localStorage.prj_name = name;
      this.base_ip = localStorage.base_ip = _prj_config.base_ip;
      this.rest_port = localStorage.rest_port = _prj_config.rest_port;
      this.wine_port = localStorage.wine_port = _prj_config.wine_port;

      this.repos_path = localStorage.repos_path = configData.repos_path;
      this.dataset_path = localStorage.dataset_path = `${_prj_config.dataset_path}`;
      this.upload_path = localStorage.upload_path = `${_prj_config.upload_path}`;

      this.imgsz = localStorage.imgsz = _prj_config.imgsz;
      this.addLog(`prject ready : ${localStorage.prj_name}`)
    })

  },
};
</script>

<style>
@import "../assets/scss/core.scss";
</style>