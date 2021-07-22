
<template>
  <h1>Project Dejavue version 1.0</h1>
  <div>
    ip : <input type="text" v-model="serverIp" /> 
    port : <input type="text" v-model="serverPort" />
  </div>

  <div  v-if="errmsg" >
    <p> {{errmsg}} </p>
    <p> check server address! </p>

  </div>
  <div v-else>
    <p>{{prjName}}</p>
    <p>{{ settingsData.dataset_base_path }}</p>
    <p>copyright 2021 unnamed company</p>
  </div>
  
</template>
<script>
export default {
  name: "Home",
  computed: {
    errmsg() {
      return this.$store.state.err_msg;
    },
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
          server_port: value,
        });
      },
    },
    settingsData() {
      return this.$store.state.settings;
    },
    prjName() {
      return this.$store.state.projectName
    }
  },
  

  // created() {
  //   console.log(this.$store.state.server_port)
  // }
};
</script>


<style>

</style>