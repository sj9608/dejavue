<template>
  <h1>data manager</h1>
  <ImagerViwer :baseUrl="baseUrl"/>
</template>

<script>

import ImagerViwer from '@/components/ImageViewer.vue'

export default {
  name: "dataMng",
  components : {
    ImagerViwer

  },
  computed : {
    baseUrl() {
      return `${this.$store.state.server_ip}:${this.$store.state.server_port}`
    }
  }
};
</script>