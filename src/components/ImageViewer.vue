<template>
  <canvas ref="mainCanvas" width="512" height="512"> </canvas>
  <!-- <button @click="test">test</button>
  <button @click="loadImage()">load img</button> -->
</template>

<script>
import { fabric } from "fabric";

export default {
  name: "ImagerViwer",
  props: {
    baseUrl: {
      type: String,
      required: true,
    },
  },
  mounted() {
    const ref = this.$refs.mainCanvas;
    const canvas = new fabric.Canvas(ref);

    //이미지 오브잭트 만들기
    let imgObj = new fabric.Image();
    imgObj.set({
      selectable: false, //disable edit
      evented: false,
      originX: "center",
      originY: "center",
    });
    imgObj.setCoords();
    imgObj.on("deselected", () => {
      imgObj.selectable = false;
      imgObj.evented = false;
    });
    canvas.add(imgObj);

    this.fbCanvas = canvas;
    this.imgObj = imgObj;
  },
  data() {
    return {
      //  : this.$store.state.settings
    };
  },
  methods: {
    clear() {
      this.imgObj.setElement({});
      this.fbCanvas.requestRenderAll();
    },
    // test() {
    //   console.log("test ");
    //   this.test2();
    //   this.loadImage(
    //     "/home/gbox3d/work/visionApp/daisy_project/www/download.jpg"
    //   );
    // },
    // test2() {
    //   console.log(this.baseUrl);
    // },
    async loadImageFromFile(file) {
      let data_uri = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = (_) => {
          return resolve(_.target.result);
        };
        reader.readAsDataURL(file);
      });

      await this.loadImageFromBolb(data_uri, file.name);
    },
    async loadImageFromBolb(data_uri, filename) {
        //이미지 오브잭트 만들기 
        let _imgElement = await new Promise((resolve, reject) => {
          try {
            fabric.util.loadImage(data_uri, (_img) => {
                resolve(_img)
            })

          }
          catch(e)
          {
            reject(e)
          }
            
        })

        let _img_obj = this.imgObj

        _img_obj.set({
            scaleX: 1,
            scaleY: 1
        })
        _img_obj.rotate(0)
        _img_obj.setPositionByOrigin({ x: this.fbCanvas.width / 2, y: this.fbCanvas.height / 2 });
        _img_obj.setElement(_imgElement);
        _img_obj.setCoords();
        _img_obj.filename = filename

        this.fbCanvas.requestRenderAll();
    },
    async loadImage(_path) {
      // let _path = '/home/gbox3d/work/visionApp/daisy_project/www/download.jpg'

      console.log(this.$store.state.settings.wine_port)
      {
        try {
          // let _path = `${this.config.dataset_path}/src/${name}.png`
          let _bolb = await (
            await fetch(
              `http://${this.baseUrl}/rest/download?filepath=${_path}`
            )
          ).blob();
          let data_uri = URL.createObjectURL(_bolb);
          await this.loadImageFromBolb(data_uri, _path);
        } catch (e) {
          console.log(e);
          return e;
        }
      }

      return;
    }
  },
};
</script>