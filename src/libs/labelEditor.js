// console.log('Anotation Editor module load')
import { fabric } from "fabric";
import { xml2js,json2xml } from "xml-js";

class ANEditor {
    constructor({ config, canvasID, cbChangeProperty }) {

        //캔버스 셋업
        {
            let fbCanvas = new fabric.Canvas(canvasID, {
                backgroundColor: '#a278ff',
                preserveObjectStacking: true, //선택한 오브잭트 현재 z 순서  유지
                enableRetinaScaling: false //레티나 비활성화
            })
            let imgObj = new fabric.Image()
            fbCanvas.on('mouse:move', (evt) => {
                this.mousePos = evt.absolutePointer;
                // console.log(evt)
            })

            imgObj.set({
                selectable: false, //disable edit
                evented: false,
                originX: 'center',
                originY: 'center'
            })
            imgObj.setCoords()
            imgObj.on('deselected', () => {
                imgObj.selectable = false
                imgObj.evented = false
            })
            fbCanvas.add(imgObj)
            this.imgObj = imgObj


            //캡쳐영역 표시 
            let imgszRect = new fabric.Rect({
                fill: 'transparent',
                stroke: 'blue',
                width: config.imgsz,
                height: config.imgsz,
                selectable: false, //disable edit
                evented: false,
                originX: 'center',
                originY: 'center',
                visible: false
            });
            fbCanvas.add(imgszRect)
            this.imgszRect = imgszRect
            imgszRect.setPositionByOrigin({ x: fbCanvas.width / 2, y: fbCanvas.height / 2 });
            imgszRect.setCoords()
            


            //cross line
            let crossLine = new fabric.Group([
                this.makeLine([0, fbCanvas.height / 2, fbCanvas.width, fbCanvas.height / 2], '#00ff00'),
                this.makeLine([fbCanvas.width / 2, 0, fbCanvas.width / 2, fbCanvas.height], '#00ff00')
            ], {
                evented: false,
                selectable: false
            })
            crossLine.visible = false;
            this.crossLine = crossLine;
            fbCanvas.add(crossLine);

            //deselect event 
            fbCanvas.on('before:selection:cleared', () => {
                this.selectedLabel = undefined;
            })

            this.fbCanvas = fbCanvas;
        }

        this.cbChangeProperty = cbChangeProperty

        this.config = config
        console.log(config)
        this.labelObjs = []
        this.selectedLabel = undefined
        this.restApiAddress = `${this.config.base_ip}:${this.config.rest_port}/rest`
    }
    //작업영역 바운딩 박스 구하기 
    getImgRectBound() {
        //실제 이미지에 정수화된 길이값으로 구하기

        // let _bound = this.imgszRect.getBoundingRect()

        return { 
            left:  Math.round(this.fbCanvas.width/2 - this.config.imgsz/2),  //Math.floor( _bound.left),
            top: Math.round(this.fbCanvas.height/2 - this.config.imgsz/2),    //Math.floor( _bound.top ),
            width : this.config.imgsz,
            height : this.config.imgsz
        }
    }
    changeSelectedLabelAttr({name,color}) {

        if(this.selectedLabel) {
            this.selectedLabel.class = name
            //this.editor.selectedLabel.rect.set("stroke", this.labelInfo[this.selectedLabel].color) //컬러 변경 
            this.selectedLabel.rect.set("stroke", color)
            this.fbCanvas.renderAll()
        }
    }
    toNoneScale(_obj) {

        // {
        let xmin = _obj.aCoords.tl.x,
            ymin = _obj.aCoords.tl.y,
            xmax = _obj.aCoords.br.x,
            ymax = _obj.aCoords.br.y;
        // }

        let _opt = {
            width: xmax - xmin,
            height: ymax - ymin,
            scaleX: 1,
            scaleY: 1
        }
        let _tran = {
            x: Math.round((xmin + xmax) / 2),
            y: Math.round((ymin + ymax) / 2)
        }
        // console.log(_opt)
        // console.log(_tran)

        _obj.set(_opt)
        _obj.rotate(0);
        _obj.setPositionByOrigin(_tran);
        _obj.setCoords()
    }
    makeLine(coords, color) {
        return new fabric.Line(coords, {
            stroke: color,
            strokeWidth: 1,
            selectable: false,
            evented: false
        });
    }
    moveCenter(obj) {
        obj.setPositionByOrigin({ x: this.fbCanvas.width / 2, y: this.fbCanvas.height / 2 });
        obj.setCoords()
    }
    resetTransform(obj) {

        obj.rotate(0)
        obj.scaleX = 1
        obj.scaleY = 1
        obj.setPositionByOrigin({ x: this.fbCanvas.width / 2, y: this.fbCanvas.height / 2 });
        obj.setCoords()

    }
    addLabelObject({ xmin, ymin, xmax, ymax, class_name, color = 'red',translate = true  }) {

        // let imgszRect = this.imgszRect

        let imgBnd = this.getImgRectBound()

        let _w = xmax - xmin;
        let _h = ymax - ymin;

        console.log(_w,_h)

        let _left = (xmin + _w / 2);
        let _top  = (ymin + _h / 2);

        if (translate) { //좌상단기준으로 이동후 중심점에 맞추기 
            
            _left += imgBnd.left//(512 - this.config.imgsz/2)
            _top +=  imgBnd.top//(512 - this.config.imgsz/2)

            // _left += imgszRect.aCoords.tl.x
            // _top += imgszRect.aCoords.tl.y
        }

        let rect = new fabric.Rect({
            fill: 'transparent',
            stroke: color,
            strokeWidth: 2,
            width: _w,
            height: _h,
            left: _left,
            top: _top,
            // hasRotatingPoint: false,
            originX: 'center',
            originY: 'center'
        });

        rect.class_name = class_name

        this.fbCanvas.add(rect);
        let label_obj = {
            class: class_name,
            rect: rect
        }
        this.labelObjs.push(label_obj)

        rect.on('moving', () => {
            this.cbChangeProperty && this.cbChangeProperty(label_obj)
        })
        rect.on('scaling', () => {
            this.cbChangeProperty && this.cbChangeProperty(label_obj)
        })
        rect.on('scaled', () => {
            this.toNoneScale(rect)
            this.cbChangeProperty && this.cbChangeProperty(label_obj)
        })
        rect.on('mousedown', () => {
            this.selectedLabel = label_obj
            this.cbChangeProperty && this.cbChangeProperty(label_obj)
        })

        this.cbChangeProperty && this.cbChangeProperty(label_obj)
        return label_obj
    }
    removeLabelObject(selObj) {

        if (selObj === undefined) {
            selObj = this.fbCanvas.getActiveObject()
        }

        if (selObj) {
            this.fbCanvas.remove(selObj)

            //찾아서 지우기 

            let _idx = 0
            for (; _idx < this.labelObjs.length; _idx++) {
                if (this.labelObjs[_idx].rect == selObj) break;
            }
            if (_idx < this.labelObjs.length) { //found
                // let _idx = this.labelObjs.indexOf(selObj)
                console.log(_idx)
                this.labelObjs.splice(_idx, 1)
            }

        }

        // selObj ? this.fbCanvas.remove(selObj) : alert('not select object')

    }
    showCrossLine() {
        this.crossLine.visible = true
        this.fbCanvas.requestRenderAll()
    }
    hideCrossLine() {
        this.crossLine.visible = false
        this.fbCanvas.requestRenderAll()
    }
    hideImgszRect() {
        this.imgszRect.visible = false
        this.fbCanvas.requestRenderAll()
    }
    showImgszRect() {
        this.imgszRect.visible = true
        this.fbCanvas.requestRenderAll()
    }
    enableImgSelect() {
        this.imgObj.selectable = true;
        this.imgObj.evented = true;
        this.fbCanvas.setActiveObject(this.imgObj)
        this.fbCanvas.requestRenderAll()
    }
    disableImgSelect() {
        this.imgObj.selectable = false;
        this.imgObj.evented = false;
        this.fbCanvas.deactivateAll().requestRenderAll()
    }
    clearEditor() {
        this.clearLabelData()
        this.imgObj.setElement({})
    }
    clearLabelData() {
        //라벨링 오브잭트 모두지우기
        this.labelObjs.forEach(_ => {
            console.log(`delete ${_.class}`)
            this.fbCanvas.remove(_.rect)
        })
        this.labelObjs = []
        this.selectedLabel = undefined
    }

