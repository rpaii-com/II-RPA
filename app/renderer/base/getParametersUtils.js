//是否是出参类型
function isTargetOutParameter(ele) {
    let hasOut = true;
    switch (ele) {
        case "getList": //获取列表内容
            outParam = "getList";
            hasOut = true;
            hasGetOut = true;
            break;

        case "getTable": //获取表格内容
            outParam = "getTable";
            hasOut = true;
            hasGetOut = true;
            break;

        case "resemblance": //获取相似元素内容
            outParam = "resemblance";
            hasOut = true;
            hasGetOut = true;
            break;

        case "InnerHTML": //获取页面元素内容
            outParam = "InnerHTML";
            hasOut = true;
            hasGetOut = true;
            break;
        case "for":
            outParam = "for";
            hasOut = true;
            hasGetOut = true;
            break;
        case "hashfor":
            outParam = "hashfor";
            hasOut = true;
            hasGetOut = true;
            break;
        case "importFile": //读取数据表格
            outParam = "tableData";
            hasOut = true;
            hasGetOut = true;
            break;
        case "importTextFile":
            outParam = "tableData";
            hasOut = true;
            hasGetOut = true;
            break;
        case "importFile_normal": //读取数据表格
            outParam = "tableData";
            hasOut = true;
            hasGetOut = true;
            break;
        case "importTextFile_normal":
            outParam = "tableData";
            hasOut = true;
            hasGetOut = true;
            break;
        case "exportFile": //获取表格内容
            outParam = "tableData";
            hasOut = true;
            hasGetOut = true;
            break;
        case "extractParam":
            outParam = "extractParam";
            hasOut = true;
            hasGetOut = true;
            break;

        case "saveNewParam":
            outParam = "saveNewParam";
            hasOut = true;
            hasGetOut = true;
            break;
        case "saveAccount": // JJW-TODO
            outParam = "saveAccount";
            hasOut = true;
            hasGetOut = true;
            break;
        case "calculateParam":
            outParam = "calculateParam";
            hasOut = true;
            hasGetOut = true;
            break;
        case "convertParam":
            outParam = "convertParam";
            hasOut = true;
            hasGetOut = true;
            break;
        case "callFunction":
            outParam = "callFunction";
            hasOut = true;
            hasGetOut = true;
            break;
        case "getSystemParameter":
            outParam = "getSystemParameter";
            hasOut = true;
            hasGetOut = true;
            break;
            //TODO 以下操作 无输出变量
        case "confirmSend":
            hasOut = true;
            break;
        case "copyFile":
            hasOut = true;
            break;
        case "getPageURL":
            hasOut = true;
            break;
        case "getVCode":
            hasOut = true;
            break;
        case "open_browser":
            hasOut = true;
            break;
        case "existence_browser":
            hasOut = true;
            break;
        case "alert_click_browser":
            hasOut = true;
            break;
        case "batchGrab_browser":
            hasOut = true;
            break;
        case "grab_browser":
            hasOut = true;
            break;
        case "wait_browser":
            hasOut = true;
            break;
        case "url_browser":
            hasOut = true;
            break;
        case "grab_alert_browser":
            hasOut = true;
            break;
        case "attribute_browser":
            hasOut = true;
            break;
        case "outlook_get":
            hasOut = true;
            break;

        case "encrypt_aes":
            hasOut = true;
            break;
        case "decrypt_aes":
            hasOut = true;
            break;
        default:
            hasOut = false;
            break;
    }
    return hasOut;
}

//寻找本身if循环出参
function getThisLiIfElseOutParam(thisLi) {
    let outParams = [];
    let outParam = {};
    thisLi.find(".if-else-menu-box > ul > li").each(function () {
        if (isTargetHasOutParam($(this))) {
            outParam.id = $(this)[0].id;
            outParam.name = $(this).find(">span.title").eq(0).text() + outParam.id;
            outParams.push(outParam);
        }
    });
    return outParams;
}

//寻找本身for循环出参
function getThisLiForOutParam(thisLi) {
    let outParams = [];
    let outParam = {};
    thisLi.find(".for-menu-box > ul > li").each(function () {
        if (isTargetHasOutParam($(this))) {
            outParam.id = $(this)[0].id;
            outParam.name = $(this).find(">span.title").eq(0).text() + outParam.id;
            outParams.push(outParam);
        }
    });
    return outParams;
}

//判断当前节点是否有出参
function isTargetHasOutParam(thisLi) {
    let thisDomId = thisLi.attr("id");
    // let first = 1;
    if (typeof ctx.get(thisDomId) != "undefined" && typeof ctx.get(thisDomId).outParameterName != "undefined") {
        return true;
    } else if (typeof ctx.get(thisDomId) != "undefined" && ctx.get(thisDomId).type == "koulingxuanze") {
        return true;
    } else {
        return false;
    }
}

//找到dom元素的父级,return 父层array
function findThisDomParent(dom, endDom, arr = []) {
    // let
    if (dom.eq(0).parent()[0] != endDom.eq(0)[0]) {
        if (dom.eq(0)[0].localName == "li") {
            arr.push(dom.eq(0).parent());
            findThisDomParent(dom.eq(0).parent(), endDom, arr);
        }
    } else {
        return arr;
    }
}

