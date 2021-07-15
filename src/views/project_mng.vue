<template>
  <body>
    <h1>Project Manager</h1>
    <span>{{prjState}}</span>
    <hr />

    <div class="btn_box">
      <button class="button" @click="show_prj">프로젝트 리스트 보기</button>
      <button class="button" @click="show_prj_config">현재 프로젝트 설정</button><br />
      <button class="button" @click="create_prj_menu">새 프로젝트 생성</button>
      <button class="button" @click="load_prj_menu">프로젝트 로드, 삭제</button><br />
    </div>

    <br/>

    <!-- 프로젝트 리스트 -->
    <div v-if="type === 'A'">
      <h3>프로젝트 리스트</h3>
      <ul class="box-unit">
        <li v-for="prj in prj_list" :key="prj">{{ prj.name }}</li>
      </ul>
    </div>

    <!-- 현재 프로젝트 설정 -->
    <div v-else-if="type === 'B'">
      <h3>현재 프로젝트 설정</h3>
      
      <div class="box-unit">    
        <br/>
        <div class="group">
          <input v-model="prj_name" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Project Name</label>
        </div>
      
        <div class="group">      
          <input v-model="base_ip" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Base IP</label>
        </div>

        <div class="group">      
          <input v-model="rest_port" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Rest Port</label>
        </div>

        <div class="group">      
          <input v-model="wine_port" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Wine Port</label>
        </div>

        <div class="group">      
          <input v-model="dataset_path" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Dataset Path</label>
        </div>

        <div class="group">      
          <input v-model="upload_path" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Upload Path</label>
        </div>

        <div class="group">      
          <input v-model="repos_path" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Repos Path</label>
        </div>

        <div class="group">      
          <input v-model="imgsz" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Image Size</label>
        </div>

      </div>
      <button @click="update_config" class="button">Update</button>
    </div>

    <!-- 새 프로젝트 생성 -->
    <div v-else-if="type === 'C'">
      <h3>프로젝트 생성하기</h3>
      <span style="font-size:18px">dataset, upload 기본경로 : {{this.configData.dataset_base_path}}</span>
      <form class="box-unit">    
        <br/>
        <div class="group">
          <input v-model="prj_name" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Project Name</label>
        </div>
      
        <div class="group">      
          <input v-model="base_ip" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Base IP</label>
        </div>

        <div class="group">      
          <input v-model="rest_port" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Rest Port</label>
        </div>

        <div class="group">      
          <input v-model="wine_port" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Wine Port</label>
        </div>

        <div class="group">      
          <input v-model="dataset_path" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Dataset Path</label>
        </div>

        <div class="group">      
          <input v-model="upload_path" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Upload Path</label>
        </div>

        <div class="group">
          <input v-model="imgsz" type="text" required>
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Image Size</label>
        </div>

      </form>
        <button @click="load_base" class="button">기본설정 불러오기</button>
        <button @click="create_prj" class="button">Create Project</button>
    </div>

    <!-- 다른 프로젝트 선택 -->
    <div v-else-if="type === 'D'">
      <h3>프로젝트 로드, 삭제</h3>
      <span style="font-size:18px">현재 선택한 프로젝트 : {{prjToLoad}}</span>
      <div class="box-unit prj_load">
        <li @click="prj_choice" v-for="prj in prj_list" :key="prj">{{ prj.name }}</li>
      </div>
        <button @click="load_prj" class="button">Load Project</button>
        <button @click="delete_prj" class="button warn">Delete Project</button>
    </div>

  </body>
</template>

