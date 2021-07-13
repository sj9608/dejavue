
<template>
  <h1>Project Dejavue version 1.0</h1>
  ip : <input type="text" v-model="serverIp" /> ip :
  <input type="text" v-model="serverPort" />
  <p>{{settingsData.dataset_base_path}}</p>
  <p>copyright 2021 unnamed company</p>
</template>
<script>
export default {
  name: "Home",
  computed: {
    serverIp: {
      get() {
        return this.$store.state.server_ip;
      },
      set(value) {
        // console.log(value);
        this.$store.commit({
          type: "updateServerIp",
          server_ip: value,
        });
      },
    },
    serverPort: {
      get() {
        return this.$store.state.server_port;
      },
      set(value) {
        // console.log(value);
        this.$store.commit({
          type: "updateServerPort",
          server_ip: value,
        });
      },
    },
    settingsData() {
      return this.$store.state.settings

    },
  },


  // created() {
  //   console.log(this.$store.state.server_port)
  // }
};
</script>