function getTargetItemCanUseParameters(isMain = false, onlyPart = false, metaFlowID, realOnly = false) {
    if (typeof metaFlowID == "undefined") {
        metaFlowID = $(".detail-liucheng-lists-box .liucheng-list.current-show-list").eq(0).attr("id");
    }
    //获取全局变量信息
    let globalParametersInfo = ctx.get("detailPretreatmentList");
    //获取局部变量信息
    let partParametersInfo = ctx.get(metaFlowID);
    //获取对应的主流程块ID
    let mainPartFlowID = metaFlowID.replace("secondList", "");
    //当前显示的元流程ID
    let targetMateItemId = $(".liucheng-list.current-show-list").eq(0).attr("id");
    let pretreatmentListId = $(".liucheng-list.detail-liucheng-pretreatment").eq(0).attr("id");
    let newGlobalArray = [];
    let curParams = [];
    let globalSameName = false;
    let partSameName = false;
    let globalLastName = '';
    let partLastName = '';
    let tempObj = {};
    globalParametersInfo.forEach((item, index) => {
        let tempIndex;
        let p = item.parentMateFlowId == pretreatmentListId ? true : false;
        newGlobalArray.forEach((ele, index) => {
            let t = ele.parentMateFlowId == pretreatmentListId ? true : false;
            if (item.name == ele.name) {
                if (p) {
                    if (t) {
                        tempIndex = index;
                    }
                } else {
                    tempIndex = index;
                }
            }
        });
        if (typeof tempIndex != "undefined") {
            newGlobalArray[tempIndex] = item;
        } else {
            newGlobalArray.push(item);
        };
    });
    if (!(typeof globalParametersInfo == "undefined") && !onlyPart) { //全局变量信息不为undefined
        newGlobalArray.forEach((item, index) => {
            let tObj = {};
            let tempText;
            let idOut = true;
            if ($("#" + item.parentMateFlowId).hasClass("detail-liucheng-pretreatment")) {
                tempText = "---来自全局变量";
            } else {
                let targetMainItemId = item.parentMateFlowId.replace("secondList", "");
                tempText = "---来自元流程" + $("#" + targetMainItemId).find(">span.title").text();
                // if (item.parentMateFlowId == targetMateItemId) {
                //     idOut = false;
                // }
            }
            if (globalLastName != '') {
                if (globalLastName == item.name) {
                    globalSameName = true;
                } else {
                    globalSameName = false;
                    globalLastName = item.name;
                }
            } else {
                globalLastName = item.name;
            }
            tempObj.moreName = item.name + tempText;
            tempObj.name = item.name;
            tempObj.id = item.fromId;
            tempObj.come = "global";
            if (idOut && !globalSameName) {
                tObj = commonUtils.getDeepCloneObj(tempObj);
                curParams.push(tObj);
            };
        });
    };
    if (!(typeof metaFlowID == "undefined") && !isMain) { //局部变量信息不为undefined
        //添加来自主流程for循环的单元迭代变量
        if ($("#" + mainPartFlowID).parents("li.this_for").length > 0 && !realOnly) {
            let forOut = {};
            forOut.come = "part";
            forOut.parentMateFlowId = targetMateItemId;
            forOut.type = "string";
            forOut.id = $("#" + mainPartFlowID).parents("li.this_for").attr("id");
            let htmlParametersArray = ctx.get(forOut.id).parameters;
            htmlParametersArray.forEach((item, index) => {
                if (item.name == "rename") {
                    forOut.name = item.value;
                }
            });
            curParams.push(forOut);
        }
        if (!(typeof partParametersInfo == "undefined")) {
            partParametersInfo.forEach((item, index) => {
                let tempObj = {};
                let tempType = ctx.get(item.fromId).type;
                tempObj.id = item.fromId;
                tempObj.come = "part";
                switch (tempType) {
                    case "koulingxuanze":
                        let tempObj1 = {};
                        tempObj1.id = item.fromId;
                        tempObj1.name = item.name + "账号";
                        tempObj1.come = "part";
                        let tempObj2 = {};
                        tempObj2.id = item.fromId;
                        tempObj2.name = item.name + "密码";
                        tempObj2.come = "part";
                        let tempObj3 = {};
                        tempObj3.id = item.fromId;
                        tempObj3.name = item.name + "归属地";
                        tempObj3.come = "part";
                        curParams.push(tempObj1);
                        curParams.push(tempObj2);
                        curParams.push(tempObj3);
                        break;
                    default:
                        tempObj.name = item.name;
                        curParams.push(tempObj);
                        break;
                }
            });
        }

    };
    return curParams;
};

function getTargetItemCanUseParameters_new(nodeId, metaFlowID) {
    let tArray = [];
    if (typeof metaFlowID == "undefined") {
        metaFlowID = $(".detail-liucheng-lists-box .liucheng-list.current-show-list").eq(0).attr("id");
    }
    let isMain = $('#' + metaFlowID).hasClass('detail-liucheng-pretreatment');
    if (typeof mateWorkFlows[metaFlowID] === 'undefined') {
        mateWorkFlows[metaFlowID] = new MateWorkFlow(metaFlowID)
    }
    let array = mateWorkFlows[metaFlowID].getParameters(nodeId);
    //获取主流程的出参
    array = array.concat(parameterUtils.getMainNodeOutParameters(metaFlowID))
    if (!isMain) {
        //拼接全局参数
        array = array.concat(parameterUtils.getGlobalParameters());
    }
    array.forEach((item) => {
        let t_i;
        let isSame = false;
        tArray.forEach((e, i) => {
            if (e.name == item.name) {
                isSame = true;
                if (e.come !== 'part') {
                    t_i = i;
                }
            }
        })
        if (isSame) {
            if (typeof t_i !== 'undefined') {
                tArray.splice(t_i, 1);
                tArray.push(item)
            }
        } else {
            tArray.push(item)
        }

    })
    return tArray;
}

//变量选择list
function generadteListLi(array, type, ) {

}