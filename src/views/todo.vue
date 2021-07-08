<template>
  <body>
    <div style="text-align: center">
      <h1>Project List</h1>
      <a class="box-unit" style="padding: 10px 50px">{{ prjState }}</a>

      <ul id="prj_list">
        <li>
          <a @click="list2dom" v-for="item in items" :key="item">
            {{ item.name }}<br/>
          </a>
        </li>
      </ul>

      <button @click="toggle_detail" class="detail_button">
        {{ detail_button_txt }}
      </button>

      <!-- 디테일 -->
      <div v-if="on_detail">
        <div class="box-unit">
          <div>name : <input v-model="prj_name" /></div>

          <div>
            base ip : <input v-model="base_ip" /><br />
            rest port : <input v-model="rest_port" /><br />
            wine port : <input v-model="wine_port" /><br />
          </div>

          <div>
            dataset path<br />
            <input v-model="dataset_path" class="half_size" /><br />
            upload path<br />
            <input v-model="upload_path" class="half_size" /><br />
            repos path<br />
            <input v-model="repos_path" class="half_size" /><br />
          </div>

          <div>image size : <input v-model="imgsz" class="half_size" /></div>

          <div>
            <!-- <button class="apply">apply</button> -->
            <button class="button" @click="prj_delete">delete</button>
            <button class="button" @click="prj_export">export</button>
            <button class="button" @click="prj_clear">Input Clear</button>
          </div>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
export default {
  data() {
    return {
      detail_button_txt: "Show Detail...",
      prjState: "",
      on_detail: false,
      items: [],
      configData: {
        prjs: {},
      },
    };
  },

  methods: {
    addLog(msg) {
      this.prjState = msg;
    },

    toggle_detail() {
      // Show Details button click event
      if (this.on_detail == true) {
        this.on_detail = false;
        this.detail_button_txt = "Show Details...";
      } else {
        this.on_detail = true;
        this.detail_button_txt = "Hide Details...";
        this.st2dom();
      }
    },

    st2dom() {
      this.prj_name = localStorage.prj_name;
      this.base_ip = localStorage.base_ip;
      this.rest_port = localStorage.rest_port;
      this.wine_port = localStorage.wine_port;
      this.repos_path = localStorage.repos_path;
      this.dataset_path = localStorage.dataset_path;
      this.upload_path = localStorage.upload_path;
      this.imgsz = localStorage.imgsz;
    },

    dom2st() {
      // dom 2 storage
      localStorage.base_ip = this.base_ip;
      localStorage.rest_port = this.rest_port;
      localStorage.wine_port = this.wine_port;
      localStorage.repos_path = this.repos_path;
      localStorage.dataset_path = this.dataset_path;
      localStorage.upload_path = this.upload_path;
      localStorage.imgsz = this.imgsz;
    },

    list2dom(evt) {
      // list click event
      // console.log(this.configData.prjs[evt.target.innerText]);
      // let name = evt.target.name;
      console.dir(evt.target)
      let name = evt.target.text;
      console.log(name);
      let _prj_config = this.configData.prjs[name];

      this.prj_name = localStorage.prj_name = name;
      this.base_ip = localStorage.base_ip = _prj_config.base_ip;
      this.rest_port = localStorage.rest_port = _prj_config.rest_port;
      this.wine_port = localStorage.wine_port = _prj_config.wine_port;

      this.repos_path = localStorage.repos_path = this.configData.repos_path;
      this.dataset_path = localStorage.dataset_path = `${_prj_config.dataset_path}`;
      this.upload_path = localStorage.upload_path = `${_prj_config.upload_path}`;

      this.imgsz = localStorage.imgsz = _prj_config.imgsz;
      this.addLog(`Current Project : ${localStorage.prj_name}`);
    },

    async _saveConfig() { // configData 서버에 저장
      let _out = JSON.stringify(this.configData)

      let _ = await (await fetch(`http://gears001.iptime.org:21030/rest/upload2`, {
        method: 'POST',
        body: _out,
        headers: new Headers({
          'Content-Type': 'text/xml',
          'Upload-Name': '__config.json',
          'upload-path': './',
          'file-size': _out.length
        })
      })).json();
      console.log(_);
      return _;
    },

    async prj_export() {
      this.dom2st();
      if (this.configData.prjs) {
        this.configData.prjs[this.prj_name] = {
          base_ip: localStorage.base_ip,
          rest_port: localStorage.rest_port,
          wine_port: localStorage.wine_port,
          dataset_path: localStorage.dataset_path,
          upload_path: localStorage.upload_path,
          imgsz: localStorage.imgsz,
        };
        console.log(this.configData);

        let _ = await this._saveConfig();
        console.log(_);
        location.reload();
        // awiat new Promise setTimeout, dom wait Window hide
      }
      else {
          alert('Please clear & check your configuration')
        }
    },

    async prj_delete() {
      if (this.configData && this.configData.prjs[this.prj_name]) {
        delete this.configData.prjs[this.prj_name];
        localStorage.removeItem('prj_name');
        await this._saveConfig();
        localStorage.clear();
        location.reload();
        this.addLog('delete Ok');

      }
      else {
        localStorage.clear();
      }
    },

    prj_clear() {
      this.addLog('Select a Project')
      localStorage.clear();
      this.st2dom();
    }

  },

  async mounted() {
    // current Project *현재 프로젝트 표시*
    if (localStorage.prj_name) {
      this.prjState = `Current Project : ${localStorage.prj_name}`;
    }
    else {
      this.prjState = 'Select a Project';
    }

    // 처음에 디테일 숨기기
    this.on_detail = false;

    // 설정파일 읽어오기
    try {
      let port = 21030,
      configData = await (await fetch(`http://gears001.iptime.org:${port}/rest/download?filepath=./__config.json`)).json();
      
      this.configData = configData; // fetch 한 configData를 data에 configData로 *important*
      console.log(configData);

      // 읽어온 project들 items object에 push
      for (let name in configData.prjs) {
        console.log(name);
        this.items.push({ name: name });
      }
    } catch (e) {
      console.log(e);
    }
  },
};
</script>

<style>
@import "../assets/scss/core.scss";
@import "../assets/scss/prjmng.scss";
</style>
