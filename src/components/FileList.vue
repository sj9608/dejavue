<template>
  <div class="file-list-root">
    <p>{{ path }}</p>
    <p>{{ selectItem.name }}</p>
    <ul>
      <li
        v-for="(item, index) in filelist"
        :key="index"
        @click="selectList(item)"
      >
        {{ item.type }},{{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "FileList",
  emits: ["onSelect"],
  data() {
    return {
      filelist: [],
      selectItem: {},
      path: "",
    };
  },
  methods: {
    async updateFileList(baseUrl, path) {
      this.path = path;
      let url = `http://${baseUrl}/rest/exec?cmd=ls -al&cwd=${path}`;

      //   console.log(url);
      let _ = await (await fetch(url)).json();
      //   console.log(_);

      let files = _.stdout.split("\n");

      let _fileList = [];

      files.forEach((name) => {
        let _info = name.split(" ");

        //공백 제거
        _info = _info.reduce((acc, _) => {
          if (_ != "") {
            acc.push(_);
          }
          return acc;
        }, []);

        // if (_info[0].charAt(0).toLowerCase() != "d") {
        //   //파일만 골라내기

        // }

        if (_info.length >= 9) {
          _fileList.push({
            type: _info[0], //d 면 디랙토리
            name: _info[_info.length - 1],
          });
        }

        // console.log(_info)
      });
      this.filelist = _fileList;

    //패스명 정리(상대경로 빼기)
      {
        let url = `http://${baseUrl}/rest/exec?cmd=pwd&cwd=${this.path}`;
        let _ = await (await fetch(url)).json();

        this.path = _.stdout
        // let files = _.stdout.split("\n");

      }
    },
    selectList(item) {
      console.log(item);
      this.selectItem = item;
      this.$emit("onSelect", item);
    },
  },
};
</script>


<style>
.file-list-root {
  border: 1px solid black;
  margin: 5px;
}
.file-list-root ul {
  width: 320px;
  height: 240px;
  overflow: auto;
  background-color: blue;
}
.file-list-root li {
  color: yellow;
}
</style>