    //voc
    async loadVocLabelData(name, label_def) {

        try {

            let _ext = ['jpeg', 'jpg', 'png']

            let _index = 0

            let _path
            let _imgElement
            while (_index < _ext.length) {
                let data_uri
                _path = `${name}.${_ext[_index++]}`
                let _bolb = await (await fetch(`http://${this.restApiAddress}/download?filepath=${_path}`)).blob()
                if (_bolb.size > 1024) {
                    data_uri = URL.createObjectURL(_bolb);
                    //이미지 오브잭트 만들기 
                    _imgElement = await new Promise((resolve) => {
                        fabric.util.loadImage(data_uri, (_img) => {
                            resolve(_img)
                        })
                    })
                    if (_imgElement != null)
                        break;
                }
            }

            let _img_obj = this.imgObj

            _img_obj.rotate(0)
            _img_obj.scaleX = 1;
            _img_obj.scaleY = 1;
            _img_obj.setPositionByOrigin({ x: this.fbCanvas.width / 2, y: this.fbCanvas.height / 2 });
            _img_obj.setElement(_imgElement);
            _img_obj.setCoords();
            _img_obj.filename = _path

            //라벨링 오브잭트 모두지우기
            this.clearLabelData()

            //update xml
            let _xml_path = `${name}.xml`

            let _label_data = await (await fetch(`http://${this.restApiAddress}/download?filepath=${_xml_path}`)).text()

            _label_data = xml2js(_label_data, { compact: true, spaces: 4 })

            console.log(_label_data)
            this.current_pascal_voc_data = _label_data;

            let _labelObj = _label_data.annotation.object

            console.log(_labelObj)

            if (Array.isArray(_labelObj)) { //배열이면
                _labelObj.forEach(_ => {

                    let _label_define = label_def[_.name._text]
                    // if(color_table) 
                    if (_ && _.bndbox && _label_define) {
                        this.addLabelObject({
                            xmin: parseInt(_.bndbox.xmin._text),
                            xmax: parseInt(_.bndbox.xmax._text),
                            ymin: parseInt(_.bndbox.ymin._text),
                            ymax: parseInt(_.bndbox.ymax._text),
                            class_name: _.name._text,
                            color: _label_define.color
                        })
                    }
                    else {
                        console.log(`cannot load ${_.name._text}`)
                    }

                })

            } else { //배열이 아닐경우 
                
                let _label_define = label_def[_labelObj.name._text]
                
                if (_labelObj && _labelObj.bndbox && _label_define) {
                    this.addLabelObject({
                        xmin: parseInt(_labelObj.bndbox.xmin._text),
                        xmax: parseInt(_labelObj.bndbox.xmax._text),
                        ymin: parseInt(_labelObj.bndbox.ymin._text),
                        ymax: parseInt(_labelObj.bndbox.ymax._text),
                        class_name: _labelObj.name._text,
                        color: label_def[_labelObj.name._text].color
                    })
                }
                else {
                    console.log(`cannot load ${_labelObj.name._text}`)
                
                }
                // this.cbChangeProperty(label_obj)
            }
            this.fbCanvas.requestRenderAll()
            return {r:'ok',d:_labelObj}

        } catch (e) {
            console.log(e)
            return {r:'err',err:e}
        }
    }
    async saveVocLabelData({uploadName,uploadImgName,uploadPath}) {
        // console.log(theApp.labelObjs)

        // let uploadPath = `${this.config.dataset_path}/voc`

        let base_pt = {
            x: this.imgszRect.aCoords.tl.x,
            y: this.imgszRect.aCoords.tl.y
        }


        // let filename = this.imgObj.filename.replace(/^.*[\\\/]/, '')
        // let filename = this.item.name.split(".")[0];

        // if(upload_img_name != "") {
        //     filename = upload_img_name
        // }


        let _anno = {
            annotation: {
                folder: {
                    _text: 'Unspecified'
                },
                filename: {
                    _text: uploadImgName
                },
                path: { _text: 'Unspecified' },
                source: { database: { _text: 'Unknown' } },
                size: {
                    width: { _text: this.config.imgsz },
                    height: { _text: this.config.imgsz },
                    depth: { _text: 3 }
                },
                segmented: { _text: 0 },
                object: []
            }
        }

        this.labelObjs.forEach(_ => {
            // console.log(_)

            let _obj = _.rect
            let _imgszArea = {
                xmin: Math.round(_obj.aCoords.tl.x - base_pt.x),
                ymin: Math.round(_obj.aCoords.tl.y - base_pt.y),
                xmax: Math.round( _obj.aCoords.br.x - base_pt.x),
                ymax: Math.round(_obj.aCoords.br.y - base_pt.y)
            }


            let _bb = {
                name: { _text: _.class },
                pose: { _text: 'Unspecified' },
                truncated: { _text: 0 },
                difficult: { _text: 0 },
                bndbox: {
                    xmin: {
                        _text: Math.round(_imgszArea.xmin)
                    },
                    ymin: {
                        _text: Math.round(_imgszArea.ymin)
                    },
                    xmax: {
                        _text: Math.round(_imgszArea.xmax)
                    },
                    ymax: {
                        _text: Math.round(_imgszArea.ymax)
                    }
                }
            }
            _anno.annotation.object.push(_bb)
        })
        let xml = json2xml(_anno, { compact: true })
        console.log(xml)


        let _ = await (await (fetch(`http://${this.restApiAddress}/upload2`, {
            method: 'POST',
            body: xml,
            headers: new Headers({
                // 'detector-header-data' : JSON.stringify({ fn: 'none', th: 0.5, dtf: 1 })
                'Content-Type': 'text/xml',
                'Upload-Name': uploadName,
                'upload-path': uploadPath,
                'file-size': xml.length
            }), // 이 부분은 따로 설정하고싶은 header가 있다면 넣으세요
        }))).json();
        console.log(_)

        return _
    }
    