<script>
export default {
  data() {
    return {
      type: '',
      prjState: `현재 선택된 프로젝트 : ${localStorage.prj_name}`,
      prjToLoad: `${localStorage.prj_name}`,
      prj_list: [],
      configData: {
        prjs: {},
      },
    };
  },

  methods: {
    show_prj() {
      if (this.type === 'A')
        this.type = 'none';
      else
        this.type = 'A';
    },

    show_prj_config() {
      this.type = 'B';
      this.st2dom();
    },

    create_prj_menu() {
      this.type = 'C';
      this.prj_name = "";
      this.base_ip = "";
      this.rest_port = "";
      this.wine_port = ""
      this.dataset_path = "";
      this.upload_path = "";
      this.imgsz = "";
    },

    load_prj_menu() {
      this.type = 'D';
    },

    async update_config() {
      if (this.configData && this.configData.prjs[localStorage.prj_name] && confirm('업데이트하시겠습니까?')) {
        delete this.configData.prjs[localStorage.prj_name];

        localStorage.removeItem('prj_name');
        await this.saveConfig();

        this.dom2st();
        if (this.configData.prjs !== undefined) {
          this.configData.prjs[this.prj_name] = {
            base_ip: localStorage.base_ip,
            rest_port: localStorage.rest_port,
            wine_port: localStorage.wine_port,
            dataset_path: localStorage.dataset_path,
            upload_path: localStorage.upload_path,
            imgsz: localStorage.imgsz
          }
          
          console.log(this.configData);

          let _ = await( this.saveConfig());
          console.log(_);
        }
        else {
          alert('Please Clear & Check Your configuration');
        }
        location.reload();
        alert('업데이트가 완료되었습니다.')
      }
      else {
        alert('업데이트 취소')
      }
    },

    prj_choice(evt) {
      this.prjToLoad = evt.target.innerText;
      console.dir(evt.target);
    },

    load_prj() {
      let name = this.prjToLoad;
      let prj_config = this.configData.prjs[name];

      localStorage.prj_name = this.prjToLoad;
      localStorage.base_ip = prj_config.base_ip;
      localStorage.rest_port = prj_config.rest_port;
      localStorage.wine_port = prj_config.wine_port;
      localStorage.repos_path = this.configData.repos_path;
      localStorage.dataset_path = prj_config.dataset_path;
      localStorage.upload_path = prj_config.upload_path;
      localStorage.imgsz = prj_config.imgsz;
      
      alert(`"${name}" Project 준비완료` )
      location.reload();
    },

    async delete_prj() {
      if (this.configData && this.configData.prjs[this.prjToLoad] && confirm(`${this.prjToLoad} 프로젝트를 삭제하시겠습니까?`) == true) {
        delete this.configData.prjs[this.prjToLoad];
        let name = this.prjToLoad;
        localStorage.removeItem('prj_name');
        await this.saveConfig();
        localStorage.clear();
        alert(`${name} 프로젝트 삭제 완료`);
        location.reload();
      }
      else {
        alert('삭제가 완료되지 않았습니다.')
      }
    },

    dom2st() {
      localStorage.prj_name = this.prj_name;
      localStorage.base_ip = this.base_ip;
      localStorage.rest_port = this.rest_port;
      localStorage.wine_port = this.wine_port;
      localStorage.dataset_path = this.dataset_path;
      localStorage.upload_path = this.upload_path;
      localStorage.repos_path = this.repos_path;
      localStorage.imgsz = this.imgsz;
    },

    st2dom() {
      this.prj_name = localStorage.prj_name;
      this.base_ip = localStorage.base_ip;
      this.rest_port = localStorage.rest_port;
      this.wine_port = localStorage.wine_port;
      this.dataset_path = localStorage.dataset_path;
      this.upload_path = localStorage.upload_path;
      this.repos_path = localStorage.repos_path;
      this.imgsz = localStorage.imgsz;
    },

    async saveConfig() {
      let _out = JSON.stringify(this.configData);

      let _ = await( await fetch(`http://gears001.iptime.org:21030/rest/upload2`, {
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

    async create_prj() {
      if (this.prj_name != undefined && this.prj_name != "") {
        console.log(this.prj_name);
        this.dom2st();
        this.configData.prjs[this.prj_name] = {
          base_ip: localStorage.base_ip,
          rest_port: localStorage.rest_port,
          wine_port: localStorage.wine_port,
          dataset_path: localStorage.dataset_path,
          upload_path: localStorage.upload_path,
          imgsz: localStorage.imgsz
        }
        console.log(this.configData);

      let _ = await( this.saveConfig());
      console.log(_);
      alert(`${this.prj_name} 프로젝트가 생성되었습니다.`);
      location.reload();
      }
      else {
        alert('Please Clear & Check Your configuration');
      }
    }
  },

  async mounted() {

    if (localStorage.prj_name == null) {
      this.prjState = "프로젝트를 로드하세요."
    }

    // 설정파일 읽어오기
    try {
      let port = 21030,
        configData = await (
          await fetch(
            `http://gears001.iptime.org:${port}/rest/download?filepath=./__config.json`
          )
        ).json();

      this.configData = configData;
      console.log(configData);

      // 읽어온 프로젝트 리스트 들 오브젝트형식으로 prj_list에 담기
      for (let prj_name in configData.prjs) {
        console.log(prj_name);
        this.prj_list.push({ name: prj_name });
      }
    } catch (e) {
      console.log(e);
    }
  },
};
</script>

<style>
@import "../assets/scss/prjmng2.scss";
@import "../assets/scss/input_box.scss"
</style>
