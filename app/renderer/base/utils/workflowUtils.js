let workflowUtils = {
    //获取单个元流程json
    getMetaWorkflow: function (obj, json) {
        let that = this;
        obj.each(function () {
            if ($(this).hasClass("separate-block")) {
                return;
            }
            let thisLiDomId = $(this).attr("id");
            let thisLiDomInfo = {};
            deepClone(thisLiDomInfo, ctx.get(thisLiDomId))
            thisLiDomInfo.debug = $(this).find(">.node-main-box>.liucheng-utils i.debug-true").length > 0;
            switch (thisLiDomInfo.type) {
                case "hashfor":
                case "for":
                    thisLiDomInfo.steps = [];
                    that.getMetaWorkflow($(this).find(">.node-main-box>.for-menu-box >ul >li").not(".segmentation-li"), thisLiDomInfo.steps);
                    break;
                case "if":
                    thisLiDomInfo.switch = [];
                    thisLiDomInfo.switch[0] = [];
                    thisLiDomInfo.switch[1] = [];
                    that.getMetaWorkflow($(this).find(">.node-main-box>.if-else-main-box>.then >ul >li").not(".segmentation-li"), thisLiDomInfo.switch[0]);
                    that.getMetaWorkflow($(this).find(">.node-main-box>.if-else-main-box>.else >ul >li").not(".segmentation-li"), thisLiDomInfo.switch[1]);
                    break;
                case "excelToObject":

                    thisLiDomInfo.steps = [];
                    that.getMetaWorkflow($(this).find(">.node-main-box>.for-menu-box >ul >li").not(".segmentation-li"), thisLiDomInfo.steps);
                    break;
            }
            json.push(thisLiDomInfo)
        })
    },
    //获取主流程json
    getMainWorkflow: function (obj, json) {
        let that = this;
        obj.each(function () {
            let thisLiDomId = $(this).attr("id");
            let thisLiDomInfo = {};
            thisLiDomInfo.parameters = typeof ctx.get(thisLiDomId) != "undefined" ? ctx.get(thisLiDomId).parameters : [];
            thisLiDomInfo.type = $(this).attr("itemType");
            thisLiDomInfo.id = thisLiDomId;
            switch (thisLiDomInfo.type) {
                case "this_for":
                    thisLiDomInfo.steps = [];
                    that.getMainWorkflow($(this).find(">ul>li"), thisLiDomInfo.steps);
                    break;
                case "li-branch-if":
                    thisLiDomInfo.switch = [];
                    thisLiDomInfo.switch[0] = [];
                    thisLiDomInfo.switch[1] = [];
                    that.getMainWorkflow($(this).find(">.branch-container>.branch-way").eq(0).find(">ul >.point"), thisLiDomInfo.switch[0]);
                    that.getMainWorkflow($(this).find(">.branch-container>.branch-way").eq(1).find(">ul >.point"), thisLiDomInfo.switch[1]);
                    break;
                case "concurrence":
                    thisLiDomInfo.concurrence = [];
                    $(this).find(">.branch-container>.branch-way").each((i, e) => {
                        thisLiDomInfo.concurrence[i] = [];
                        that.getMainWorkflow($(e).find(">ul>.point"), thisLiDomInfo.concurrence[i])
                    })
                    break;
                default:
                    if (typeof thisLiDomInfo.type == "undefined") {
                        thisLiDomInfo.type = "MetaWorkflow";
                    }
                    thisLiDomInfo.metaWork = [];
                    that.getMetaWorkflow($("#secondList" + thisLiDomId).find(">li").not(".segmentation-li"), thisLiDomInfo.metaWork);
                    if ($("#try" + thisLiDomId).find(".abnormity-node").length > 0) {
                        thisLiDomInfo.catch = [];
                        $("#try" + thisLiDomId).find(".abnormity-node").each((index, item) => {
                            let tempObj = ctx.get($(item).find(">.liucheng-list").find(">li").not(".segmentation-li").first().attr("id"));
                            tempObj.steps = [];
                            if (typeof tempObj.catchType == "undefined") {
                                tempObj.catchType = [];
                            };
                            tempObj.parameters.forEach((ele, index) => {
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
                            });
                            // tempObj.catchDo = [];
                            that.getMetaWorkflow($(item).find(">.liucheng-list").find(">li").not(".segmentation-li").not(":first").not(".try-catch-end"), tempObj.steps);
                            tempObj.finallyType = ctx.get($(item).find(".try-catch-end").eq(0).attr("id"));
                            thisLiDomInfo.catch.push(tempObj);
                        });
                    }
                    break;
            }
            json.push(thisLiDomInfo)
        })
    },
    //单元测试变量验证
    verifyMateTestParam: function (targetMate = [], pretreatment = [], parameters) {
        // let isHasDefined = false;
        let pretreatmentId = $(".detail-liucheng-lists-box .detail-liucheng-pretreatment").eq(0).attr("id");
        let tempList = [].concat(parameters);
        targetMate.forEach((item, index) => {
            if (tempList.indexOf(item.name) > -1) {
                // isHasDefined = true;
                tempList.splice(tempList.indexOf(item.name), 1);
            }
        });
        if (true) {
            pretreatment.forEach((item, index) => {
                if (item.parentMateFlowId == pretreatmentId) {
                    if (tempList.indexOf(item.name) != -1) {
                        // isHasDefined = true;
                        tempList.splice(tempList.indexOf(item.name), 1);
                    }
                }
            })
        }
        return tempList;
    },
    //单元测试获取信息
    getMetaTestWorkflow: function (domArray, json = [], inParameter = []) {
        let that = this;
        domArray.each(function () {
            if ($(this).hasClass("separate-block")) {
                return;
            }
            let thisLiDomId = $(this).attr("id");
            let thisLiDomInfo = {};
            commonUtils.deepClone(thisLiDomInfo, ctx.get(thisLiDomId))
            thisLiDomInfo.debug = $(this).find(">.node-main-box>.liucheng-utils i.debug-true").length > 0;
            switch (thisLiDomInfo.type) {
                case "hashfor":
                case "for":
                    thisLiDomInfo.steps = [];
                    that.getMetaTestWorkflow($(this).find(">.node-main-box>.for-menu-box >ul >li").not(".segmentation-li"), thisLiDomInfo.steps);
                    break;
                case "if":
                    thisLiDomInfo.switch = [];
                    thisLiDomInfo.switch[0] = [];
                    thisLiDomInfo.switch[1] = [];
                    that.getMetaTestWorkflow($(this).find(">.node-main-box>.if-else-main-box>.then >ul >li").not(".segmentation-li"), thisLiDomInfo.switch[0]);
                    that.getMetaTestWorkflow($(this).find(">.node-main-box>.if-else-main-box>.else >ul >li").not(".segmentation-li"), thisLiDomInfo.switch[1]);
                    break;
                case "excelToObject":
                    thisLiDomInfo.steps = [];
                    that.getMetaTestWorkflow($(this).find(">.node-main-box>.for-menu-box >ul >li").not(".segmentation-li"), thisLiDomInfo.steps);
                    break;
                default:
                    if (typeof thisLiDomInfo.inputInfo != "undefined") {
                        thisLiDomInfo.inputInfo.forEach((item, index) => {
                            if (item.value.substring(0, 1) == "@") {
                                let flag = true;
                                inParameter.push(item.value.substring(1))
                            }
                        });
                    }
                    break;
            }
            json.push(thisLiDomInfo)
        })
    },
    //拼接单元测试json
    getMateTest: function (targetMateId, json = []) {
        json[0] = {
            undefinedInParams: [],
            params: []
        };
        let that = this;
        let tempInParams = [];
        let targetMate = ctx.get(targetMateId.replace("secondList", ""));
        let tempArray = [];
        targetMate.type = "MetaWorkflow";
        targetMate.id = targetMateId.replace("secondList", "");
        targetMate.metaWork = [];
        // let undefinedInParams = [];
        // let mainTemp = 
        that.getMainWorkflow($(".main-liucheng-list .main-liucheng-pretreatment"), json);
        that.getMetaTestWorkflow($("#" + targetMateId).find(">li").not(".segmentation-li"), tempArray, tempInParams);
        targetMate.metaWork = tempArray;
        json.push(targetMate);
        json[0].undefinedInParams = that.stringArrayDecrease(that.verifyMateTestParam(ctx.get(targetMateId), ctx.get("detailPretreatmentList"), tempInParams));
        json[0].type = 'mateTest';
    },
    //string类数组去重
    stringArrayDecrease: function (array) {
        let newArray = [];
        array.forEach((item, index) => {
            if (newArray.indexOf(item) > -1) {

            } else {
                newArray.push(item);
            }
        });
        return newArray;
    }
}