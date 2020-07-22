function MateFlowScrollBox(mateId) {
    this.mateId = mateId;
    this.scrollBox = false;
    this.mapTree = [];
    this.mapTree_id = {};
    this.scrollList_id = 'scrollList' + this.mateId.replace('secondList', '');
    this.scrollHtml = '';
    this.tipIndex = false;
    this.annotationMap = {};
    this.annotationList = [];
    this.annotationTopList = [];
}
MateFlowScrollBox.prototype.Singleheight = 18;
MateFlowScrollBox.prototype.createDom = function () {
    let that = this;

    if (that.scrollBox === false) {

        let divDom = document.createElement('div');
        divDom.setAttribute('target_mate', that.mateId);
        that.scrollBox = divDom;
    }

    return that;
}

/**
 * 将结构树转为Object，key值位ID
 */
MateFlowScrollBox.prototype.initMapTreeToObject = function () {
    let that = this;
    that.mapTree.forEach((item, index) => {

        that.mapTree_id[item.id] = item;
    });
}

/**
 * 由html结构生成结构树
 * @param {[jQueryElement]} domArray 
 * @param {[Object]} json 
 */
MateFlowScrollBox.prototype.getMapTree = function (domArray, json = []) {
    let that = this;
    let id = that.mateId;
    domArray.each((index, item) => {
        let id = $(item).attr('id');
        let info = ctx.get(id);
        if (typeof info != 'undefined') {


            let tObj = {
                id: id,
                steps: false,
                annotation: domUtils.getAnnotation(id)
            };

            switch (info.type) {
                case "hashfor":
                case 'for':
                    tObj.type = 'for';
                    tObj.steps = [];

                    that.getMapTree($(item).find('>.node-main-box').find('>.for-menu-box').find('>ul').find('>li').not('.segmentation-li'), tObj.steps)

                    break;
                case 'if':
                    tObj.type = 'if';
                    tObj.switch = [
                        [],
                        []
                    ];

                    that.getMapTree($(item).find(">.node-main-box>.if-else-main-box>.then >ul >li").not(".segmentation-li"), tObj.switch[0])
                    that.getMapTree($(item).find(">.node-main-box>.if-else-main-box>.else >ul >li").not(".segmentation-li"), tObj.switch[1])

                    break;
                case 'excelToObject':
                    tObj.type = 'excelToObject';
                    tObj.steps = [];

                    that.getMapTree($(item).find('>.node-main-box').find('>.for-menu-box').find('>ul').find('>li').not('.segmentation-li'), tObj.steps)
                    break;
                default:
                    tObj.type = 'common';

                    break;
            }
            if (tObj.annotation) {
                that.annotationMap[id] = tObj;
            }
            json.push(tObj);
        }else {
            console.log(id,item)
        }
    })
}

/**
 * 更新树结构
 * @param id 更新的节点id
 * @param prevId 更新节点的上一个节点id
 * @param parentIds [parentId] 更新节点的父级id
 */
MateFlowScrollBox.prototype.updateMapTree = function ({
    id = false,
    prevId = false,
    parentIds = []
} = {}) {
    let reverseIDs = parentIds.reverse();
    let tObj = that.mapTree_id;
    if (id) {

        return false;
    } else {
        // if(reverseIDs.length > 0){
        //     if(){

        //     }
        //     reverseIDs.forEach((item,index)=>{
        //         tObj = tObj[item];
        //     });
        // };
        // if(prevId){
        //     tObj = 
        // }
    }
}

/**
 * 刷新注释
 */
MateFlowScrollBox.prototype.reashMapTree = function () {
    let t = '';
    let that = this;

    for (const key in that.annotationMap) {
        if (that.annotationMap.hasOwnProperty(key)) {
            const element = that.annotationMap[key];

        }
    }
}

/**
 * 创建分支
 */
MateFlowScrollBox.prototype.createTreeBranch = function (domArray, isFirstLuoji = true) {
    let that = this;
    let isFirst = false;
    if (typeof domArray === 'undefined') {
        domArray = that.mapTree;
        isFirst = true;
        that.scrollHtml = '<ul class="scroll-nodeItem-list" id="' + that.scrollList_id + '">';
    }
    domArray.forEach((item, index) => {
        let tempAnnotation = item.annotation ? item.annotation : "";
        // let 
        switch (item.type) {
            case 'if':
                that.scrollHtml += '<li class="scroll-nodeItem scroll-if-item" id="scrollItem' + item.id + '">';
                that.scrollHtml += '<span class="scroll-item-annotation ' + (tempAnnotation ? 'scroll-item-has-annotation' : '') + '" title="' + tempAnnotation + '"></span>';
                if (isFirstLuoji) {

                    that.scrollHtml += '<ul class="scroll-nodeItem-list scroll-nodeItem-if-list">';
                    that.createTreeBranch(item.switch[0], false);
                    that.scrollHtml += '</ul>';
                }
                that.scrollHtml += '</li>';
                break;
            case 'hasfor':
            case 'for':
                that.scrollHtml += '<li class="scroll-nodeItem scroll-for-item" id="scrollItem' + item.id + '">';
                that.scrollHtml += '<span class="scroll-item-annotation ' + (tempAnnotation ? 'scroll-item-has-annotation' : '') + '" title="' + tempAnnotation + '"></span>';
                if (isFirstLuoji) {

                    that.scrollHtml += '<ul class="scroll-nodeItem-list">';
                    that.createTreeBranch(item.steps, false);
                    that.scrollHtml += '</ul>';
                }
                that.scrollHtml += '</li>';
                break;
            case 'common':
                that.scrollHtml += '<li class="scroll-nodeItem scroll-common-item" id="scrollItem' + item.id + '">';
                that.scrollHtml += '<span class="scroll-item-annotation ' + (tempAnnotation ? 'scroll-item-has-annotation' : '') + '" title="' + tempAnnotation + '"></span>';
                that.scrollHtml += '</li>';
                break;
            default:
                console.error('未定义的元流程类型', item)
                break;
        }
    });
    if (isFirst) {
        that.scrollHtml += '</ul>';
        $('.detail-liucheng-scroll').append(that.scrollHtml)
    }
}

