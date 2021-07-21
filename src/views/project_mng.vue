<template>
  <body>
    <h1>Project Manager</h1>
    <span v-if="!currentPrj.name || currentPrj.name.length==0 "> 프로잭트를 선택해주세요.</span>
    <span v-else>{{ currentPrj.name }}</span>
    <hr />

    <div class="btn_box">
      <button class="button" @click="show_prj">프로젝트 리스트 보기</button>
      <button class="button" @click="show_prj_config">현재 프로젝트 설정</button
      ><br />
      <button class="button" @click="create_prj_menu">새 프로젝트 생성</button>
      <button class="button" @click="load_prj_menu">프로젝트 로드, 삭제</button
      ><br />
    </div>

    <br />

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
        <br />
        <div class="group">
          <input v-model="currentPrj.name" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Project Name</label>
        </div>

        <div class="group">
          <input v-model="currentPrj.base_ip" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Base IP</label>
        </div>

        <div class="group">
          <input v-model="currentPrj.rest_port" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Rest Port</label>
        </div>

        <div class="group">
          <input v-model="currentPrj.wine_port" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Wine Port</label>
        </div>

        <div class="group">
          <input v-model="currentPrj.dataset_path" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Dataset Path</label>
        </div>

        <div class="group">
          <input v-model="currentPrj.upload_path" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Upload Path</label>
        </div>

        <!-- <div class="group">
          <input v-model="currentPrj.repos_path" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Repos Path</label>
        </div> -->

        <div class="group">
          <input v-model="currentPrj.imgsz" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Image Size</label>
        </div>

        <div class="group" >

          <p> {{dataset_conf.names}} </p>

        </div>


      </div>
      <button @click="update_config" class="button">Update</button>
    </div>

    <!-- 새 프로젝트 생성 -->
    <div v-else-if="type === 'C'">
      <h3>프로젝트 생성하기</h3>
      <span style="font-size: 18px"
        >dataset, upload 기본경로 :
        {{ this.configData.dataset_base_path }}</span
      >
      <form class="box-unit">
        <br />
        <div class="group">
          <input v-model="newPrjTemp.name" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Project Name</label>
        </div>

        <div class="group">
          <input v-model="newPrjTemp.base_ip" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Base IP</label>
        </div>

        <div class="group">
          <input v-model="newPrjTemp.rest_port" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Rest Port</label>
        </div>

        <div class="group">
          <input v-model="newPrjTemp.wine_port" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Wine Port</label>
        </div>

        <div class="group">
          <input v-model="newPrjTemp.dataset_path" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Dataset Path</label>
        </div>

        <div class="group">
          <input v-model="newPrjTemp.upload_path" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Upload Path</label>
        </div>

        <div class="group">
          <input v-model="newPrjTemp.imgsz" type="text" required />
          <span class="highlight"></span>
          <span class="bar"></span>
          <label>Image Size</label>
        </div>
      </form>
      <!-- <button @click="load_base" class="button">기본설정 불러오기</button> -->
      <button @click="create_prj" class="button">Create Project</button>
    </div>

    <!-- 다른 프로젝트 선택 -->
    <div v-else-if="type === 'D'">
      <h3>프로젝트 로드, 삭제</h3>
      <!-- <span style="font-size: 18px"> {{ prjState }} </span> -->
      <div class="box-unit prj_load">
        <li @click="prj_choice(prj)" v-for="prj in prj_list" :key="prj">
          {{ prj.name }}
        </li>
      </div>
      <!-- <button @click="load_prj" class="button">Load Project</button> -->
      <button @click="delete_prj" class="button warn">Delete Project</button>
    </div>
  </body>
</template>

<script>
import { cloneDeep, values } from "lodash";

