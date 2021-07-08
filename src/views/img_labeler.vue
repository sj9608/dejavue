<template>
    <!-- wait Window -->
    <div id='wait-window' class='hide'></div>

    <!-- app verison, alert Text -->
    <div style="margin: 8px" max-width="960px" id='header'>
        <div class='info_text'></div>
        <div class='alert_text'>ok</div>
    </div>

    <!-- 컨트롤 패널 -->
    <div id='control_panel' class='box-unit'>

        <div class='box-unit'>
            <!-- <button id='btn-img-file-list'>img files</button> -->
            <!-- <button id='btn-voc-file-list'>voc files</button> -->
            <button id='btn-enable-select'> enable edit img </button>

            <!-- <button id='btn-next-img'> Next Img</button> -->

            <button id='btn-fitin'> fit in rect </button>
            <button id='btn-zoomout'> zoom out </button>
            <button id='btn-reset-transform'> reset tranform </button>
            <button id='btn-find-nolabeledimg'> 라벨링 안된 이미지만 보이기 </button>

            <div class="hide" id='frame-select'>
                frame : <input type="range" value = 0 > total <span class='total'></span>
            </div>

        </div>

        <div class="box-unit">
            <input id='save-file-name'>
            <!-- <button id='btn-save'>save image</button> -->
            <button id='btn-save-label'>save annotation</button>
        </div>

        


        <div id='label_edit' class='box-unit'>

            <div class='box-unit edit-property'>
                <select class='label_name'>
                </select> xmin : <input class='xmin'> ymin : <input class='ymin'> xmax : <input class='xmax'> ymax :
                <input class='ymax'>
            </div>
            <!-- <input class='label_name' value='0'> -->
            <button class='add'>add</button>
            <button class='set'>set</button>
            <button class='del'>del</button>
            <button class='batch'>batch</button>
        </div>
    </div>

    <div>
        <canvas id='mainCanvas' ref="can" width="1024" height="1024"></canvas>
    </div>

    <!-- <Editor /> -->

</template>


<script>
import {fabric} from 'fabric'


export default {
    name: 'img_labeler',

    data() {
        return {
            
        }
    },
    mounted() {
        const ref = this.$refs.can;
        const canvas = new fabric.Canvas(ref);
        const rect = new fabric.Rect({
            fill: '',
            stroke: 'blue',
            width: 66,
            height: 66
        });
        canvas.add(rect);
    }
}
</script>


<style>
    @import '../assets/scss/core.scss'
</style>