<template>
  <canvas ref="mainCanvas" width="512" height="512"> </canvas>
  <button @click="test" >test</button>
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
    return {};
  },
  methods: {
      clear() {
        this.imgObj.setElement({})
    },
      test() {
          console.log('test ' )
          this.test2()
      },
      test2() {
          console.log(this.baseUrl)

      },
      async loadImageFromFile(file) {

        let data_uri = await new Promise((resolve) => {
            let reader = new FileReader();
            reader.onload = (_) => {
                return resolve(_.target.result)
            }
            reader.readAsDataURL(file);
        })

        await this.loadImageFromBolb(data_uri, file.name)
    }

    
  },
};
</script>