export default {
  data() {
    return {
      type: "",
      // prjState: `-***-`,
      // prjToLoad: `${localStorage.prj_name}`,
      prj_list: [],
      // configData: {
      //   prjs: {},
      // },
      configData: cloneDeep(this.$store.state.settings),
      // prj_name: this.$store.state.projectName,
      newPrjTemp: {
        name: "newPrj",
        base_ip: "any.ai.com",
        rest_port: "22030",
        wine_port: "22033",
        dataset_path: "someone",
        upload_path: "someone/src",
        imgsz: "640",
      },
    };
  },
  computed: {
    baseUrl() {
      return `${this.$store.state.server_ip}:${this.$store.state.server_port}`;
    },
    currentPrj : {
      get() {
        console.log(this.$store.state.projectName)
        return this.configData.prjs[this.$store.state.projectName] ? this.configData.prjs[this.$store.state.projectName] : {};
      },
      set(value) {
        this.$store.dispatch({
          type: "updateProjrctName",
          prj_name: value,
        });
      }
      // if (this.prj_name == "") {
      //   return {
      //     name: "newPrj",
      //     base_ip: "any.ai.com",
      //     rest_port: "22030",
      //     wine_port: "22033",
      //     dataset_path: "someone",
      //     upload_path: "someone/src",
      //     imgsz: "640",
      //   };
      // } else
      
    },
    dataset_conf : {
      get() {
        // if(this.$store.state.dataset_conf)
        return this.$store.state.dataset_conf
      }
    }
  },
  methods: {
    show_prj() {
      if (this.type === "A") this.type = "none";
      else this.type = "A";
    },

    show_prj_config() {
      this.type = "B";
      // this.st2dom();
    },

    create_prj_menu() {
      this.type = "C";
      // this.prj_name = "";

      // this.prj_name = "";
      // this.base_ip = "";
      // this.rest_port = "";
      // this.wine_port = "";
      // this.dataset_path = "";
      // this.upload_path = "";
      // this.imgsz = "";
    },

    load_prj_menu() {
      this.type = "D";
    },

    async update_config() {
      if (
        // this.configData &&
        // this.configData.prjs[localStorage.prj_name] &&
        confirm(`${this.currentPrj.name} 업데이트하시겠습니까?`)
      ) {
        // delete this.configData.prjs[this.currentPrj.name];

        // localStorage.removeItem("prj_name");
        // await this.saveConfig();
        // this.dom2st();
        
        // if (this.configData.prjs !== undefined) {
        //   this.configData.prjs[this.prj_name] = {
        //     base_ip: localStorage.base_ip,
        //     rest_port: localStorage.rest_port,
        //     wine_port: localStorage.wine_port,
        //     dataset_path: localStorage.dataset_path,
        //     upload_path: localStorage.upload_path,
        //     imgsz: localStorage.imgsz,
        //   };

        //   console.log(this.configData);

        //   let _ = await this.saveConfig();
        //   console.log(_);
        // } else {
        //   alert("Please Clear & Check Your configuration");
        // }
        // location.reload();

        await this.$store.dispatch({
          type: "updateSettings",
          data: this.configData,
        });


        alert("업데이트가 완료되었습니다.");
      } else {
        alert("업데이트 취소");
      }
    },

    prj_choice(prj) {
      // this.prjToLoad = evt.target.innerText;
      // console.dir(evt.target);

      console.log(prj)
      this.currentPrj = prj.name
      // this.prj_name = prj.name
      // this.$store.commit({
      //     type: "updateProjrctName",
      //     prj_name: prj.name,
      //   });
      
    },

    // load_prj() {
    //   // let name = this.prjToLoad;
    //   // let prj_config = this.configData.prjs[name];

    //   // localStorage.prj_name = this.prjToLoad;
    //   // localStorage.base_ip = prj_config.base_ip;
    //   // localStorage.rest_port = prj_config.rest_port;
    //   // localStorage.wine_port = prj_config.wine_port;
    //   // localStorage.repos_path = this.configData.repos_path;
    //   // localStorage.dataset_path = prj_config.dataset_path;
    //   // localStorage.upload_path = prj_config.upload_path;
    //   // localStorage.imgsz = prj_config.imgsz;

    //   // alert(`"${name}" Project 준비완료`);
    //   // location.reload();
    // },

    async delete_prj() {
      if (
        // this.configData &&
        // this.configData.prjs[this.prjToLoad] &&
        confirm(`${this.currentPrj.name} 프로젝트를 삭제하시겠습니까?`) == true
      ) {
        delete this.configData.prjs[this.currentPrj.name];
        // this.prj_name = "";
        this.currentPrj = ""
        this.prj_list = values(this.configData.prjs);

        await this.$store.dispatch({
          type: "updateSettings",
          data: this.configData,
        });
        // this.$store.commit({
        //   type: "updateProjrctName",
        //   prj_name: this.prj_name,
        // });

        // let name = this.prjToLoad;
        // localStorage.removeItem("prj_name");
        // await this.saveConfig();
        // localStorage.clear();
        // alert(`${name} 프로젝트 삭제 완료`);
        // location.reload();
      } else {
        alert("삭제가 완료되지 않았습니다.");
      }
    },

    // dom2st() {
    //   localStorage.prj_name = this.prj_name;
    //   localStorage.base_ip = this.base_ip;
    //   localStorage.rest_port = this.rest_port;
    //   localStorage.wine_port = this.wine_port;
    //   localStorage.dataset_path = this.dataset_path;
    //   localStorage.upload_path = this.upload_path;
    //   localStorage.repos_path = this.repos_path;
    //   localStorage.imgsz = this.imgsz;
    // },

    // st2dom() {
    //   this.prj_name = localStorage.prj_name;
    //   this.base_ip = localStorage.base_ip;
    //   this.rest_port = localStorage.rest_port;
    //   this.wine_port = localStorage.wine_port;
    //   this.dataset_path = localStorage.dataset_path;
    //   this.upload_path = localStorage.upload_path;
    //   this.repos_path = localStorage.repos_path;
    //   this.imgsz = localStorage.imgsz;
    // },

    // async saveConfig() {
    //   let _out = JSON.stringify(this.configData);

    //   let _ = await (
    //     await fetch(`http://gears001.iptime.org:21030/rest/upload2`, {
    //       method: "POST",
    //       body: _out,
    //       headers: new Headers({
    //         "Content-Type": "text/xml",
    //         "Upload-Name": "settings.json",
    //         "upload-path": "./",
    //         "file-size": _out.length,
    //       }),
    //     })
    //   ).json();
    //   console.log(_);
    //   return _;
    // },

    async create_prj() {
      this.configData.prjs[this.newPrjTemp.name] = cloneDeep(this.newPrjTemp);
      console.log(this.configData);

      //update view data
      // this.prj_name = this.currentPrj.name;
      await this.$store.dispatch({
        type: "updateSettings",
        data: this.configData,
      });

      // this.$store.commit({
      //   type: "updateProjrctName",
      //   prj_name: this.newPrjTemp.name,
      // });

      // this.prj_name = this.newPrjTemp.name;
      this.currentPrj = this.newPrjTemp.name
      this.prj_list = values(this.configData.prjs);

      alert(`${this.currentPrj.name} 프로젝트가 생성되었습니다.`);

      this.type = "B";

      // if (this.prj_name != undefined && this.prj_name != "") {
      //   // console.log(this.prj_name);
      //   // this.dom2st();
      //   this.configData.prjs[this.prj_name] = cloneDeep(this.currentPrj)
      //   // {
      //     // base_ip: localStorage.base_ip,
      //     // rest_port: localStorage.rest_port,
      //     // wine_port: localStorage.wine_port,
      //     // dataset_path: localStorage.dataset_path,
      //     // upload_path: localStorage.upload_path,
      //     // imgsz: localStorage.imgsz,
      //   // };
      //   console.log(this.configData);

      //   // let _ = await this.saveConfig();
      //   // console.log(_);
      //   alert(`${this.prj_name} 프로젝트가 생성되었습니다.`);

      //   this.type = "D";

      //   // location.reload();
      // } else {
      //   alert("Please Clear & Check Your configuration");
      // }
    },
  },
  mounted() {
    // if (localStorage.prj_name == null) {
    //   this.prjState = "프로젝트를 로드하세요."
    // }

    // console.log(this.$store.state.projectName)
    if (this.prj_name == "" && !this.prj_name) {
      this.prjState = "프로젝트를 로드하세요.";
    } else {
      this.prjState = `current prj : ${this.prj_name}`;
    }

    console.log(this.configData.prjs);

    this.prj_list = values(this.configData.prjs);



    // for (let key in this.configData.prjs) {
    //   // console.log(prj_name);
    //   this.prj_list.push({ name: key });
    // }

    // // 설정파일 읽어오기
    // try {
    //   // let port = ,
    //   let configData = await (
    //     await fetch(
    //       `http://${this.baseUrl}/rest/download?filepath=./settings.json`
    //     )
    //   ).json();

    //   this.configData = configData;
    //   console.log(configData);

    //   // 읽어온 프로젝트 리스트 들 오브젝트형식으로 prj_list에 담기
    //   for (let prj_name in configData.prjs) {
    //     console.log(prj_name);
    //     this.prj_list.push({ name: prj_name });
    //   }
    // } catch (e) {
    //   console.log(e);
    // }
  },
};
</script>

<style>

</style>
