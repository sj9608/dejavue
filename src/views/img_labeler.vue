<template>
  <!-- wait Window -->

  <!-- <div>
    <canvas id="mainCanvas" ref="can" width="1024" height="1024"></canvas>
  </div> -->

  <FileList ref="filelist" :baseUrl="redWineUrl" @onSelect="onSlectFileList" />
  <hr />
  <select v-model="selectedLabel" @change="onLabelSelected(item)">
    <option
      v-for="(item, index) in labelInfo_a"
      :key="index"
      :value="item.name"
    >
      {{ item.name }}
    </option>
  </select>

  <hr />
  <div>
    <LabelEditor ref="labelEditor" :config="currentPrj" />
  </div>

  <hr />

  <button @click="test1">test 1</button>

  <!-- <Editor /> -->
</template>


<script>
import LabelEditor from "@/components/LabelEditor.vue";
import FileList from "@/components/FileList.vue";
import lodash from "lodash";

// import { fabric } from "fabric";

export default {
  name: "img_labeler",
  components: {
    FileList,
    LabelEditor,
  },
  computed: {
    currentPrj() {
      console.log(this.$store.state.projectName);
      return this.$store.state.settings.prjs[this.$store.state.projectName]
        ? this.$store.state.settings.prjs[this.$store.state.projectName]
        : {};
    },
    coreRestApiUrl() {
      return `${this.$store.state.server_ip}:${this.$store.state.server_port}`;
    },
    redWineUrl() {
      //   console.log(
      //     `${this.$store.state.server_ip}:${this.currentPrj.wine_port}`
      //   );
      return `${this.$store.state.server_ip}:${this.currentPrj.wine_port}`;
    },
    datasetBasePath() {
      return this.$store.state.settings.dataset_base_path;
    },
  },
  data() {
    return {
      selectedLabel: "",
      labelInfo: {
        // "a" : { name: "a", color: "rgba(255,0,255,255)" },
        // "b" : { name: "b", color: "rgba(255,255,0,255)" },
        // "c" : { name: "c", color: "rgba(0,255,255,255)" },
      },
      labelInfo_a: [],
      //   showWaitWindow: false,
    };
  },
  methods: {
    async test1() {
      //   console.log('tt')

      this.$store.commit("showWaitWindow");

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });

      this.$store.commit("hideWaitWindow");
    },
    onSlectFileList(item) {
      console.log(item);
      let filter = ["jpg", "png", "jpeg"];
      if (item.type.charAt(0) == "d") {
        this.$refs.filelist.updateFileList(
          // `${this.$store.state.server_ip}:21033`,
          `${this.$refs.filelist.path}/${item.name}`
        );
      } else {
        let _ext = item.name.split(".")[1];
        console.log(item.name);

        if (filter.indexOf(_ext) >= 0) {
          //이미지 파일
          //   this.$refs.imgViewer.loadImage(
          //     `${this.$refs.filelist.path}/${item.name}`
          //   );
        }
      }
    },
    onLabelSelected() {
      console.log(this.selectedLabel);
    },
    async onkeydown(evt) {
      console.log(evt);
      console.log(this.editor);

      console.log(evt);
      if (!this.$store.state.bWaitWindow) {
        //대기창 비활성 상태 확인
        if (evt.ctrlKey) {
          switch (evt.code) {
            case "Delete":
              {
                if (this.vocFilesListObj.selectNodeItem) {
                  if (
                    confirm(
                      `remove ${this.vocFilesListObj.selectNodeItem.data_value}?`
                    )
                  ) {
                    this.waitWindowDom.classList.remove("hide");

                    let _file = this.vocFilesListObj.selectNodeItem.data_value;
                    let _url = `http://${this.config.base_ip}:${this.config.wine_port}/rest/exec?cmd=rm "${_file}"&cwd=${this.dataset_conf.voc}`;

                    console.log(_url);
                    let _ = await (await fetch(_url)).json();
                    console.log(_);

                    _url = `http://${this.config.base_ip}:${
                      this.config.wine_port
                    }/rest/exec?cmd=rm "${_file.split(".")[0]}.png"&cwd=${
                      this.dataset_conf.voc
                    }`;
                    _ = await (await fetch(_url)).json();

                    this.vocFilesListObj.removeSelectedItem();
                    this.waitWindowDom.classList.add("hide");

                    alert(`${_file} rmove`);
                  }
                } else {
                  alert("no item");
                }
              }
              break;
          }
        } else {
          switch (evt.code) {
            case "KeyS":
              {
                this._doImageObjfitinRect();
                this.editor.fbCanvas.requestRenderAll();
              }
              break;
            case "KeyH":
              {
                if (this.imgFileListDom.classList.contains("hide")) {
                  this.imgFileListDom.classList.remove("hide");
                  this.vocFileListDom.classList.add("hide");
                  this.vocFilesListObj.deSelectItem();
                } else {
                  this.imgFileListDom.classList.add("hide");
                  this.vocFileListDom.classList.remove("hide");
                  if (this.imgFilesListObj != undefined)
                    this.imgFilesListObj.deSelectItem();
                }

                this.save_file_name.value = "";
                this.editor.clearEditor();
                this.editor.fbCanvas.requestRenderAll();
              }
              break;
            case "KeyA":
              {
                if (!this.imgFileListDom.classList.contains("hide")) {
                  let _item = this.imgFilesListObj.selectPrevItem();
                  this.imgFileListDom.scrollTop = _item.offsetTop;
                } else if (!this.vocFileListDom.classList.contains("hide")) {
                  let _item = this.vocFilesListObj.selectPrevItem();
                  this.vocFileListDom.scrollTop = _item.offsetTop;
                }
              }
              break;
            case "KeyD":
              {
                if (!this.imgFileListDom.classList.contains("hide")) {
                  let _item = this.imgFilesListObj.selectNextItem();
                  this.imgFileListDom.scrollTop = _item.offsetTop;
                } else if (!this.vocFileListDom.classList.contains("hide")) {
                  let _item = this.vocFilesListObj.selectNextItem();
                  this.vocFileListDom.scrollTop = _item.offsetTop;
                }
              }
              break;
            case "KeyE":
              {
                let _angle = this.editor.imgObj.get("angle");
                this.editor.imgObj.rotate(15 + _angle);

                this.editor.fbCanvas.requestRenderAll();
              }
              break;
            case "KeyQ":
              {
                let _angle = this.editor.imgObj.get("angle");
                this.editor.imgObj.rotate(15 + _angle);

                this.editor.imgObj.rotate(_angle - 15);
                this.editor.fbCanvas.requestRenderAll();
              }
              break;
            case "KeyW":
              {
                if (evt.shiftKey) {
                  //자동으로 라벨링 하기
                  this._autoLabeling();
                } else {
                  console.log(this.editor.mousePos);

                  let _sel_label = this.labelInfo[this.selectedLabel];

                  let _obj = this.editor.addLabelObject({
                    xmin: this.editor.mousePos.x - 32,
                    ymin: this.editor.mousePos.y - 32,
                    xmax: this.editor.mousePos.x + 32,
                    ymax: this.editor.mousePos.y + 32,
                    class_name: _sel_label.name,
                    translate: false,
                    color: _sel_label.color,
                  });
                  this.editor.fbCanvas.requestRenderAll();
                  console.log(_obj);
                }
              }
              break;
            case "KeyR":
              {
                this.editor.removeLabelObject();
              }
              break;
            case "KeyI":
              {
                if (evt.shiftKey)
                  alert(
                    `img : ${this.imgFilesListObj.listData.length}, xml : ${this.vocFilesListObj.listData.length}`
                  );
              }
              break;
            case "KeyF":
              {
                //find file
                if (this.imgFileListDom.classList.contains("hide")) {
                  this.imgFileListDom.classList.remove("hide");
                  this.vocFileListDom.classList.add("hide");
                  this.vocFilesListObj.deSelectItem();
                }
                console.log(this.save_file_name.value);

                //(..)부분 제거하기
                let _fn = this.save_file_name.value;
                let _toks = this.save_file_name.value.split("(");
                if (_toks.length > 1) {
                  _fn = _toks[0];
                }

                let _item = this.imgFilesListObj.selectItem(_fn + ".png");

                if (!_item) {
                  _item = this.imgFilesListObj.selectItem(_fn + ".jpg");

                  if (!_item) {
                    _item = this.imgFilesListObj.selectItem(_fn + ".jpeg");
                  }
                }

                if (_item) {
                  this.imgFileListDom.scrollTop = _item.offsetTop;
                } else {
                  alert(`not found ${_fn}`);
                }
              }
              break;
            case "KeyO":
              {
                this.waitWindowDom.classList.remove("hide");

                if (evt.altKey == true && evt.shiftKey == true) {
                  //강제저장
                  let _ = await this._saveAnnotation({
                    overwrite: true,
                  });
                  console.log(_);
                } else {
                  let _overwrite = false;
                  if (this._checkFileInList(this.save_file_name.value)) {
                    if (
                      confirm("Are you sure you want to overwrite this file")
                    ) {
                      _overwrite = true;
                    }
                  }

                  let _ = await this._saveAnnotation({
                    overwrite: _overwrite,
                  });
                  alert(_);
                }
                this.waitWindowDom.classList.add("hide");
              }
              break;
            case "KeyT":
              {
                //안전하게 저장하기
                this.waitWindowDom.classList.remove("hide");
                let _ = await this._saveAnnotation({
                  overwrite: false,
                });
                console.log(_);
                this.waitWindowDom.classList.add("hide");
              }
              break;
            case "KeyY":
              {
                if (evt.shiftKey) {
                  this.editor.resetTransform(this.editor.imgObj);
                  this.editor.fbCanvas.requestRenderAll();
                } else {
                  this.editor.enableImgSelect();
                }
              }
              break;
            case "KeyX":
              if (evt.shiftKey) {
                this.editor.showCrossLine();
              } else {
                this.editor.hideCrossLine();
              }
              break;
            case "KeyU":
              {
                this.editor.enableImgSelect();
              }
              break;
          }
        }
      }
    },
  },
  mounted() {
    //현재 프로잭트 디랙토리로 이동
    this.$refs.filelist.updateFileList(
      `${this.datasetBasePath}/${this.currentPrj.dataset_path}`
    );

    document.addEventListener("keydown", this.onkeydown);

    this.editor = this.$refs.labelEditor.editor;

    // console.log(lodash.values(this.labelInfo))
    this.labelInfo_a = lodash.values(this.labelInfo);
    if(this.labelInfo_a.length > 0)
        this.selectedLabel = this.labelInfo_a[0].name;
  },
  created() {
    console.log(this.$store.state.dataset_conf.names);

    // function random_rgba() {
    //     var o = Math.round, r = Math.random, s = 255;
    //     return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
    // }

    function random_rgb() {
        var o = Math.round, r = Math.random, s = 255;
        // return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
        return `rgb(${ o(r()*s)},${ o(r()*s)},${ o(r()*s)})`
    }
    
    this.$store.state.dataset_conf.names.forEach(element => {
        this.labelInfo[element] = {
            name : element,
            color : random_rgb()
        }
    });
  },
};
</script>

<style>
@import "../assets/scss/core.scss";
</style>