/**
 * 显示title的tip
 */
MateFlowScrollBox.prototype.showAnnotation = function () {
    let that = this;
    if (that.tipIndex) {
        layer.close(that.tipIndex);
        that.tipIndex = false;
    }

}

/**
 * 获取有注释节点高度数组
 */
MateFlowScrollBox.prototype.getAnnotationTop = function () {
    let that = this;
    that.annotationList = [];
    that.annotationTopList = [];
    for (const key in that.annotationMap) {
        if (that.annotationMap.hasOwnProperty(key)) {
            const element = that.annotationMap[key];
            let topToInt = that.getAnnotationTopNum(key);
            that.annotationList.push(element);
            that.annotationTopList.push(topToInt);
        }
    }

}

/**
 * 获取单节点的高度+index串
 */
MateFlowScrollBox.prototype.getAnnotationTopNum = function (id, index = false) {
    let that = this;
    let offsetTop = domUtils.calcOffsetTop(id);
    let toStringIndex;
    let num = index !== false ? index : that.annotationList.length
    switch ((num + '').length) {
        case 1:
            toStringIndex = '000' + num;
            break;
        case 2:
            toStringIndex = '00' + num;
            break;
        case 3:
            toStringIndex = '0' + num;
            break;
        case 4:
            toStringIndex = '' + num;
            break;
        default:
            console.error("流程长度过长，有注释的节点超过10000")
            break;
    }
    let topToInt = parseInt(parseInt(offsetTop * 10) + '' + toStringIndex);
    return topToInt;
}

/**
 * 有高度数组生成html
 */
MateFlowScrollBox.prototype.createTreeBranchByHeight = function () {
    let that = this;
    let bufferHeight = [];
    let bufferRealTop = [];
    that.annotationTopList.sort((a, b) => a - b);
    that.scrollHtml = '<ul class="scroll-nodeItem-list" id="' + that.scrollList_id + '">';

    that.annotationTopList.forEach((item, index) => {
        let t = (item + '').substr((item + '').length - 4);
        let h = parseInt((item + '').substring(0, (item + '').length - 4)) / 10;
        let num = parseInt(t);
        let tTop = h / 6;
        bufferHeight.push(h);
        if (tTop - bufferHeight[index - 1] / 6 < 0 && index != 0) {
            console.error('排序错误', index, item, bufferHeight);
        }
        if (tTop - bufferRealTop[index - 1] < that.Singleheight && index != 0) {
            tTop = that.Singleheight - (tTop - bufferRealTop[index - 1]) + tTop;
        }
        bufferRealTop.push(tTop);
        that.scrollHtml += '<li class="scroll-nodeItem scroll-common-item" id="scrollItem' + that.annotationList[num].id + '" style="top:' + (tTop + 40 + 'px') + '"><span class="scroll-item-annotation" data-title="' + that.annotationList[num].annotation + '"></span>';
        that.scrollHtml += '<div class="scroll-common-item-annotation"><span>' + that.annotationList[num].annotation + '</span></div>'
        that.scrollHtml += '</li>';
    });
    that.scrollHtml += '</ul>';
    if ($('.detail-liucheng-scroll').find('#' + that.scrollList_id).length > 0) {

        $('.detail-liucheng-scroll').find('#' + that.scrollList_id).remove();
    }
    $('.detail-liucheng-scroll').append(that.scrollHtml);
    $('.detail-liucheng-scroll').find('#' + that.scrollList_id).show();
}

/**
 * 更新高度list
 */
MateFlowScrollBox.prototype.updateHeightList = function (id, val, type) {
    let that = this;
    // let topToInt = that.getAnnotationTopNum(id);
    let isExist = false;
    if (typeof id !== 'undefined') {

        if (type == 'delete') {
            delete that.annotationMap[id];

        } else {
            if (typeof that.annotationMap[id] === 'undefined') {
                that.annotationMap[id] = {
                    id: id,
                    annotation: val
                };
            } else {
                that.annotationMap[id].annotation = val;
            }
        }
    }
    that.getAnnotationTop();
    that.createTreeBranchByHeight();
}

MateFlowScrollBox.prototype.initStart = function () {
    let that = this;
    that.mapTree = [];
    that.annotationMap = {};
    that.getMapTree($('#' + that.mateId).find('>li').not('.segmentation-li'), that.mapTree, true);
    that.getAnnotationTop();
    that.createTreeBranchByHeight();
}