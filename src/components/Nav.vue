<template>
  <div class="navigation" >
    <ul>
      <li><a><router-link to="./">Home</router-link></a></li>
      <li><a><router-link to="./detector">detector</router-link></a></li>
      <li><a><router-link to="./opserver">opserver</router-link></a></li>
      <li><a><router-link to="./dataMng">data_mng</router-link></a></li>
      <li><a><router-link to="./img_labeler">img_labeler</router-link></a></li>
      <li><a><router-link to="./project_mng">project_mng</router-link></a></li>
      <li><a><router-link to="./trainer">trainer</router-link></a></li>
      <li><a><router-link to="./help">help</router-link></a></li>
      <li><a><router-link to="./todo">todo</router-link></a></li>
    </ul>
  </div>
</template>


<script>
export default {
  
}
</script>


<style>
@import '../assets/scss/nav.scss'
</style>