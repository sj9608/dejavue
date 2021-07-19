<template>
  <div ref="_root">
    <!-- <div style="width: 250px; height: 250px; background-color: red"></div> -->
    <!-- <input type="text" /> -->
    <canvas ref="canvas" width="1024" height="1024"></canvas>

    <!-- <hr />
    <button @click="test">test</button> -->
  </div>
</template>

<script>
import { ANEditor } from "@/libs/labelEditor.js";

export default {
  name: "LabelEditor",
  emits: ["onChangeProperty"],
  props: {
    // baseUrl: {
    //   type: String,
    //   required: true,
    // },
    config: {
      type: Object,
      required: true,
    },
  },
  computed : {
  },
  methods: {
    // test() {
    //   this.editor.showCrossLine();
    // },
  },
  mounted() {
    //   console.log(this.$props.config)

    let config = {
      base_ip: this.$props.config.base_ip,
      rest_port: parseInt(this.$props.config.rest_port),
      wine_port: parseInt(this.$props.config.wine_port),
      dataset_path: this.$props.config.dataset_path,
      upload_path: this.$props.config.upload_path,
      imgsz: parseInt(this.$props.config.imgsz),
    };

    console.log(config);

    let editor = new ANEditor({
      config: config,
      canvasID: this.$refs.canvas,
      cbChangeProperty: (label_obj) => {
        console.log(label_obj);
        this.$emit("onChangeProperty", label_obj);

        // //라벨 수정 할때...
        // let rect = label_obj.rect;
        // // 편집창 데이터 갱신
        // let _r = [
        //   rect.aCoords.tl.x,
        //   rect.aCoords.tl.y,
        //   rect.aCoords.br.x,
        //   rect.aCoords.br.y,
        // ];
        // this.propertyInput.forEach((v, i) => {
        //   v.value = Math.floor(_r[i]);
        // });

        // this.class_selector.value = label_obj.class;
      },
    });
    editor.showImgszRect();
    editor.showCrossLine();
    this.editor = editor;
    console.log(editor);

    //setup key event
    
  },
};
</script>