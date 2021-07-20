<template>
  <!-- wait Window -->

  <!-- <div>
    <canvas id="mainCanvas" ref="can" width="1024" height="1024"></canvas>
  </div> -->

  <p>select name : {{selectImgName}}</p>

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
    selectImgName() {

      if(this.$refs.filelist.selectItem.name)
        return this.$refs.filelist.selectItem.name.split('.')[0]
      else return 'select file'

    } ,
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
    
    async _autoLabeling() {

        this.editor.clearLabelData()
        //유효 영역안에 들어온 부분 이미지만 처리한다.
        let _ = await this.editor.detectImage()

        // console.log(_)

        if (_.result == 'ok') {
            let dts = _.data[0]
            dts.forEach(_dt => {

                // console.log(_dt)

                // let _conf = _dt[2]
                let cls_name = this.dataset_conf.names[_dt[3]]

                let _obj = this.editor.addLabelObject(
                    {
                        xmin: _dt[0][0],
                        ymin: _dt[0][1],
                        xmax: _dt[1][0],
                        ymax: _dt[1][1],
                        class_name: cls_name,
                        translate: true,
                        color: this.color_table[cls_name]
                    }
                );
                console.log(_obj)

            });
            this.editor.fbCanvas.requestRenderAll();
        }

    },
    async _saveVocFile(file_name) {

        try {
            let upload_img_name = file_name + '.jpeg'
            {
                this.alertDom.innerText = 'uploading...'

                let _ = await this.editor.saveImage({
                    baseAddr: {
                        ip: this.config.base_ip,
                        port: this.config.rest_port,
                    },
                    uploadName: upload_img_name,
                    uploadPath: `${this.config.dataset_path}/voc`
                });

                console.log(_)

                this.alertDom.innerText = `upload , ${_.result}`
            }

            {
                let _fn = `${file_name}.xml`

                this.alertDom.textContent = `uploading... ${_fn}`
                try {
                    await this.editor.saveVocLabelData(_fn, upload_img_name);
                    await new Promise((resolve) => {
                        setTimeout(resolve, 1000)
                    });
                    this.alertDom.textContent = `uploading... ${_fn} ..ok`
                } catch (e) {
                    this.alertDom.textContent = `uploading... ${e} ..err`
                }

            }

            return 'ok'

        }
        catch (e) {
            return e
        }
    },
    _checkFileInList(file_name) {
        // let _find = false

        for (let i = 0; i < this.vocFilesListObj.listData.length; i++) {
            let _item = this.vocFilesListObj.listData[i]
            if (_item.name.split('.')[0] == file_name) {
                // _find = true
                return true
            }
        }

        return false
    },
    async _updateVocFileList() {

        let select_item = ''
        //선택한 아이템 저장
        if (this.vocFilesListObj.selectNodeItem) {
            select_item = this.vocFilesListObj.selectNodeItem.data_value
        }

        const voc_path = this.dataset_conf.voc
        let _files = await this._fetchFileList(voc_path, ["xml"]);
        this.vocFilesListObj.update(_files)

        //복원 
        this.vocFilesListObj.selectItem(select_item)

    },
    async _saveAnnotation({ overwrite = false, _file_name = this.save_file_name.value }) {
        // console.log(this.vocFilesListObj.listContainer)
        // let _file_name = this.save_file_name.value
        // console.log(_file_name)

        if (_file_name == '' || _file_name == undefined) {
            return 'select file first'
        }

        if (!overwrite) {

            _file_name = _file_name.split(['('])[0]

            let __file_name = _file_name
            let _cnt = 0

            //파일이름 찾기 
            while (this._checkFileInList(_file_name)) {
                _file_name = `${__file_name}(${_cnt++})`
            }
        }
        let _res = await this._saveVocFile(_file_name)
        console.log(_res)

        //작업파일이름 갱신 
        this.save_file_name.value = _file_name

        //update list
        this._updateVocFileList()

        return 'ok'

    },
    async onSlectFileList(item) {
      console.log(item);
      let filter = ["jpg", "png", "jpeg"];
      if (item.type.charAt(0) == "d") {
        this.$refs.filelist.updateFileList(
          // `${this.$store.state.server_ip}:21033`,
          `${this.$refs.filelist.path}/${item.name}`
        );
      } else {
        let __tmp = item.name.split(".");
        let _ext = __tmp[1]
        let _name = __tmp[0]
        console.log(item.name);

        if (filter.indexOf(_ext) >= 0) {
          //이미지 파일
          this.editor.loadImage(`${this.$refs.filelist.path}/${item.name}`);
        } else if (_ext == "xml") {
          // console.log(`load voc : ${}`);

          let _= await this.editor.loadVocLabelData(
            `${this.$refs.filelist.path}/${_name}`,
            this.labelInfo
            
          );
          console.log(_)
        }
      }
    },
    onLabelNameSelected() {
      console.log(this.selectedLabel);
    },
    onLabelPropertyChanged(item) {
      console.log(item);
    },
    async onkeydown(evt) {
      console.log(evt);
      console.log(this.editor);

      if (document.activeElement.tagName === 'INPUT') return;

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
                this.$refs.filelist.selectPrevItem()
              }
              break;
            case "KeyD":
              {
                //다음 아이템 선택 
                this.$refs.filelist.selectNextItem()
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
            case "KeyO":
              {
                // this.waitWindowDom.classList.remove("hide");

                if (evt.altKey == true && evt.shiftKey == true) {
                  //강제저장
                  let _ = await this._saveAnnotation({
                    overwrite: true,
                  });
                  console.log(_);
                } else {

                  console.log(this.selectImgName)


                  /*let _overwrite = false;

                  
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
                  */
                }

                // this.waitWindowDom.classList.add("hide");
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

    // document.addEventListener("keydown"

    document.addEventListener("keydown", this.onkeydown);

    this.editor = this.$refs.labelEditor.editor;

    // console.log(lodash.values(this.labelInfo))
    this.labelInfo_a = lodash.values(this.labelInfo);
    if (this.labelInfo_a.length > 0)
      this.selectedLabel = this.labelInfo_a[0].name;
  },
  unmounted() {

    console.log('unmount ')
    document.removeEventListener("keydown", this.onkeydown);

  },
  created() {
    console.log(this.$store.state.dataset_conf.names);

    // function random_rgba() {
    //     var o = Math.round, r = Math.random, s = 255;
    //     return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
    // }

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
  }
};
</script>

<style>
@import "../assets/scss/core.scss";
</style>