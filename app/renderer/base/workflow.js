function getType(o) {
    let _t;
    return ((_t = typeof (o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
}

function deepClone(destination, source, isNotFirst) {
    for (let p in source) {
        if (!isNotFirst) {
            if (getType(source[p]) == "array" || getType(source[p]) == "object") {
                destination[p] = getType(source[p]) == "array" ? [] : {};
                arguments.callee(destination[p], source[p], true);
            } else {
                destination[p] = source[p];
            }
        }
    }
}


function getMetaWorkflow(obj, json) {
    obj.each(function () {
        if ($(this).hasClass("separate-block")) {
            return;
        }
        let thisLiDomId = $(this).attr("id");
        let thisLiDomInfo = typeof ctx.get(thisLiDomId) !== 'undefined' ? ctx.get(thisLiDomId) : {}
        try {

            let forArr = [];
            let ifArr = [
                [],
                []
            ];
            let tArr = [];
            //deepClone(thisLiDomInfo, ctx.get(thisLiDomId))
            thisLiDomInfo.debug = $(this).find(">.node-main-box>.liucheng-utils i.debug-true").length > 0;
            switch (thisLiDomInfo.type) {
                case "hashfor":
                case "for":
                    getMetaWorkflow($(this).find(">.node-main-box>.for-menu-box >ul >li").not(".segmentation-li"), forArr);
                    thisLiDomInfo.steps = forArr;
                    break;
                case "if":
                    // thisLiDomInfo.switch[0] = [];
                    // thisLiDomInfo.switch[1] = [];
                    getMetaWorkflow($(this).find(">.node-main-box>.if-else-main-box>.then >ul >li").not(".segmentation-li"), ifArr[0]);
                    getMetaWorkflow($(this).find(">.node-main-box>.if-else-main-box>.else >ul >li").not(".segmentation-li"), ifArr[1]);
                    thisLiDomInfo.switch = ifArr;
                    break;
                case "excelToObject":
                    getMetaWorkflow($(this).find(">.node-main-box>.for-menu-box >ul >li").not(".segmentation-li"), tArr);
                    thisLiDomInfo.steps = tArr;
                    break;
            }
            json.push(thisLiDomInfo)
        } catch (error) {
            console.error(error);
            console.log("元流程json", thisLiDomId, thisLiDomInfo);
            myEmitter.emit("refreshParameters", "global");
            throw error;
        }
    })
}
let isSaveDataCurrent = true;

function getMainWorkflow(obj, json) {
    obj.each(function () {
        let thisLiDomId = $(this).attr("id");
        let thisLiDomInfo = {};
        try {


            thisLiDomInfo.parameters = typeof ctx.get(thisLiDomId) != "undefined" ? ctx.get(thisLiDomId).parameters : [];
            thisLiDomInfo.type = $(this).attr("itemType");
            thisLiDomInfo.id = thisLiDomId;
            switch (thisLiDomInfo.type) {
                case "this_for":
                    thisLiDomInfo.steps = [];
                    getMainWorkflow($(this).find(">ul>li"), thisLiDomInfo.steps);
                    break;
                case "li-branch-if":
                    thisLiDomInfo.switch = [];
                    thisLiDomInfo.switch[0] = [];
                    thisLiDomInfo.switch[1] = [];
                    getMainWorkflow($(this).find(">.branch-container>.branch-way").eq(0).find(">ul >.point"), thisLiDomInfo.switch[0]);
                    getMainWorkflow($(this).find(">.branch-container>.branch-way").eq(1).find(">ul >.point"), thisLiDomInfo.switch[1]);
                    break;
                case "concurrence":
                    thisLiDomInfo.concurrence = [];
                    $(this).find(">.branch-container>.branch-way").each((i, e) => {
                        thisLiDomInfo.concurrence[i] = [];
                        getMainWorkflow($(e).find(">ul>.point"), thisLiDomInfo.concurrence[i])
                    })
                    break;
                default:
                    if (typeof thisLiDomInfo.type == "undefined") {
                        thisLiDomInfo.type = "MetaWorkflow";
                    }
                    thisLiDomInfo.metaWork = [];
                    getMetaWorkflow($("#secondList" + thisLiDomId).find(">li").not(".segmentation-li"), thisLiDomInfo.metaWork);
                    if ($("#try" + thisLiDomId).find(".abnormity-node").length > 0) {
                        thisLiDomInfo.catch = [];
                        $("#try" + thisLiDomId).find(".abnormity-node").each((index, item) => {
                            // let tempObj = ctx.get($(item).find(">.liucheng-list").find(">li").not(".segmentation-li").first().attr("id"));
                            let tempObj = ctx.get($(item).find(">.liucheng-list").attr("id"));
                            let tempEndObj = ctx.get($(item).find(">.liucheng-list").find(">li.try-catch-end").attr("id")) ? ctx.get($(item).find(">.liucheng-list").find(">li.try-catch-end").attr("id")) : {};
                            tempObj.steps = [];
                            tempObj.catchType = [];
                            if (typeof tempObj.catchType == "undefined") {
                                tempObj.catchType = [];
                            };
                            if (typeof tempObj.parameters === "undefined") {
                                tempObj.parameters = [];
                            }
                            if (typeof tempEndObj.parameters === "undefined") {
                                tempEndObj.parameters = [];
                            }
                            tempObj.parameters.forEach((ele, index) => {
                                tempEndObj.parameters.forEach((e, i) => {
                                    if (e.name == ele.name) {
                                        ele = e;
                                    }
                                })
                                if (ele.name.indexOf("value") > -1) {
                                    tempObj.catchType.push(ele.value);
                                    // console.log(tempObj.catchType);
                                };
                                if (ele.name == "forActive") {
                                    tempObj.forActive = ele.value;
                                }
                                if (ele.name == "singleNodeId") {
                                    tempObj.singleNodeId = ele.value;
                                };
                                if (ele.name == "point_to" && ele.value != "") {
                                    tempObj.pointTo = ele.value.split("--")[1];
                                }
                                if (ele.name == "from_to" && ele.value != "") {
                                    tempObj.fromTo = ele.value.split("--")[1];
                                }
                            });
                            if (typeof tempObj.inputInfo === "undefined") {
                                tempObj.inputInfo = [];
                            }
                            if (typeof tempEndObj.inputInfo === "undefined") {
                                tempEndObj.inputInfo = [];
                            }
                            tempObj.inputInfo.forEach((ele, index) => {
                                tempEndObj.inputInfo.forEach((e, i) => {
                                    if (e.name == ele.name) {
                                        ele = e;
                                    }
                                });
                            });
                            // tempObj.catchDo = [];
                            getMetaWorkflow($(item).find(">.liucheng-list").find(">li").not(".segmentation-li").not(":first").not(".try-catch-end"), tempObj.steps);
                            tempObj.finallyType = ctx.get($(item).find(".try-catch-end").eq(0).attr("id"));
                            tempObj.finallyType.parameters.forEach((item, index) => {
                                if (item.name == "point_to" && item.value != "") {
                                    tempObj.finallyType.pointTo = item.value.split("--")[1];
                                }
                                if (item.name == "from_to" && item.value != "") {
                                    tempObj.finallyType.fromTo = item.value.split("--")[1];
                                }
                            });
                            thisLiDomInfo.catch.push(tempObj);
                        });
                    }
                    break;
            }
            json.push(thisLiDomInfo)
        } catch (error) {
            console.error(thisLiDomInfo.type);
            console.log("主流程json", thisLiDomId, thisLiDomInfo);
            isSaveDataCurrent = false;
            throw error;
        }
    })
}

function doGetWorkflow(jsonObject) {
    console.time('test');
    if (Object.prototype.toString.call(jsonObject) == '[object Array]') {
        getMainWorkflow($(".main-liucheng-box .main-liucheng-list > li"), jsonObject)
    } else {
        let importTextFile = [],
            groupPassword = false,
            importFile = [];
        jsonObject.json = [];
        getMainWorkflow($(".main-liucheng-box .main-liucheng-list > li.main-liucheng-pretreatment"), jsonObject.json);
        let pretreatmentItem = jsonObject.json[0];
        jsonObject.json = [];
        pretreatmentItem.metaWork = [];
        $(".liucheng-list.detail-liucheng-pretreatment > li").not("li.segmentation-li").each(function () {
            let parameter = {}
            let thisInfo = ctx.get($(this).attr("id"))
            thisInfo.parameters.forEach(e => {
                parameter[e.name] = e.value;
            })
            switch (thisInfo.type) {
                case "importTextFile":
                    importTextFile.push({
                        id: thisInfo.id,
                        type: "docx",
                        businessDescription: parameter.businessDescription
                    })
                    break;
                case "importFile":
                    importFile.push({
                        id: thisInfo.id,
                        type: "xlsx",
                        businessDescription: parameter.businessDescription
                    })
                    break;
                case "IDAccountPassword":
                    groupPassword = true;
                    break;
            }
            pretreatmentItem.metaWork.push(thisInfo);
        });
        jsonObject.json.push(pretreatmentItem);
        jsonObject.groupPassword = groupPassword;
        jsonObject.importTextFile = importTextFile;
        jsonObject.importFile = importFile;
        getMainWorkflow($(".main-liucheng-box .main-liucheng-list > li").not("li.main-liucheng-pretreatment"), jsonObject.json);
    }
    console.timeEnd('test')
}
//主流程和元流程的分割
let thisIsMainAndMateFlag = "_thisismainflowandsecondflowflag_";

function doUnLockWorkflow(data, isLocalSQL) {
    scrollBoxs = {};
    mateWorkFlows = {};
    data.json =iconv.decode(new Buffer(data.json), 'utf-8');
    data.html = isLocalSQL ?iconv.decode(new Buffer(data.html), 'utf-8') : iconv.decode(new Buffer(data.html), 'utf-8');
    // data.pretreatmentHtml = iconv.decode(new Buffer(data.pretreatmentHtml), 'utf-8');
    // data.parameters = iconv.decode(new Buffer(data.parameters), 'utf-8');

    nowData = data;
    let differentiatePretreatment = nowData.html.split(thisIsMainAndMateFlag);
    if (differentiatePretreatment.length > 1) {
        $(".detail-liucheng-box .detail-liucheng-lists-box").html(differentiatePretreatment[1]);
        $(".main-liucheng-box .main-liucheng-list").html(differentiatePretreatment[0]);
        ctx.set("detailPretreatmentList", []);
    } else {
        // $(".main-right .liucheng-list").html(differentiatePretreatment[0]);
        layer.msg("读取出错", { //
            icon: 2,
            title: "提示", //
            btn: ['确定'], //
            end: function (index) { },
        });
        return;
    }

    $(".first-tips-box").css("display", "none");
    $(".liucheng-box").css("display", "block");
    $('.data_import').hide();

    let json = JSON.parse(data.json.replace(/[\r\n]/g, ""))
    console.log(json);
    $('.detail-liucheng-scroll').empty();

    function importCtx(json) {
        json.forEach(element => {
            switch (element.type) {
                case "this_for":
                    ctx.set(element.id, element)
                    importCtx(element.steps);
                    if ($("#" + element.id).find(">.for-condition").find("i").length == 0) {
                        $("#" + element.id).find(">.for-condition").append('<i class="icon-main-liucheng-item icon-main-item-lbxh"></i>')
                    }
                    break;
                case "li-branch-if":
                    ctx.set(element.id, element)
                    importCtx(element.switch[0])
                    importCtx(element.switch[1])
                    break;
                case "concurrence":
                    ctx.set(element.id, element);
                    element.concurrence.forEach((e) => {
                        importCtx(e)
                    })
                    break;
                case "finally":
                // debugger;
                case "MetaWorkflow":
                    if (typeof element.catch != "undefined") { //异常处理的set
                        element.catch.forEach((item, index) => {
                            importCtx(item.steps);
                            delete item.steps;
                            if (typeof item.finallyType != "undefined" && typeof item.finallyType.id != "undefined") {
                                ctx.set(item.finallyType.id, item.finallyType);
                            };
                            delete item.catchType;
                            delete item.finallyType;
                            ctx.set(item.id, item);
                        });
                    }
                    ctx.set("secondList" + element.id, []);
                    ctx.set(element.id, element);
                    myEmitter.emit("loadScriptInMateStart", 'secondList' + element.id);
                    importCtx(element.metaWork);
                    if ($("#" + element.id).find(">.icon-main-liucheng-item").length > 0) {
                        if ($("#" + element.id).find(">.icon-main-liucheng-item").eq(0).hasClass("icon-main-item-lbxh")) {
                            $("#" + element.id).find(">.icon-main-liucheng-item").eq(0).removeClass("icon-main-item-lbxh").addClass("icon-main-item-ywk");
                        }
                    } else {
                        $("#" + element.id).find(">span.title").before('<i class="icon-main-liucheng-item icon-main-item-ywk"></i>')
                    }
                    myEmitter.emit("loadScriptInMate", 'secondList' + element.id);
                    break
                case 'hashfor':
                case 'excelToObject':
                case 'for':
                    ctx.set(element.id, element);
                    setParameters(element.id, element);
                    $('#' + element.id).addClass('is-frame-area')
                    myEmitter.emit("addNodeSuccess", element.id, $('#' + element.id).parents("ul").eq(0).hasClass("liucheng-list") ? $('#' + element.id).parents("ul").eq(0).attr("id") : $('#' + element.id).parents("ul").eq(0).parents("li.separate-icon").eq(0).attr("id"), $('#' + element.id).parents("ul.liucheng-list").eq(0).attr("id"))
                    importCtx(element.steps);
                    break;
                case "if":
                    ctx.set(element.id, element)
                    $('#' + element.id).addClass('is-frame-area')
                    myEmitter.emit("addNodeSuccess", element.id, $('#' + element.id).parents("ul").eq(0).hasClass("liucheng-list") ? $('#' + element.id).parents("ul").eq(0).attr("id") : $('#' + element.id).parents("ul").eq(0).parents("li.separate-icon").eq(0).attr("id"), $('#' + element.id).parents("ul.liucheng-list").eq(0).attr("id"))
                    importCtx(element.switch[0])
                    importCtx(element.switch[1])
                    break;
                case "pretreatment":
                    ctx.set(element.id, element)
                    myEmitter.emit("loadScriptInMateStart", 'secondList' + element.id);
                    importCtx(element.metaWork);
                    myEmitter.emit("loadScriptInMate", 'secondList' + element.id);
                    break;
                case "groupPassword":
                    let group;
                    let groupId;
                    element.parameters.forEach((item, index) => {
                        if (item.name == "group") {
                            group = item.value;
                        }
                        if (item.name == "groupId") {
                            groupId = item.value;
                        }
                    });
                    net.httpPost.post("/api/selectByGroup/" + encodeURI(groupId), function (err, data) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        let groupObj = {};
                        let cmdTemp;
                        let isFirst = true;
                        groupObj.name = element.outParameterName;
                        groupObj.data = JSON.parse(data);
                        if (typeof ctx.get("cmdGroupList") != "undefined") {
                            cmdTemp = ctx.get("cmdGroupList");

                            cmdTemp.forEach((item, index) => {
                                if (item.name == element.outParameterName) {
                                    isFirst = false;
                                }
                            });
                            if (isFirst) {
                                cmdTemp.push(groupObj);
                                ctx.set("cmdGroupList", cmdTemp);
                            }
                        } else {
                            let tempArray = [];
                            tempArray.push(groupObj);
                            ctx.set("cmdGroupList", tempArray);
                        };
                    })
                    ctx.set(element.id, element)
                    myEmitter.emit("addNodeSuccess", element.id, $('#' + element.id).parents("ul").eq(0).hasClass("liucheng-list") ? $('#' + element.id).parents("ul").eq(0).attr("id") : $('#' + element.id).parents("ul").eq(0).parents("li.separate-icon").eq(0).attr("id"), $('#' + element.id).parents("ul.liucheng-list").eq(0).attr("id"))
                    break;

                default:
                    ctx.set(element.id, element);
                    if (typeof element.outParameterName != "undefined") {

                        setParameters(element.id, element);
                    }
                    myEmitter.emit("addNodeSuccess", element.id, $('#' + element.id).parents("ul").eq(0).hasClass("liucheng-list") ? $('#' + element.id).parents("ul").eq(0).attr("id") : $('#' + element.id).parents("ul").eq(0).parents("li.separate-icon").eq(0).attr("id"), $('#' + element.id).parents("ul.liucheng-list").eq(0).attr("id"))
                    break;
            }
        });
    };
    //变量的设置
    //变量的设置
    function setParameters(id, item) {
        let thisLiParentsUl = $("#" + id).parents(".liucheng-list");
        let thisLiParentsUlId = thisLiParentsUl.attr("id");
        let isParantsUlPrev = thisLiParentsUl.hasClass("detail-liucheng-pretreatment") ? true : false;
        let tempMainArray = ctx.get("detailPretreatmentList");
        let tempArray = [];
        let tempObj = {};
        let isCorrect = false;
        if (isParantsUlPrev) {
            tempArray = typeof ctx.get("detailPretreatmentList") == "undefined" ? [] : ctx.get("detailPretreatmentList");
        } else {
            tempArray = typeof ctx.get(thisLiParentsUlId) == "undefined" ? [] : ctx.get(thisLiParentsUlId);
        }
        if (typeof tempArray == "undefined") {
            tempArray = [];
        }
        switch (item.type) {
            case "backGlobalParam":

                let name;
                let comeId;

                item.parameters.forEach((ele, index) => {
                    if (ele.name == "paramValue") {
                        name = ele.value.substr(1);
                        // comeId = 
                    }
                });
                tempArray.forEach((ele, index) => {
                    if (ele.name == name) {
                        tempObj = commonUtils.getDeepCloneObj(ele);
                        tempObj.name = item.outParameterName;
                        tempObj.fromIndex = item.id;
                        tempObj.fromId = ele.fromId;
                        isCorrect = true;
                    }
                });
                // tempMainArray.push(tempObj);
                if (isCorrect) {
                    // tempMainArray = parameterUtils.getUpdateSameNameParam(tempMainArray, tempObj.name, tempObj)
                    tempMainArray.push(tempObj);
                    ctx.set("detailPretreatmentList", tempMainArray);
                }
                break;
            case "IDAccountPassword":
                let tempArray_1 = ctx.get("detailPretreatmentList");
                tempObj.name = "设置口令";
                var inputInfo = item.inputInfo;
                var res = {};
                inputInfo.forEach(e => {
                    res[e.name] = e.value;
                });
                let obj1 = {};
                let obj2 = {};
                let obj3 = {};
                let obj4 = {};
                obj1.fromId = obj2.fromId = obj3.fromId = obj4.fromId = item.id;
                obj1.parentMateFlowId = obj2.parentMateFlowId = $("#" + item.id).parents("ul.liucheng-list").eq(0).attr('id');
                obj3.parentMateFlowId = obj4.parentMateFlowId = $("#" + item.id).parents("ul.liucheng-list").eq(0).attr('id');
                obj1.type = obj2.type = obj3.type = obj4.type = item.dataType;
                obj1.name = "账号-" + res["ID"];
                obj2.name = "密码-" + res["ID"];
                obj3.name = "归属地-" + res["ID"];
                obj4.name = "部门-" + res["ID"];
                tempArray_1.push(obj1);
                tempArray_1.push(obj2);
                tempArray_1.push(obj3);
                tempArray_1.push(obj4);
                ctx.set("detailPretreatmentList", tempArray_1);
                break;
            default:
                tempObj = {};
                if (isParantsUlPrev) {
                    tempObj.fromId = id;
                    tempObj.name = item.outParameterName;
                    tempObj.parentMateFlowId = thisLiParentsUlId;
                    tempObj.type = item.dataType;
                    // tempArray.push(tempArray);
                    if (item.type == "for") {
                        item.parameters.forEach((ele, index) => {
                            if (ele.name == "rename_i" && ele.value != "") {
                                let tempObj2 = {};
                                tempObj2.type = item.dataType;
                                tempObj2.fromId = id;
                                tempObj2.name = ele.value;
                                tempObj2.parentMateFlowId = thisLiParentsUlId;
                                // tempArr.push(tempObj2);
                                tempArray = parameterUtils.getUpdateSameNameParam(tempArray, tempObj2.name, tempObj2);
                            }
                        });
                    }
                    tempArray = parameterUtils.getUpdateSameNameParam(tempArray, tempObj.name, tempObj);
                    ctx.set("detailPretreatmentList", tempArray);
                } else {
                    tempObj.fromId = id;
                    tempObj.name = item.outParameterName;
                    tempObj.parentMateFlowId = thisLiParentsUlId;
                    tempObj.type = item.dataType;
                    // tempArray.push(tempObj);
                    if (item.type == "for") {
                        item.parameters.forEach((ele, index) => {
                            if (ele.name == "rename_i" && ele.value != "") {
                                let tempObj2 = {};
                                tempObj2.type = item.dataType;
                                tempObj2.fromId = id;
                                tempObj2.name = ele.value;
                                tempObj2.parentMateFlowId = thisLiParentsUlId;
                                // tempArr.push(tempObj2);
                                tempArray = parameterUtils.getUpdateSameNameParam(tempArray, tempObj2.name, tempObj2);
                            }
                        });
                    }
                    tempArray = parameterUtils.getUpdateSameNameParam(tempArray, tempObj.name, tempObj)
                    ctx.set(thisLiParentsUlId, tempArray);
                }
                break;
        }
        if (typeof tempObj.name == "undefined") {
            // debugger;
            console.log("读取出错,出参名为空", item);
        }
    }
    // $('.detail-liucheng-scroll').empty();
    scrollBoxs = {};
    setTimeout(()=>{
        importCtx(json);
        $('.abnormity-node >ul').each((index,item)=>{
            let mateId = $(item).attr('id');
            console.log(mateId);
            let info = ctx.get(mateId);
            let startInfo={},endInfo={};
            let startID = $(item).find('.separate-icon').eq(0).attr('id');
            let endID = $(item).find('.try-catch-end').eq(0).attr('id');
            commonUtils.deepClone(startInfo, info);
            startInfo.id = startID;
            commonUtils.deepClone(endInfo, info);
            endInfo.id = endID;
            endInfo.type = "catch_result";
            ctx.set(endID,endInfo);
            ctx.set(startID,startInfo);
            mateWorkFlows[mateId] = new MateWorkFlow(mateId)
        })
        loadingBox.end();
        // loadingBox.start();
        // loadingBox.setMsg("读取数据中");
        myEmitter.emit("refreshParameters", "global");
    },500)
    // importCtx(json);
    // myEmitter.emit("refreshParameters", "global");
}

function getUUid() {
    let b = [];
    let msecs = parseInt((new Date().getTime() * 10 + Math.round(Math.random() * 9 + 1) + ""));
    return msecs
    // msecs += 12219292800000;
    // let i = 0;
    // var tl = ((msecs & 0xfffffff) * 10000) % 0x100000000;
    // b[i++] = tl >>> 24 & 0xff;
    // b[i++] = tl >>> 16 & 0xff;
    // b[i++] = tl >>> 8 & 0xff;
    // b[i++] = tl & 0xff;

    // tl = (msecs / 0x100000000 * 10000) & 0xfffffff;
    // b[i++] = tl >>> 8 & 0xff;
    // b[i++] = tl & 0xff;

    // b[i++] = tl >>> 24 & 0xf | 0x10;
    // b[i++] = tl >>> 16 & 0xff;

    // tl = Math.random() * 0x100000000

    // b[i++] = tl >>> 24 & 0xf | 0x10;
    // b[i++] = tl >>> 8 & 0xff;
    // var byteToHex = [];
    // for (i = 0; i < 256; ++i) {
    //     byteToHex[i] = (i + 0x100).toString(16).substr(1);
    // }
    // i = 0;
    // return ([
    //     byteToHex[b[i++]], byteToHex[b[i++]],
    //     byteToHex[b[i++]], byteToHex[b[i++]],
    //     byteToHex[b[i++]], byteToHex[b[i++]],
    //     byteToHex[b[i++]], byteToHex[b[i++]],
    //     byteToHex[b[i++]], byteToHex[b[i++]],
    // ]).join('');
}
//保存存入数据库数据
function getSaveDBData(isLocalSQL, isNew, title = $(".data_io [name='title']").val(), desc = $(".data_io [name='desc']").val(), typeName = $(".data_io [name='type']").val()) {
    let tempArray = {};
    try {
        doGetWorkflow(tempArray);
    } catch (error) {
        isSaveDataCurrent = false;
    }
    if (!isSaveDataCurrent) {
        return;
    }
    let nowDate = new Date().format("yyyy-MM-dd HH:mm:ss")
    let html = $(".main-liucheng-box .main-liucheng-list").html() + thisIsMainAndMateFlag + $(".detail-liucheng-box .detail-liucheng-lists-box").html();
    // let uuid = isNew ? typeName + "_" + title : nowData.id || typeName + "_" + title;
    let uuid = isNew?getUUid():nowData.id || getUUid();

    let ind = {
        all: {
            id: uuid,
            title: title,
            desc: desc,
            json: JSON.stringify(tempArray.json),
            groupPassword: JSON.stringify(tempArray.groupPassword),
            importTextFile: JSON.stringify(tempArray.importTextFile),
            importFile: JSON.stringify(tempArray.importFile),
            html: isLocalSQL ? html : html,
            typeName: typeName,
            createTime: nowData.createTime || nowDate,
            updateTime: nowDate
        },
        info: {
            id: uuid,
            title: title,
            desc: desc,
            typeName: typeName,
            createTime: nowData.createTime || nowDate,
            updateTime: nowDate
        },
        bigInfo: {
            id: uuid,
        }
    }
    ind.bigInfo.id = ind.all.id;
    ind.bigInfo.json = ind.all.json;
    ind.bigInfo.html = ind.all.html;
    ind.info.groupPassword = ind.all.groupPassword;
    ind.info.importTextFile = ind.all.importTextFile;
    ind.info.importFile = ind.all.importFile;
    return ind;
}