    //img
    async loadImage(_path) {

        try {
            // let _path = `${this.config.dataset_path}/src/${name}.png`
            console.log(`load img : ${_path}`)

            let _bolb = await (await fetch(`http://${this.restApiAddress}/download?filepath=${_path}`)).blob()
            let data_uri = URL.createObjectURL(_bolb);

            //이미지 오브잭트 만들기 
            let _imgElement = await new Promise((resolve) => {
                fabric.util.loadImage(data_uri, (_img) => {
                    resolve(_img)
                })
            })

            let _img_obj = this.imgObj

            _img_obj.set({
                scaleX: 1,
                scaleY: 1
            })
            _img_obj.rotate(0)
            _img_obj.setPositionByOrigin({ x: this.fbCanvas.width / 2, y: this.fbCanvas.height / 2 });
            // _img_obj.setPositionByOrigin({ x: 0, y: 0 });
            _img_obj.setElement(_imgElement);
            _img_obj.setCoords();
            _img_obj.filename = _path

            this.fbCanvas.requestRenderAll();

        } catch (e) {
            console.log(e)
            return e
        }
        return
    }
    async loadImageFromBolb(_blob) {

        let data_uri = URL.createObjectURL(_blob) //uri 변환
        //이미지 오브잭트 만들기 
        let _imgElement = await new Promise((resolve) => {
            fabric.util.loadImage(data_uri, (_img) => {
                resolve(_img)
            })
        })

        let _img_obj = this.imgObj

        _img_obj.set({
            scaleX: 1,
            scaleY: 1
        })
        _img_obj.rotate(0)
        _img_obj.setPositionByOrigin({ x: this.fbCanvas.width / 2, y: this.fbCanvas.height / 2 });
        _img_obj.setElement(_imgElement);
        _img_obj.setCoords();
        _img_obj.filename = 'blob.png';

        this.fbCanvas.requestRenderAll();
    }
    async loadImageFromFile(file) {

        let data_uri = await new Promise((resolve) => {
            let reader = new FileReader();
            reader.onload = (_) => {
                // console.log(_.target.result)
                return resolve(_.target.result)
            }
            reader.readAsDataURL(file);
        })

        //이미지 오브잭트 만들기 
        let _imgElement = await new Promise((resolve) => {
            fabric.util.loadImage(data_uri, (_img) => {
                resolve(_img)
            })
        })

        let _img_obj = this.imgObj

        _img_obj.set({
            scaleX: 1,
            scaleY: 1
        })
        _img_obj.rotate(0)
        _img_obj.setPositionByOrigin({ x: this.fbCanvas.width / 2, y: this.fbCanvas.height / 2 });
        _img_obj.setElement(_imgElement);
        _img_obj.setCoords();
        _img_obj.filename = file.name

        this.fbCanvas.requestRenderAll();

    }
    async saveImage({  uploadName, uploadPath }) {

        let _r = {}
        this.fbCanvas.discardActiveObject()

        this.fbCanvas.getObjects().forEach(_ => {
            _.visible = false
        })
        this.imgObj.visible = true
        this.fbCanvas.renderAll()

        //정해진 영역 추출 
        let _bound = this.getImgRectBound();
        let dataURI = this.fbCanvas.toDataURL({
            left:  _bound.left,
            top: _bound.top,
            width: _bound.width,
            height: _bound.height, 
            // width : this.config.imgsz,
            // height : this.config.imgsz,
            format: 'jpeg'
        })
        // this.alertDom.innerText = 'uploading...'
        try {
            //base64 를 blob으로 변환 
            //http://eugeneware.com/software-development/converting-base64-datauri-strings-into-blobs-or-typed-array
            let _blob = await (await fetch(dataURI)).blob()

            let _ = await (await (fetch(`http://${this.restApiAddress}/upload`, {
                method: 'POST',
                body: _blob,
                headers: new Headers({
                    // 'detector-header-data' : JSON.stringify({ fn: 'none', th: 0.5, dtf: 1 })
                    'Content-Type': _blob.type,
                    'Upload-Name': uploadName,
                    'upload-path': uploadPath,
                    'file-size': _blob.size
                }), // 이 부분은 따로 설정하고싶은 header가 있다면 넣으세요
            }))).json();
            console.log(_);
            _r = _
        } catch (e) {
            _r = {
                result: 'err',
                errmsg: e.message
            }
        }

        this.fbCanvas.getObjects().forEach(_ => {
            _.visible = true
        })
        this.fbCanvas.renderAll()

        return _r;
    }
    //video
    async loadVideo(_path) {
        let _url = `http://${this.restApiAddress}/video2img/open?vid=${_path}`
        return await (await fetch(_url)).json();
    }
    async getVideoFrame(_index) {
        // if (this._current_videoPath != undefined || this._current_videoPath != _path) {
        //     //새로 오픈 
        //     let _url = `http://${this.restApiAddress}/video2img/open?vid=${_path}`
        //     let _res = await (await fetch(_url)).json();
        //     console.log(_res)
        //     this._current_videoPath = _path
        // }

        let _blob = await (await fetch(`http://${this.restApiAddress}/video2img/read?index=${_index}`)).blob()
        // let data_uri = URL.createObjectURL(_bolb);
        return await this.loadImageFromBolb(_blob);
    }

