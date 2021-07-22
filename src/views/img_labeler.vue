<template>
  <!-- wait Window -->

  <!-- <div>
    <canvas id="mainCanvas" ref="can" width="1024" height="1024"></canvas>
  </div> -->

  <p>select name : {{ selectImgName }}</p>

  <FileList ref="filelist" :baseUrl="redWineUrl" @onSelect="onSlectFileList" />
  <hr />
  <select v-model="selectedLabel" @change="onLabelNameSelected">
    <option
      v-for="(item, index) in labelInfo_a"
      :key="index"
      :value="item.name"
    >
      {{ item.name }}
    </option>
  </select>

  <hr />
  <p>label info : {{ labelInfoMsg }} </p>
  <p>status : {{ statusMsg }}</p>
  <div>
    <LabelEditor
      ref="labelEditor"
      :prj_config="currentPrj"
      @onChangeProperty="onLabelPropertyChanged"
    />
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
    // selectImgName() {
    // if( this.$refs.filelist && this.$refs.filelist.selectItem && this.$refs.filelist.selectItem.name )
    //   return this.$refs.filelist.selectItem.name.split('.')[0]
    // else return 'select file'
    // return this.$refs.filelist.selectItem.name.split('.')[0]
    // } ,
    vocPath() {
      return this.$store.state.dataset_conf.voc;
    },
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
      statusMsg: "",
      labelInfoMsg : "",
      selectImgName: "",
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

    async _autoLabeling() {
      this.editor.clearLabelData();
      //유효 영역안에 들어온 부분 이미지만 처리한다.
      let _ = await this.editor.detectImage();

      // console.log(_)

      if (_.result == "ok") {
        let dts = _.data[0];
        dts.forEach((_dt) => {
          // console.log(_dt)

          console.log(this.labelInfo_a)
          console.log(_dt)

          //아래부분 예외처리후 완성해야함 2021.7.22...

          // let _conf = _dt[2]
          // let cls_name = this.dataset_conf.names[_dt[3]];

          // let _obj = this.editor.addLabelObject({
          //   xmin: _dt[0][0],
          //   ymin: _dt[0][1],
          //   xmax: _dt[1][0],
          //   ymax: _dt[1][1],
          //   class_name: cls_name,
          //   translate: true,
          //   color: this.color_table[cls_name],
          // });
          // console.log(_obj);
        });
        this.editor.fbCanvas.requestRenderAll();
      }
    },
    async _getSafeFileName(fileName) {
      let file_name = fileName.split("(")[0];
      let _cnt = 0;
      let _file_name = file_name;

      while (await this._checkVocFileExist(file_name)) {
        file_name = _file_name + `(${_cnt++})`;
      }
      console.log(file_name);
      return file_name;
    },
    async _saveVocFile(file_name) {
      try {
        let upload_img_name = file_name + ".jpeg";
        {
          // this.alertDom.innerText = 'uploading...'

          let _ = await this.editor.saveImage({
            // baseAddr: {
            //     ip: this.config.base_ip,
            //     port: this.config.rest_port,
            // },
            uploadName: upload_img_name,
            uploadPath: `${this.vocPath}`,
          });

          console.log(_);

          // this.alertDom.innerText = `upload , ${_.result}`
        }

        {
          // let _fn = `${file_name}.xml`

          // this.alertDom.textContent = `uploading... ${_fn}`
          try {
            let _res = await this.editor.saveVocLabelData({
              uploadName: `${file_name}.xml`,
              uploadImgName: upload_img_name,
              uploadPath: `${this.vocPath}`,
            });
            console.log(_res);

            await new Promise((resolve) => {
              setTimeout(resolve, 1000);
            });

            console.log("save voc complete");

            // this.alertDom.textContent = `uploading... ${_fn} ..ok`
          } catch (e) {
            console.log(e);
            // this.alertDom.textContent = `uploading... ${e} ..err`
          }
        }

        return "ok";
      } catch (e) {
        return e;
      }
    },
    async _checkVocFileExist(file_name) {
      console.log(file_name);
      console.log(this.$store.state.dataset_conf);

      // console.log(this.redWineUrl)

      let url = `http://${this.redWineUrl}/rest/exec?cmd=ls&cwd=${this.vocPath}`;

      let _ = await (await fetch(url)).json();

      console.log(_);

      let files = _.stdout.split("\n");

      let _index = lodash.findIndex(files, function (o) {
        return o == file_name + ".xml";
      });

      console.log(_index);

      return _index >= 0;
    },
    async _updateVocFileList() {
      let select_item = "";
      //선택한 아이템 저장
      if (this.vocFilesListObj.selectNodeItem) {
        select_item = this.vocFilesListObj.selectNodeItem.data_value;
      }

      const voc_path = this.dataset_conf.voc;
      let _files = await this._fetchFileList(voc_path, ["xml"]);
      this.vocFilesListObj.update(_files);

      //복원
      this.vocFilesListObj.selectItem(select_item);
    },
    // async _saveAnnotation({ overwrite = false, _file_name }) {
    //   if (_file_name == "" || _file_name == undefined) {
    //     return "select file first";
    //   }

    //   if (!overwrite) {
    //     _file_name = _file_name.split(["("])[0];

    //     let __file_name = _file_name;
    //     let _cnt = 0;

    //     //파일이름 찾기
    //     while (this._checkFileInList(_file_name)) {
    //       _file_name = `${__file_name}(${_cnt++})`;
    //     }
    //   }
    //   let _res = await this._saveVocFile(_file_name);
    //   console.log(_res);

    //   //작업파일이름 갱신
    //   this.save_file_name.value = _file_name;

    //   //update list
    //   this._updateVocFileList();

    //   return "ok";
    // },
    async onSlectFileList(item) {
      console.log(item);

      this.$store.commit("showWaitWindow");

      try {
        let filter = ["jpg", "png", "jpeg"];
        if (item.type.charAt(0) == "d") {
          this.$refs.filelist.updateFileList(
            // `${this.$store.state.server_ip}:21033`,
            `${this.$refs.filelist.path}/${item.name}`
          );
        } else {
          let __tmp = item.name.split(".");
          let _ext = __tmp[1];
          let _name = __tmp[0];
          console.log(item.name);
          this.selectImgName = _name;

          if (filter.indexOf(_ext) >= 0) {
            //이미지 파일
            this.editor.loadImage(`${this.$refs.filelist.path}/${item.name}`);
          } else if (_ext == "xml") {
            // console.log(`load voc : ${}`);

            let _ = await this.editor.loadVocLabelData(
              `${this.$refs.filelist.path}/${_name}`,
              this.labelInfo
            );
            console.log(_);
          }
        }
      } catch (e) {
        this.statusMsg = e.message;
      }

      this.$store.commit("hideWaitWindow");
    },
    onLabelNameSelected() {
      console.log(this.selectedLabel);
      this.editor.changeSelectedLabelAttr( this.labelInfo[this.selectedLabel] );
    

    },
    onLabelPropertyChanged(item) { //라벨 편집 내용이 갱신될때마다.
      console.log(item);
      this.labelInfoMsg = `${item.class_name} , topleft(${item.bbox.minx},${item.bbox.miny}) `
    },
    async onkeydown(evt) {
      console.log(evt);
      console.log(this.editor);

      if (document.activeElement.tagName === "INPUT") return;

      console.log(evt);
      if (!this.$store.state.bWaitWindow) {
        //대기창 비활성 상태 확인
        if (evt.ctrlKey) {
          switch (evt.code) {
            case "Delete":
              {
                console.log(await this.$refs.filelist.delSelectItem());
                await this.$refs.filelist.updateFileList();
              }
              break;
          }
        } else {
          switch (evt.code) {
            case "KeyS":
              {
                this.$refs.labelEditor.doImageObjfitinRect();
                this.editor.fbCanvas.requestRenderAll();
              }
              break;
            // case "KeyH":
            //   {
            //     if (this.imgFileListDom.classList.contains("hide")) {
            //       this.imgFileListDom.classList.remove("hide");
            //       this.vocFileListDom.classList.add("hide");
            //       this.vocFilesListObj.deSelectItem();
            //     } else {
            //       this.imgFileListDom.classList.add("hide");
            //       this.vocFileListDom.classList.remove("hide");
            //       if (this.imgFilesListObj != undefined)
            //         this.imgFilesListObj.deSelectItem();
            //     }

            //     this.save_file_name.value = "";
            //     this.editor.clearEditor();
            //     this.editor.fbCanvas.requestRenderAll();
            //   }
            //   break;
            case "KeyA":
              {
                // if (!this.imgFileListDom.classList.contains("hide")) {
                //   let _item = this.imgFilesListObj.selectPrevItem();
                //   this.imgFileListDom.scrollTop = _item.offsetTop;
                // } else if (!this.vocFileListDom.classList.contains("hide")) {
                //   let _item = this.vocFilesListObj.selectPrevItem();
                //   this.vocFileListDom.scrollTop = _item.offsetTop;
                // }
                this.$refs.filelist.selectPrevItem();
              }
              break;
            case "KeyD":
              {
                //다음 아이템 선택
                this.$refs.filelist.selectNextItem();
                // if (!this.imgFileListDom.classList.contains("hide")) {
                //   let _item = this.imgFilesListObj.selectNextItem();
                //   this.imgFileListDom.scrollTop = _item.offsetTop;
                // } else if (!this.vocFileListDom.classList.contains("hide")) {
                //   let _item = this.vocFilesListObj.selectNextItem();
                //   this.vocFileListDom.scrollTop = _item.offsetTop;
                // }
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
            case "KeyO": //라벨링 저장하기
              {
                // this.waitWindowDom.classList.remove("hide");
                this.statusMsg = `saving ${this.selectImgName}`;

                try {
                  if (
                    (await this._checkVocFileExist(this.selectImgName)) ==
                      false ||
                    evt.shiftKey
                  ) {
                    let _res = await this._saveVocFile(this.selectImgName);
                    console.log(_res);
                  } else {
                    alert(`${this.selectImgName} is already exist`);
                    console.log(`${this.selectImgName} is already exist`);
                  }
                  this.statusMsg = `ok`;
                } catch (e) {
                  this.statusMsg = e.msg;
                }
              }
              break;
            case "KeyT":
              {
                //안전하게 저장하기
                this.statusMsg = `saving ${this.selectImgName}`;
                try {
                  let file_name = await this._getSafeFileName(
                    this.selectImgName
                  );
                  console.log(file_name);
                  let _res = await this._saveVocFile(file_name);
                  console.log(_res);
                } catch (e) {
                  console.log(e);
                }
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

    // document.addEventListener("keydown"

    document.addEventListener("keydown", this.onkeydown);

    this.editor = this.$refs.labelEditor.editor;

    // console.log(lodash.values(this.labelInfo))
    this.labelInfo_a = lodash.values(this.labelInfo);
    if (this.labelInfo_a.length > 0)
      this.selectedLabel = this.labelInfo_a[0].name;
  },
  unmounted() {
    console.log("unmount ");
    document.removeEventListener("keydown", this.onkeydown);
  },
  created() {
    console.log(this.$store.state.dataset_conf.names);

    function random_rgb() {
      var o = Math.round,
        r = Math.random,
        s = 255;
      // return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
      return `rgb(${o(r() * s)},${o(r() * s)},${o(r() * s)})`;
    }

    this.$store.state.dataset_conf.names.forEach((element) => {
      this.labelInfo[element] = {
        name: element,
        color: random_rgb(),
      };
    });
  },
};
</script>

<style>
@import "../assets/scss/core.scss";
</style>