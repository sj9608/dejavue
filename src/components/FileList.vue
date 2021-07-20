<template>
  <div class="file-list-root">
    <p>{{ path }}</p>
    <p>{{ selectItem.name }}</p>
    <ul ref="fileListContiner">
      <li
        v-for="(item, index) in filelist"
        :key="index"
        @click="selectList(item,$event)"
        :class="{selected:selectItem.name == item.name}"
      >
        {{ item.type }},{{ item.name }}
      </li>
    </ul>
    <button @click="onGetoSelect"> scroll to select </button>
  </div>
</template>

<script>
export default {
  name: "FileList",
  emits: ["onSelect"],
  props: {
    baseUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      filelist: [],
      selectItem: {},
      // selectIndex : -1,
      path: "",
      currentListItem : null,
    };
  },
  methods: {
    async updateFileList( path) {
      this.path = path;
      let baseUrl = this.baseUrl;
      let url = `http://${baseUrl}/rest/exec?cmd=ls -al&cwd=${path}`;

      //   console.log(url);
      let _ = await (await fetch(url)).json();
      //   console.log(_);

      let files = _.stdout.split("\n");

      let _fileList = [];
      let _index = 0

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
            index : _index++,
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
    selectList(item,evt) {
      console.log(item);
      this.selectItem = item;
      // this.selectIndex = index;
      this.$emit("onSelect", item);

      // console.log(evt.target.offsetTop)
      // offsetTop = evt.target.offsetTop
      this.currentListItem = evt.target 
      
    },
    selectNextItem() {
      if(this.currentListItem.nextElementSibling) {
        
        this.currentListItem = this.currentListItem.nextElementSibling;
        this.selectItem = this.filelist[this.selectItem.index+1]
        // console.log(this.currentListItem.itemAttr)
        // this.selectIndex++
        // this.selectItem = this.filelist[this.selectIndex];
        // // this.selectIndex.index = index;
        this.$emit("onSelect", this.selectItem);
        
      }
    },
    selectPrevItem() {
      if(this.currentListItem.previousSibling) {
        
        
        this.currentListItem = this.currentListItem.previousSibling;
        this.selectItem = this.filelist[this.selectItem.index-1]

        // this.selectIndex--
        // this.selectItem = this.filelist[this.selectIndex];
        // // this.selectIndex.index = index;
        this.$emit("onSelect", this.selectItem);
        
      }
    },
    onGetoSelect() {
      // console.log(this.$refs.fileListContiner.offsetTop)
      //선택위치로 스크롤 조정 (주. 원래 위치에서 콘테이너 위치 만큼 빼주기)
      this.$refs.fileListContiner.scrollTop = this.currentListItem.offsetTop - this.$refs.fileListContiner.offsetTop;
      // console.log(this.currentListItem.offsetTop)

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
.file-list-root li.selected {
  background-color: black;
}
</style>