    //detector
    async detectImage() {

        let _r = {}
        this.fbCanvas.discardActiveObject()

        //이미지만 보이게 하기 
        this.fbCanvas.getObjects().forEach(_ => {
            _.visible = false
        })
        this.imgObj.visible = true
        this.fbCanvas.renderAll()

        //정해진 영역 추출 
        // let _bound = this.imgszRect.getBoundingRect()
        let _bound = this.getImgRectBound();

        console.log( Math.floor(_bound.left))

        let dataURI = this.fbCanvas.toDataURL({
            left: _bound.left,
            top: _bound.top,
            width: _bound.width,
            height: _bound.height,
            format: 'jpeg'
        })
        // this.alertDom.innerText = 'uploading...'
        try {
            //base64 를 blob으로 변환 
            //http://eugeneware.com/software-development/converting-base64-datauri-strings-into-blobs-or-typed-array
            let _blob = await (await fetch(dataURI)).blob();
            let _ = await (await (fetch(`http://${this.restApiAddress}/detect`, {
                method: 'POST',
                body: _blob,
                headers: new Headers({
                    'Content-Type': 'text/plain',
                    // 'Access-Control-Allow-Origin': '*',
                    // 'Access-Control-Allow-Methods': 'POST',
                    'detector-header-data': JSON.stringify({ fn: 'none', th: 0.25, iou: 0.45, dtf: 'yolov5' })
                })
            }))).json();
            _r = _
        } catch (e) {
            _r = {
                result: 'err',
                errmsg: e.message
            }
        }
        //편집 도구들 다시 보이게 하기 
        this.fbCanvas.getObjects().forEach(_ => {
            _.visible = true
        })
        this.fbCanvas.renderAll()

        return _r

    }
}

export { ANEditor }