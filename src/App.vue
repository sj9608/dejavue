<template>
  <div class="wait-window" v-if="bWaitWindow"></div>
  <Nav />
  <div>
    <router-view />
  </div>
</template>

<script>
import Nav from "./components/Nav.vue";

export default {
  name: "App",
  components: {
    Nav,
  },
  async created() {
    console.log("start app...");
    this.$store.dispatch("loadSettings");
  },
  computed: {
    bWaitWindow() { //대기창 상태
      // console.log(this.$store.state.bWaitWindow)
      return this.$store.state.bWaitWindow;
    },
  },
};
</script>

<style  >

#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50; */
  margin-top: 10px;
}

.wait-window {
  position: absolute;
  z-index: 10;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

@import "assets/scss/core.scss";
@import "assets/scss/prjmng2.scss";
@import "assets/scss/input_box.scss";
</style>
