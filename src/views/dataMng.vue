<template>
  <h1>data manager</h1>

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
      return `${this.$store.state.server_ip}:21033`
    }
  },
  mounted() {
    //현재 프로잭트 디랙토리로 이동 
    this.$refs.filelist.updateFileList(
      // `${this.$store.state.server_ip}:21033`,
      "/home/gbox3d/work/dataset/handsign/"
    );
    this.$refs.imgViewer.loadImage(
      "/home/gbox3d/work/visionApp/daisy_project/www/download.jpg"
    );
  },
  methods: {
    onSlectFileList(item) {

      console.log('update')
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