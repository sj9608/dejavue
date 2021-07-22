<template>
  <h1>data manager</h1>

  <div class="box-unit">
    <form>
      <p>Upload File Form</p>
      <div style="height: 80px">
        <input type="file" name="file" multiple @change="upload" />
      </div>
    </form>
  </div>

  <FileList ref="filelist" :baseUrl="redWineUrl" @onSelect="onSlectFileList" />

  <div class="box">
    <ImagerViwer ref="imgViewer" :baseUrl="coreRestApiUrl" />
  </div>

  <button @click="test">test 1</button>
  <button @click="clearImage">test 2</button>
</template>

<script>
import ImagerViwer from "@/components/ImageViewer.vue";
import FileList from "@/components/FileList.vue";

export default {
  name: "dataMng",
  components: {
    ImagerViwer,
    FileList,
  },
  computed: {
    coreRestApiUrl() {
      return `${this.$store.state.server_ip}:${this.$store.state.server_port}`;
    },
    redWineUrl() {
      // console.log(
      //   `${this.$store.state.server_ip}:${this.currentPrj.wine_port}`
      // );
      return `${this.$store.state.server_ip}:${this.currentPrj.wine_port}`;
    },
    currentPrj() {
      console.log(this.$store.state.projectName);
      return this.$store.state.settings.prjs[this.$store.state.projectName]
        ? this.$store.state.settings.prjs[this.$store.state.projectName]
        : {};
    },
    datasetBasePath() {
      return this.$store.state.settings.dataset_base_path;
    },
    uploadUrl() {
      //데이터셋의 위치 
      // console.log(this.$store.state.projectName);
      let _prj = this.$store.state.settings.prjs[this.$store.state.projectName]
      console.log(_prj)
      return `${_prj.base_ip}:${_prj.rest_port}/rest`
    },
    upload_path() {
      return `${this.datasetBasePath}/${this.currentPrj.upload_path}`
    }
  },
  // data() {
  //   return {
  //     restApiUrl : ``
  //   }

  // },
  mounted() {
    //현재 프로잭트 디랙토리로 이동
    this.$refs.filelist.updateFileList(
      // `${this.$store.state.server_ip}:21033`,
      // "/home/gbox3d/work/dataset/handsign/"
      `${this.datasetBasePath}/${this.currentPrj.dataset_path}`
    );
    this.$refs.imgViewer.loadImage(
      "/home/gbox3d/work/visionApp/daisy_project/www/download.jpg"
    );
  },
  
  created() {
    // console.log(this.$store.state.)
    console.log(this.uploadUrl);
    console.log(this.upload_path);
  },
  methods: {
    async upload(evt) {
      for (let i = 0; i < evt.target.files.length; i++) {
        let _fileObj = evt.target.files[i];
        console.log(`try upload ${_fileObj.name}`);

        const reader = new FileReader();

        await new Promise((resolve, reject) => {
          reader.addEventListener("load", async (_) => {
            console.log(_.target.result);
            console.log(_fileObj);
            let _time = new Date();

            // this.infoText.innerText = `now uploading... ${_fileObj.name}`;

            try {
              let upload_name = `${_time.getTime()}_${_fileObj.name}`;

              let _ext_name = upload_name.split(".");
              _ext_name = _ext_name[_ext_name.length - 1];

              if (_fileObj.name.length > 8) {
                upload_name = `${_time.getTime()}.${_ext_name}`;
              }

              let _ = await (
                await fetch(
                  `http://${this.uploadUrl}/upload2`,
                  {
                    method: "POST",
                    body: reader.result,
                    headers: new Headers({
                      // 'detector-header-data' : JSON.stringify({ fn: 'none', th: 0.5, dtf: 1 })
                      "Content-Type": _fileObj.type,
                      "Upload-Name": upload_name,
                      "upload-path": this.upload_path,
                      "file-size": _fileObj.size,
                    }), // 이 부분은 따로 설정하고싶은 header가 있다면 넣으세요
                  }
                )
              ).json();

              // console.log(_)

              if (_.result == "ok") {
                // this.infoText.innerText = `upload ok ${upload_name}`;
              } else {
                // this.infoText.innerText = `${_.result}`;
              }
              // console.log(`upload ${_fileObj.name}...ok`)
              resolve(_);
            } catch (error) {
              console.log(error);
              // this.infoText.innerText = error;
              reject(error);
            }
          });
          reader.readAsArrayBuffer(_fileObj);
        });
      }
    },
    onSlectFileList(item) {
      console.log("update");
      let filter = ["jpg", "png", "jpeg"];

      if (item.type.charAt(0) == "d") {
        this.$refs.filelist.updateFileList(
          // `${this.$store.state.server_ip}:21033`,
          `${this.$refs.filelist.path}/${item.name}`
        );
      } else {
        console.log(item.name);

        if (filter.indexOf(item.name.split(".")[1]) >= 0) {
          //이미지 파일
          this.$refs.imgViewer.loadImage(
            `${this.$refs.filelist.path}/${item.name}`
          );
        }
      }
    },
    clearImage() {
      this.$refs.imgViewer.clear();
    },
  },
};
</script>

<style>
.box {
  border: 1px solid black;
}
</style>