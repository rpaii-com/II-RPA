$(document).ready(function () {
    function deepClone(destination, source) {
        for (let p in source) {
            if (getType(source[p]) == "array" || getType(source[p]) == "object") {
                destination[p] = getType(source[p]) == "array" ? [] : {};
                arguments.callee(destination[p], source[p]);
            } else {
                destination[p] = source[p];
            }
        }
    }
    function copyObject() {
        this.mainId;
        this.mainFlowNodeInfo = {};
        this.mainFlowHtml;
        this.mateFlowId;
        this.mateFlowHtml;
        this.mateFlowTryCatch;
        this.mateFlowNodeParamList = [];
        this.mateFlowReturnParame = [];
    }
    let bufferCopyObj;
    $(".main-liucheng-list").on("contextmenu", ".main-liucheng-item", function (event) {
        let $_target = $(event.target);
        if ($(this).hasClass("main-liucheng-pretreatment") || $(this).hasClass("main-liucheng-finally")) {
            return;
        } else {
            $("#right_click_main_flow").show().css({ top: event.pageY + "px", left: event.pageX + "px" }).attr("rightId", $(this).attr("id"));
            if (bufferCopyObj) {
                $("#right_click_main_flow .right-click-paste").show();
            } else {
                $("#right_click_main_flow .right-click-paste").hide();
            }
        }
    });
    $("*").on("click", function (event) {
        if ($(event.target).attr("id") != "right_click_main_flow" && $(event.target).parents("#right_click_main_flow").length == 0) {
            $("#right_click_main_flow").hide();
        };
    });
    $("#right_click_main_flow").on("click", "li", function () {
        let tempId = $("#right_click_main_flow").attr("rightId");
        if ($(this).hasClass('right-click-copy')) {
            rightClickCopy(tempId);
        } else if ($(this).hasClass("right-click-paste")) {
            rightClickPaste(tempId);
        }
        $("#right_click_main_flow").hide();
    });
    function rightClickCopy(id) {
        bufferCopyObj = new copyObject();
        bufferCopyObj.mainId = id;
        bufferCopyObj.mainFlowNodeInfo = ctx.get(id);
        bufferCopyObj.mainFlowHtml = $("#" + id).clone(true).attr("copycomefrom", id);
        bufferCopyObj.mateFlowId = "secondList" + id;
        bufferCopyObj.mateFlowHtml = $("#secondList" + id).clone(true).attr("copycomefrom", id);
        bufferCopyObj.mateFlowTryCatch = $("#try" + id).clone(true).attr("copycomefrom", id);
        bufferCopyObj.mateFlowNodeParamList = ctx.get("secondList" + id);
        bufferCopyObj.mateFlowReturnParame = [];
        let tempArray = typeof ctx.get("detailPretreatmentList") != "undefined" ? ctx.get("detailPretreatmentList") : [];
        tempArray.forEach((item, index) => {
            if (item.parentMateFlowId == bufferCopyObj.mateFlowId) {
                bufferCopyObj.mateFlowReturnParame.push(item);
            }
        });
    }
    function rightClickPaste(id) {
        let layerindex = layer.load(1, {
            shade: [0.1, '#fff'] //0.1透明度的白色背景
        });
        try {
            let tempDate = new Date().getTime();
            let tempMain = bufferCopyObj.mainFlowHtml.clone(true);
            let tempMate = bufferCopyObj.mateFlowHtml.clone(true);
            let tempTry = bufferCopyObj.mateFlowTryCatch.clone(true);
            let tempCopyMateId = bufferCopyObj.mateFlowId;
            let tempCopyMateParam = typeof ctx.get(tempCopyMateId) != "undefined" ? ctx.get(tempCopyMateId) : [];
            let tempSecondList = [];
            let tempSecondTryList = [];
            let tempMainObj = {};
            if (typeof ctx.get(tempMain.attr("id")) != "undefined") {
                tempMainObj = ctx.get(tempMain.attr("id"));
                // let t = 
                tempMainObj.parameters.push({ name: "professional_dec", value: tempMain.find(">span.title").text() });
            } else {
                tempMainObj.parameters = [];
                tempMainObj.parameters.push({ name: "professional_dec", value: tempMain.find(">span.title").text() });
                tempMainObj.type = "MetaWorkflow";
            }
            tempMain.attr("id", tempDate);
            tempMain.find("li.main-liucheng-item").each((index, item) => {
                let tempId = $(item).attr("id");
                let tempObj = {};
                let tempDate = new Date().getTime();
                let title = $(item).find(">span.title").text();
                if (typeof ctx.get(tempId) == "undefined") {
                    tempObj.parameters = [];
                    tempObj.parameters.push({ name: "professional_dec", value: title });
                    tempObj.type = "MetaWorkflow";
                } else {
                    tempObj = deepClone(tempObj, ctx.get(tempId));
                    // tempObj.parameters[0].value
                }
                ctx.set(tempDate, tempObj);
            });
            tempMate.attr("id", "secondList" + tempDate);
            myEmitter.emit("loadScriptInMateStart", 'secondList' + tempDate);


            tempMate.find("li.separate-icon").each((index, item) => {
                let tempId = $(item).attr("id");
                let tempDate = new Date().getTime();
                let tempObj = {};
                tempCopyMateParam.forEach((item, index) => {
                    if (item.fromId == tempId) {
                        let o = {};
                        deepClone(o, item);
                        o.fromId = tempDate;
                        tempSecondList.push(o);
                    }
                });
                deepClone(tempObj, ctx.get(tempId));
                tempObj.id = tempDate;
                $(item).attr("id", tempDate);
                ctx.set(tempDate, tempObj);
                myEmitter.emit("addNodeSuccess",tempDate,$(item).parents("ul").eq(0).hasClass("liucheng-list")?$(item).parents("ul").eq(0).attr("id"):$(item).parents("ul").eq(0).parents("li.separate-icon").eq(0).attr("id"),$(item).parents("ul.liucheng-list").eq(0).attr("id"))
            });
            ctx.set("secondList" + tempDate, tempSecondList)
            tempTry.attr("id", "try" + tempDate);
            tempTry.find(".liucheng-list").find("li.separate-icon").each((index, item) => {
                let tempId = $(item).attr("id");
                let tempDate = new Date().getTime();
                let tempObj = {};
                deepClone(tempObj, ctx.get(tempId));
                tempObj.id = tempDate;
                $(item).attr("id", tempDate);
                ctx.set(tempDate, tempObj);
            });
            if (typeof id == "undefined") {
                $(".main-liucheng-list").append(initDom(id, tempMain));
                if ($(".main-liucheng-list .main-liucheng-finally").length > 1) {
                    initDom(id, tempMain)
                    $(".main-liucheng-list .main-liucheng-finally").before(tempMain);
                } else {
                    initDom(id, tempMain)
                    $(".main-liucheng-list").append(tempMain);
                }
            } else {
                if ($("#" + id).hasClass("for-liucheng-end")) {
                    initDom(id, tempMain)
                    $("#" + id).parents(".this_for").eq(0).after(tempMain)
                } else {
                    initDom(id, tempMain)
                    $(".main-liucheng-list").find("#" + id).after(tempMain);
                }
            }
            $(".detail-liucheng-lists-box").append(tempMate);
            $(".detail-liucheng-lists-box").append(tempTry);
        } catch (e) {
            layer.close(layerindex);
        }
        layer.close(layerindex);
    }
    function initDom(id, dom) {
        let type;
        dom.removeClass("main-item-select");
        dom.find(".liucheng-item-utils").empty();
        dom.find(".connecting").remove();
        dom.find(".set_linellae,.icon-for-start,.icon-for-sanjiao,.icon-right-h,.icon-for-end").remove();
        if (dom.hasClass("for-liucheng-end")) {
            dom.removeClass("for-liucheng-end")
        } else if (dom.hasClass("for-liucheng-start")) {
            dom.removeClass("for-liucheng-start")
        } else if (dom.hasClass("point")) {
            dom.removeClass("point")
        }
        if ($("#" + id).parent().hasClass("main-liucheng-list")) {
            addItem("default");
        } else {
            if ($("#" + id).parents("li").eq(0).hasClass("this_for")) {
                if ($("#" + id).hasClass("for-liucheng-end")) {
                    addItem("default");
                } else {
                    addItem("for-item");
                }
            } else if ($("#" + id).parents("li").eq(0).parents("li").eq(0).hasClass("li-branch-if")) {
                addItem("if-item");
            } else if ($("#" + id).parents("li").eq(0).parents("li").eq(0).hasClass("this_concurrence")) {
                addItem("pipe-item");
            }
        }
        function addItem(type) {
            switch (type) {
                case "if-item":
                    dom.addClass("point");
                    dom.find(".liucheng-item-utils").append("<i class='liucheng-item-util-remove'></i><i class='liucheng-item-util-default'></i>");
                    break;
                case "for-item":
                    dom.append("<i class='connecting'></i><i class='set_linellae'></i>");
                    dom.find(".liucheng-item-utils").append("<i class='liucheng-item-util-remove'></i>");
                    break;
                case "pipe-item":
                    dom.addClass("point");
                    dom.find(".liucheng-item-utils").append("<i class='liucheng-item-util-remove'></i><i class='liucheng-item-util-default'></i>");
                    break;
                default:
                    dom.append("<i class='connecting'></i><i class='set_linellae'></i>");
                    dom.find(".liucheng-item-utils").append("<i class='liucheng-item-util-remove'></i>");
                    break;
            }
        }
    }

});