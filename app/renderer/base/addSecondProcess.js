// const httpPost = require('electron').remote.getGlobal('httpPost');
let secondListDrap = {}

function addSecondProcess(event) {
    //获取当前的dom对象，目前为确认按钮
    let thisDom = event.target;
    let that = this;
    //获取当前的弹出层的form表单标签
    let $thisCoverForm = $(thisDom).parents("form").eq(0);
    //获取当前节点的类型
    let thisNodeType = $thisCoverForm.find(".item-type").attr("name");
    //判断是否在预处理的二级流程中
    let isInSecondPretreatmentLiucheng = $(".detail-liucheng-lists-box .liucheng-list.current-show-list").hasClass("detail-liucheng-pretreatment") ? true : false;
    //用于防止模态框没有关闭
    setTimeout(() => {
        this.cleanFadeModal()
    }, 50);
    let tryListId;
    let isparamHasSameName = false;
    //定义当前节点的node信息
    let targetSecondListId = $(".detail-liucheng-lists-box .liucheng-list.current-show-list").eq(0).attr("id");
    let parentULiD = targetSecondListId;
    if($('#try'+targetSecondListId).find('.abnormity-node.active').length>0){
        parentULiD = $('#try'+targetSecondListId).find('.abnormity-node.active').eq(0).attr('id');
    }
    if (typeof secondListDrap[targetSecondListId] == "undefined") secondListDrap[targetSecondListId] = false;
    this.node.id = this.addLiuchengItem.uuid;
    this.node.htmlParameters = {};
    this.node.htmlParameters.tempaltePath = this.modalConf.tempaltePath;
    this.node.htmlParameters.tempaltePathName = this.modalConf.tempaltePathName;
    this.node.type = thisNodeType;
    this.node.name = this.modalConf.tempaltePathName
    //获取当前节点的类型
    parameterUtils.setDataType(this.node, thisNodeType);
    this.modalConf = {};
    let liuchengItem = '';
    //暂时区分for循环流程，进行节点内容的拼接
    //状态为新增
    if (!this.editLiuchengItem.isEditExistedItem) {

        setEditAppendHtml(thisNodeType, $thisCoverForm, this.addLiuchengItem, liuchengItem, this.node);
    }
    //初始化新增和编辑对象
    let editLiuchengItem = this.editLiuchengItem;
    let addLiuchengItem = this.addLiuchengItem;

    //用于判断是否选中了跟随脚本执行
    let isVer = false;
    //不管是编辑还是新增，都获取节点的ID
    let targetItemId;
    //获取当前选中的node节点
    let liuchengItemSelected = $(".main-right .current-show-list .liucheng-item-selected").eq(0);
    //判断当前选中的node节点的类型，是for或if还是普通节点
    let liuchengItemSelectedType = liuchengItemSelected.find(">.node-main-box").find(">.for-menu-box").length > 0 || liuchengItemSelected.hasClass("if-else-menu-box") ? 0 : 1;
    let isCurrentEx = false;
    if ($("#try" + targetSecondListId.replace("secondList", "")).find(".abnormity-node.active").length > 0) {
        isCurrentEx = true;
        liuchengItemSelected = $("#try" + targetSecondListId.replace("secondList", "")).find(".liucheng-item-selected").eq(0);
        liuchengItemSelectedType = liuchengItemSelected.find(">.node-main-box").find(">.for-menu-box").length > 0 || liuchengItemSelected.hasClass("if-else-menu-box") ? 0 : 1;
    }
    //更新跟随当前脚本执行flag
    if ($(".cover-box .goon [type='checkbox']").is(':checked')) {
        isVer = true;
    }

    //判断当前状态是否为编辑节点
    if (!editLiuchengItem.isEditExistedItem) {
        //当前状态为新增节点
        //获取新增节点的ID
        targetItemId = addLiuchengItem.uuid;
    } else { //否则当前节点为编辑状态，ID为编辑节点的ID
        targetItemId = editLiuchengItem.editItemId;
    }
    //给节点信息的ID赋值
    this.node.id = targetItemId;
    this.node.inputInfo = [];
    //定义记录input框中的信息的变量
    let inputAllValues = [];
    //定义记录入参信息的变量
    let inParamterValue = [];
    //记录弹出层中的所有只读状态的input框
    // console.time("提取input");
    $thisCoverForm.find("input[readonly='readonly']").each(function () {
        var inputObj = {};
        inputObj.name = $(this)[0].name;
        inputObj.value = $(this)[0].value;
        inputObj.type = $(this)[0].type;
        inputObj.targetClass = "in-paramter-" + $(this)[0].name;
        inParamterValue.push(inputObj);
    });
    //记录弹出层中的所有类型为text的input框
    $thisCoverForm.find("input[type='text']").each(function () {
        var inputObj = {};
        inputObj.name = $(this)[0].name;
        inputObj.value = $(this)[0].value;
        inputObj.type = $(this)[0].type;
        inputObj.isShow = $(this).parents(".input-box").eq(0).length > 0 && getComputedStyle($(this).parents(".input-box").eq(0)[0])["display"] != "none" ? true : false;
        inputAllValues.push(inputObj);
        that.node.inputInfo.push(inputObj);
    });
    //记录弹出层中的所有类型为file的input框
    $thisCoverForm.find("input[type='file']").each(function () {
        var inputObj = {};
        inputObj.name = $(this)[0].name;
        inputObj.value = $(this)[0].value;
        inputObj.type = $(this)[0].type;
        inputAllValues.push(inputObj);
    });
    //记录弹出层中的所有单选框的信息
    let radioArray = [];
    $thisCoverForm.find("input[type='radio']:checked").each(function () {
        var radioObj = {};
        radioObj.name = $(this)[0].name;
        radioObj.value = $(this).parent().text() == '' ? $(this).val() : $(this).parent().text();
        radioObj.type = $(this)[0].type;
        inputAllValues.push(radioObj);
        radioArray.push(radioObj);
    });
    let checkboxArray = [];
    $thisCoverForm.find("input[type='checkbox']:checked").each(function () {
        var checkboxObj = {};
        checkboxObj.name = $(this)[0].name;
        checkboxObj.value = $(this).parent().text() == '' ? $(this).val() : $(this).parent().text();
        checkboxObj.type = $(this)[0].type;
        inputAllValues.push(checkboxObj);
        checkboxArray.push(checkboxObj);
    });

    this.node.radio = radioArray;
    this.node.checkbox = checkboxArray;
    this.node.readonlyInput = inParamterValue;

// [{key:xpath,value:""},{key^}]
    //todo 将内容封装成json
    var jsonarray = $('.cover-box form').serializeArray();
    // var jsonarray = [];
    // $('.cover-box form').find('input').each((index,item)=>{
    //     let tempObj = {};
    //     tempObj.name = typeof $(item).attr('name') === 'undefined'?'':$(item).attr('name');
    //     tempObj.value = $(item).val();
    //     tempObj.type = $(item)[0].type;
    //     tempObj.isChecked = $(item)[0].type == 'radio'||$(item)[0].type == 'checkbox'?$(item).is(':checked'):null;
    //     jsonarray.push(tempObj);
    // })
    this.node.parameters = jsonarray;
    jsonarray.forEach(element => {
        $(".cover-box [name='" + element.name + "']").not("[type='radio']").attr("value", element.value);
        // console.log(element.name.indexOf('Path'))
        if ($(".cover-box [name='" + element.name + "']").attr("type") == "radio") {
            $(".cover-box [value='" + element.value + "']").attr("checked", "true");
            $(".cover-box [type='radio']").not("[value='" + element.value + "']").removeAttr("checked");
        }
        //跟随脚本执行动作执行
        $(".cover-box .goon [type='checkbox']").removeAttr("checked");
        switch (element.name) {
            case "ie8_url":
                ie8Util.open(element.value);
                break;
            case "url":
                webview.send("operate", {
                    id: targetItemId,
                    url: element.value,
                    type: "url",
                    isBack: false
                });
                break;
            case "historyBack":
                webview.send("operate", {
                    id: targetItemId,
                    type: "historyBack",
                    isBack: false
                });
                break;
            case "closePage":
                let index = $(".page-selected").attr("index");
                if (typeof index == "undefined") break;
                $(".page-selected").remove();
                $("#foo" + index).remove();
                setTimeout(() => {
                    $(".webview-pages li").each((i, e) => {
                        if (index - 1 == 1) {
                            $(e).click();
                            webview = $("#foo")[0]
                        } else if ($(e).attr('index') == index - 1) {
                            $(e).click();
                            webview = $("#foo" + (index - 1))[0]
                        }
                    })

                }, 0);
                break;
            case "openIframe":
                let targetSrc = $thisCoverForm.find("input[name='xpath']").attr("iframesrc");
                let iframeXpath = $thisCoverForm.find("input[name='xpath']").val();
                let isOpenNewWindow = $thisCoverForm.find("#openNew").is(":checked");
                webview.send("operate", {
                    id: targetItemId,
                    xpath: iframeXpath,
                    type: "openIframe",
                    src: targetSrc,
                    isOpenNewWindow: isOpenNewWindow,
                    isBack: false
                });
                break;
        }
    });
    //原 跟随脚本执行
    if (isVer) {
        verification(editLiuchengItem.editItemId)
    }

    //如果弹出层中存在name为rename的input，及该节点存在出参
    if ($thisCoverForm.find("input[name='rename']").length > 0 && $thisCoverForm.find("input.item-type").attr("name") != "setColParam") {
        //设置出参
        // console.time("设置出参");
        this.node.outParameterName = $thisCoverForm.find("input[name='rename']").val();
        setParameters(this.node, isInSecondPretreatmentLiucheng, editLiuchengItem.isEditExistedItem);
        // console.timeEnd("设置出参");
    }
    if (isparamHasSameName) {
        return;
    }
    //添加新增节点
    if (!editLiuchengItem.isEditExistedItem) {
        //新增异常处理
        // console.time("新增节点");
        switch (this.node.type) {
            case "try_catch":
                if ($("#try" + targetSecondListId.replace("secondList", "")).length < 1) {
                    let tTryId = "try" + targetSecondListId.replace("secondList", "")
                    $(".detail-liucheng-lists-box").eq(0).append('<div id="' + tTryId + '" class="abnormity"></div>')
                }
                tryListId = new Date().getTime() + 1;
                let thtml = "";
                let name = "";
                let t = {};
                commonUtils.deepClone(t, this.node);
                let tempTryId = "try" + targetSecondListId.replace("secondList", "")
                name = $thisCoverForm.find("input[name='url']").val();
                thtml += '<div class="abnormity-node last"><div class="abnormity-node-top"><i></i><span>' + name + '</span>';
                thtml += '<div class="fluctuate"><div class="fluctuate-top"></div><div class="fluctuate-bottom"></div></div></div>';
                thtml += '<ul id="' + tryListId + '" class="liucheng-list ab_module"></ul></div>';
                // if ($("#" + tempTryId).find(".abnormity").length == 0) {
                //     $(".liucheng-list.current-show-list").append("<div class='abnormity'></div>");
                //     $(".liucheng-list.current-show-list").find(".liucheng-item-selected").removeClass("liucheng-item-selected");
                //     liuchengItemSelected = $(".main-right .current-show-list .liucheng-item-selected").eq(0);
                // }
                $("#" + tempTryId).find(".abnormity-node.last").removeClass("last");
                $("#" + tempTryId).append(thtml);
                t.id = tryListId;
                console.log(t);
                ctx.set(tryListId, t);
                myEmitter.emit("nodeComplete", $("#" + tempTryId).find(".abnormity-node.last"));
                isCurrentEx = true;
                break;
            default:
                break;
        };
        //当前状态为新增节点
        appendToNewItem(liuchengItemSelected, liuchengItemSelectedType, this.addLiuchengItem, this.node, isCurrentEx, targetSecondListId)
    } else {
        let tempObj = {};
        let text;
        let tname;
        let html;
        let endId;
        switch (this.node.type) {

            case "try_catch":
                text = $thisCoverForm.find("input[name='handle_type']").val();
                tname = $thisCoverForm.find("input[name='url']").val();
                html = '<p class="dom-active-dec" title><i></i><em>：</em>' + text + '</p>';
                endId = $("#" + targetItemId).parent().find(".try-catch-end").attr("id");
                tryListId = $("#" + targetItemId).parent().attr("id");
                tempObj = {};
                tempObj.id = endId;
                tempObj.catchType = text;
                tempObj.type = "catch_result";
                tempObj.checkbox = this.node.checkbox;
                tempObj.inputInfo = this.node.inputInfo;
                tempObj.parameters = this.node.parameters;
                tempObj.radio = this.node.radio;
                tempObj.readonlyInput = this.node.readonlyInput;
                if ($("#coverModal .dispose.change_html").find("input").eq(0).val() != "") {
                    let array = $("#coverModal .dispose.change_html").find("input").eq(0).val().split("--");
                    tempObj.pointTo = array[1];
                }
                if ($("#coverModal .dispose.from_to_html").find("input").eq(0).val() != "") {
                    let array = $("#coverModal .dispose.from_to_html").find("input").eq(0).val().split("--");
                    tempObj.fromTo = array[1];
                }
                // tempObj.catchType =
                ctx.set(endId, tempObj);
                $("#" + targetItemId).parent().find(".try-catch-end").find(".liucheng-item-tips").html(html);
                $("#" + targetItemId).parents(".abnormity").eq(0).find(".abnormity-node-top").find(">span").text(tname);
                ctx.set(tryListId, this.node);
                break;
            case "catch_result":
                text = $thisCoverForm.find("input[name='handle_type']").val();
                html = '<p class="dom-active-dec" title><i></i><em>：</em>' + text + '</p>';
                $("#" + targetItemId).find(".liucheng-item-tips").html(html);
                this.node.catchType = text;
                break;
            default:
                break;
        }
    }
    drawingDoardStpes.push(this.node);
    //set节点信息
    switch (this.node.type) {

        default:
            // let tempObj = Object.create(this.node);
            ctx.set(targetItemId, this.node);
        // ctx.set(targetItemId + 1, tempObj);
        break;
    }
    //设计器伪执行
    switch (this.node.type) {
        case "backGlobalParam":
            let oldName;
            let fromIndex;
            if ($thisCoverForm.find("input[name='paramValue']").val() == "" || $thisCoverForm.find("input[name='rename']").val() == "") {
                break;
            }
            if ($thisCoverForm.find("input[name='paramValue']").val().substr(0, 1) == "@") {
                oldName = $thisCoverForm.find("input[name='paramValue']").val().substr(1);
            } else {
                oldName = $thisCoverForm.find("input[name='paramValue']").val()
            };
            if (typeof $thisCoverForm.find("input[name='paramValue']").attr("fromIndex") != "undefined" && $thisCoverForm.find("input[name='paramValue']").attr("fromIndex") != "") {
                fromIndex = $thisCoverForm.find("input[name='paramValue']").attr("fromIndex");
            }
            // let oldName = $thisCoverForm.find("input[name='paramValue']").val().substr(0, 1);
            let parentMateFlowId = $(".liucheng-list.current-show-list").eq(0).attr("id");
            backGlobalParam(parentMateFlowId, oldName, this.node.outParameterName, fromIndex, editLiuchengItem.isEditExistedItem, targetItemId);
            myEmitter.emit("refreshParameters", "global");
            myEmitter.emit("refreshParameters", "part", parentMateFlowId);
            break;
        default:
            // ctx.set(targetItemId, this.node);
            break;
    }
    // console.time("提示信息");
    //判断当前状态是否为编辑节点状态
    if (editLiuchengItem.isEditExistedItem) {
        //修改编辑状态为初始值false
        // editLiuchengItem.isEditExistedItem = false;
        //清空原提示框中所有的入参信息
        $("#" + editLiuchengItem.editItemId + " >.node-main-box >.liucheng-item-tips p").find(".font-in-paramter").each(function () {
            $(this).text("");
        });
        //清空原提示框中所有的用户填入信息，并将所有显示
        $("#" + editLiuchengItem.editItemId + " >.node-main-box >.liucheng-item-tips p").find(".user-input-text").each(function () {
            $(this).text("");
            $(this).show();
        })
        //初始化提示框信息
        this.initLiuchengItemTips(inputAllValues, $("#" + editLiuchengItem.editItemId + ""));
        if (inParamterValue.length > 0) { //将入参信息填入提示框
            inParamterValue.forEach(function (e) {
                let paramterName = e.value.substr(1);
                $("#" + editLiuchengItem.editItemId + " ." + e.targetClass).text(e.value);
                $("#" + editLiuchengItem.editItemId + " ." + e.targetClass).next(".user-input-text").hide();
                if ($("#" + editLiuchengItem.editItemId + " ." + e.targetClass).next().hasClass("font-in-paramter-type")) {
                    $("#" + editLiuchengItem.editItemId + " ." + e.targetClass).next().text(parameterUtils.getParamtersTypeByName(paramterName));
                } else if ($("#" + editLiuchengItem.editItemId + " ." + e.targetClass).next().next().hasClass("font-in-paramter-type")) {
                    $("#" + editLiuchengItem.editItemId + " ." + e.targetClass).next().next().text(parameterUtils.getParamtersTypeByName(paramterName));
                }
            })
        }
        //将出参信息填入提示框
        if ($("#" + editLiuchengItem.editItemId + " >.node-main-box >.liucheng-item-tips p").find(".font-out-paramter").length > 0) {
            // let fontOut = "@" + getParameterNameIndex(editLiuchengItem.editItemId, true);
            let fontOut = "@" + this.node.outParameterName;
            $("#" + editLiuchengItem.editItemId + " >.node-main-box >.liucheng-item-tips p").find(".font-out-paramter").text(fontOut);
            $("#" + editLiuchengItem.editItemId + " >.node-main-box >.liucheng-item-tips p").find(".font-out-paramter").next(".font-out-paramter-type").text(ctx.get(editLiuchengItem.editItemId).dataType);
        }
        //给提示框中的p的内容赋给p的title，在内容省略时可以通过title查看全部提示内容
        $("#" + editLiuchengItem.editItemId + " >.node-main-box >.liucheng-item-tips p").each(function () {
            $(this).attr("title", $(this)[0].innerText.trim().replace(/\"/g, "'").trim().substr(1))
        });
        //给提示框填入当选按钮的信息
        $("#" + editLiuchengItem.editItemId + " .tips-radio").show();
        $("#" + editLiuchengItem.editItemId + " .tips-radio").text($(".cover-alert").find("input[type='radio']:checked").parent().text());
        // targetItemId = editLiuchengItem.editItemId;
        // console.log(getTargetItemCanUseParameters($("#" + editLiuchengItem.editItemId + ""), []));
    } else {
        //给新增节点的提示框填入入参信息
        if ($("#" + addLiuchengItem.uuid + " >.node-main-box >.liucheng-item-tips p").find(".font-in-paramter").length > 0) {
            let fontIn;
            if ($("#" + addLiuchengItem.uuid + " >.liucheng-operate-data").find('input[readonly="readonly"]').length > 0 && $("#" + addLiuchengItem.uuid + " .liucheng-operate-data").find('input[readonly="readonly"]').val() != "") {
                fontIn = $("#" + addLiuchengItem.uuid + " >.liucheng-operate-data").find('input[readonly="readonly"]').val();
            } else {
                this.initLiuchengItemTips(inputAllValues, $("#" + addLiuchengItem.uuid + ""));
            }
            $("#" + addLiuchengItem.uuid + " >.node-main-box >.liucheng-item-tips p").find(".font-in-paramter").text(fontIn);
            this.initLiuchengItemTips(inputAllValues, $("#" + addLiuchengItem.uuid + ""));
        } else {
            this.initLiuchengItemTips(inputAllValues, $("#" + addLiuchengItem.uuid + ""));
        }
        //给新增节点的提示框填入入参的类型信息
        if (inParamterValue.length > 0) {
            inParamterValue.forEach(function (e) {
                let paramterName = e.value.substr(1).trim();
                $("#" + addLiuchengItem.uuid + " ." + e.targetClass).text(e.value);
                $("#" + addLiuchengItem.uuid + " ." + e.targetClass).next(".user-input-text").hide();
                if ($("#" + addLiuchengItem.uuid + " ." + e.targetClass).next().hasClass("font-in-paramter-type")) {
                    $("#" + addLiuchengItem.uuid + " ." + e.targetClass).next().text(parameterUtils.getParamtersTypeByName(paramterName));
                } else if ($("#" + addLiuchengItem.uuid + " ." + e.targetClass).next().next().hasClass("font-in-paramter-type")) {
                    $("#" + addLiuchengItem.uuid + " ." + e.targetClass).next().next().text(parameterUtils.getParamtersTypeByName(paramterName));
                }
            })
        };

        //给新增节点的提示框填入出参名和出参类型信息
        if ($("#" + addLiuchengItem.uuid + " >.node-main-box >.liucheng-item-tips p").find(".font-out-paramter").length > 0) {
            // let fontOut = "@" + getParameterNameIndex(addLiuchengItem.uuid, true);
            let fontOut = "@" + this.node.outParameterName;
            $("#" + addLiuchengItem.uuid + " >.node-main-box >.liucheng-item-tips p").find(".font-out-paramter").text(fontOut);
            $("#" + addLiuchengItem.uuid + " >.node-main-box >.liucheng-item-tips p").find(".font-out-paramter").next(".font-out-paramter-type").text(ctx.get(addLiuchengItem.uuid).dataType);
        }
        //给提示框中的p标签添加title，可以查看省略内容
        $("#" + addLiuchengItem.uuid + " >.node-main-box >.liucheng-item-tips p").each(function () {
            $(this).attr("title", $(this)[0].innerText.trim().replace(/\"/g, "'").trim().substr(1))
        });
        //给提示框填入单选按钮的信息
        $("#" + addLiuchengItem.uuid + " .tips-radio").show();
        $("#" + addLiuchengItem.uuid + " .tips-radio").text($(".cover-alert").find("input[type='radio']:checked").parent().text());

        if (this.node.type == "try_catch") {
            let b = "";
            this.node.parameters.forEach((item, index) => {
                if (item.name.indexOf("value") > -1) {
                    if (index > 0) {
                        b += "," + item.value;
                    } else {
                        b += item.value;
                    }
                }
            });
            $("#" + addLiuchengItem.uuid + " >.node-main-box >.liucheng-item-tips p").find("b").text(b)
        }
    }
    // console.timeEnd("提示信息");
    //向webview中发送停止消息，取消webview中的抓取元素的js
    webview.send('stop', 'stop');
    //判断出参name是否唯一
    if (typeof ctx.get(targetItemId).outParameterName != "undefined") {
        let option = [{
            data: ctx.get(targetItemId).outParameterName
        }, {
            data: ctx.get(targetItemId).dataType
        }]
        this.parameter.init(option);
    };
    //如果节点类型为滚动，则在弹出层消失后出现滚动提示
    if (thisNodeType == "mouseRoll") {
        let typeUpOrDown = $(thisDom).parents("form").find("input[name='mouseRollUpOrDown']").val() == '' ? '' : $(thisDom).parents("form").find("input[name='mouseRollUpOrDown']").val() < 0 ? "向上" : "向下";
        let stepsUpOrDown = typeUpOrDown != "" ? Math.abs($(thisDom).parents("form").find("input[name='mouseRollUpOrDown']").val()) : 0;
        let typeLeftOrRight = $(thisDom).parents("form").find("input[name='mouseRollLeftOrRight']").val() == '' ? '' : $(thisDom).parents("form").find("input[name='mouseRollLeftOrRight']").val() < 0 ? "向左" : "向右";
        let stepsLeftOrRight = typeLeftOrRight != "" ? Math.abs($(thisDom).parents("form").find("input[name='mouseRollLeftOrRight']").val()) : 0
        let options = [{
            type: typeUpOrDown,
            steps: stepsUpOrDown,
            data: typeUpOrDown != "" ? typeUpOrDown + "滚动" + stepsUpOrDown + "次，" : ""
        }, {
            type: typeLeftOrRight,
            steps: stepsLeftOrRight,
            data: typeLeftOrRight != "" ? typeLeftOrRight + "滚动" + stepsLeftOrRight + "次，" : ""
        }]
        this.parameter.scrollInit(options, this.hideParameterState);
    }
    //如果为新增节点，设置透明度为1，过渡效果
    if (!editLiuchengItem.isEditExistedItem) {
        $("#" + addLiuchengItem.uuid).css("opacity", 1)
    };
    //初始化节点信息
    this.node = {};
    editLiuchengItem.isEditExistedItem = false;
    this.editLiuchengItem = editLiuchengItem;
    this.addLiuchengItem = addLiuchengItem;
    //新增或编辑之后，当前节点都为选中状态
    $(".detail-liucheng-lists-box .liucheng-list .liucheng-item-selected").removeClass("liucheng-item-selected");
    $("#" + targetItemId).addClass("liucheng-item-selected");
    if (singleTryFlag) {
        myEmitter.emit("completeCallback");
    }
    singleTryFlag = false;
    $("#sameName_tips").hide();
    myEmitter.emit("addNodeSuccess",targetItemId,$('#'+targetItemId).parents("ul").eq(0).hasClass("liucheng-list")?$('#'+targetItemId).parents("ul").eq(0).attr("id"):$('#'+targetItemId).parents("ul").eq(0).parents("li.separate-icon").eq(0).attr("id"),parentULiD)
    // console.timeEnd("addOrEdit");

    /**
     * 类型拼接节点
     * @param thisNodeType 当前节点的类型 for，hashfor，if。。。
     * @param domForm 当前弹窗的form标签
     * @param addLiuchengItem 新增节点的HTML
     * @param node 节点对象
     * @returns void
     */
    function setEditAppendHtml(thisNodeType, domForm, addLiuchengItem, liuchengItem, node) {
        var thisTipsBox = domForm.find(".liucheng-item-tips").length > 0 ? '<div class="liucheng-item-tips">' + domForm.find(".liucheng-item-tips").eq(0).html() + '</div>' : '';
        switch (thisNodeType) {
            case "for":
                liuchengItem += '</div>';
                liuchengItem += thisTipsBox;
                liuchengItem += '<div class="for-menu-box"><ul><li class="segmentation-li"></li>';
                liuchengItem += '</ul><div id="addOne" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div><div class="annotation-tit"><i></i><span></span></div></div></li><li class="segmentation-li"></li>';
                node.type = "for";
                break;
            case "hashfor":
                liuchengItem += '</div>';
                liuchengItem += thisTipsBox;
                liuchengItem += '<div class="for-menu-box"><ul><li class="segmentation-li"></li>';
                liuchengItem += '</ul><div id="addOne" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div></div></li><li class="segmentation-li"></li>';
                node.type = "for";
                break;
            case "if":
                liuchengItem += '</div>';
                liuchengItem += thisTipsBox + '<div class="if-else-main-box">';
                liuchengItem += '<div class="if-else-menu-box then"><span>满足条件时执行</span><ul><li class="segmentation-li"></li>';
                liuchengItem += '</ul>';
                liuchengItem += '<div id="addTwo" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div>';
                liuchengItem += '<div class="if-else-menu-box else"><span>不满足条件时执行</span><ul><li class="segmentation-li"></li>';
                liuchengItem += '</ul><div id="addThree" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div></div>';
                liuchengItem += '<div class="annotation-tit"><i></i><span></span></div></div></li><li class="segmentation-li"></li>';
                node.type = "if";
                break;
            case "excelToObject":
                liuchengItem += '</div>';
                liuchengItem += thisTipsBox;
                liuchengItem += '<div class="for-menu-box"><ul><li class="segmentation-li"></li>';
                liuchengItem += '</ul><div id="addOne" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div><div class="annotation-tit"><i></i><span></span></div></div></li><li class="segmentation-li"></li>';
                node.type = "excelToObject";
                break;
            default:
                liuchengItem += '</div>';
                liuchengItem += thisTipsBox;
                liuchengItem += '<div class="annotation-tit"><i></i><span></span></div></div></li><li class="segmentation-li"></li>';
                node.type = thisNodeType;
                break;
        }
        addLiuchengItem.newNodeItem += liuchengItem;
    }

    function createTryCatchResult(typeText) {
        let tempHtml = "";
        let tempDate = new Date().getTime();
        let tempObj = {};
        tempHtml += '<li id="' + tempDate + '" class="separate-icon menu-item-11 try-catch-end clear">';
        tempHtml += '<div class="node-main-box">';
        tempHtml += '<span class="title">异常处理</span>';
        tempHtml += '<div class="liucheng-item-tips"><p class="dom-active-dec" title><i></i><em>：</em>' + typeText + '</p></div>';
        tempHtml += '</div></li>';
        tempObj.id = tempDate;
        tempObj.htmlParameters = {
            tempaltePath: "../template/../pages/template/exceptions/errorHandler.html",
            tempaltePathName: "异常处理"
        }
        tempObj.catchType = typeText;
        tempObj.type = "catch_result";
        if ($("#coverModal .dispose.change_html").find("input").eq(0).val() != "") {
            let array = $("#coverModal .dispose.change_html").find("input").eq(0).val().split("--");
            tempObj.pointTo = array[1];
        }
        if ($("#coverModal .dispose.from_to_html").find("input").eq(0).val() != "") {
            let array = $("#coverModal .dispose.from_to_html").find("input").eq(0).val().split("--");
            tempObj.fromTo = array[1];
        }
        ctx.set(tempDate, tempObj);
        return {
            tempHtml: tempHtml,
            endId: tempDate
        };
    }
    //return局部变量到全局变量  id name
    function backGlobalParam(targetMateFlowId, name, newName, fromIndex, isEdit, targetItemId) {
        let tempObj = {};
        let isOut = true;
        let tempArray = typeof ctx.get(targetMateFlowId) != "undefined" ? ctx.get(targetMateFlowId) : [];
        let tempGlobalArray = ctx.get("detailPretreatmentList");
        if (tempArray.length > 0) {
            tempArray.forEach((item, index) => {
                if (typeof fromIndex != "undefined") {
                    if (item.fromId == fromIndex) {
                        tempObj = commonUtils.getDeepCloneObj(item);
                    }
                } else {
                    if (item.name == name) {
                        tempObj = commonUtils.getDeepCloneObj(item);
                    } else { //返回的变量为主流程循环节点的单元出参
                        tempObj = commonUtils.getDeepCloneObj(tempArray[index - 1]);
                        tempObj.type = "string";
                        tempObj.fromId = $("#" + targetMateFlowId.replace("secondList", "")).parents(".this_for").attr("id");
                        tempObj.isForMate = true;
                    }
                }
            });
        } else { //返回的变量为主流程循环节点的单元出参
            tempObj.type = "string";
            tempObj.fromId = $("#" + targetMateFlowId.replace("secondList", "")).parents(".this_for").attr("id");
            tempObj.isForMate = true;
            tempObj.parentMateFlowId = targetMateFlowId;
        };
        tempObj.name = newName;
        tempObj.fromIndex = targetItemId;
        if (isEdit) {
            tempGlobalArray.forEach((item, index) => {
                if (tempObj.fromId == item.fromId) {
                    tempGlobalArray[index] = tempObj;
                    isOut = false;
                }
            });
        }
        if (isOut) {
            tempGlobalArray.push(tempObj);
        }
        ctx.set("detailPretreatmentList", tempGlobalArray);
    }
    //判断新增节点的位置，添加节点
    function appendToNewItem(liuchengItemSelected, liuchengItemSelectedType, addLiuchengItem, node, isCurrentEx, targetSecondListId) {
        //现弃用 原 点中for或if框的添加节点的div，将新增节点插入到该for或if框中
        var place = $(".addItemDrag").hasClass("addPlace");
        let isE = false;
        let nodeType = node.type;
        var try_id = "#try" + $('.liucheng-list.current-show-list').attr('id').replace('secondList', '');

        if (place == true) {
            $(".addPlace").parent().find('>ul').append(addLiuchengItem.newNodeItem);
        } else {
            //存在选中的node节点，并且选中类型不为预处理
            switch (nodeType) {
                case "try_catch":
                    let typeText = $("#coverModal .cover-alert .dispose").find("input").val();
                    let try_result = createTryCatchResult(typeText);
                    let endNode = ctx.get(try_result.endId);
                    endNode.checkbox = node.checkbox;
                    endNode.inputInfo = node.inputInfo;
                    endNode.parameters = node.parameters;
                    node.parameters.forEach((item, index) => {
                        if (item.name == "point_to" && item.value != "") {
                            endNode.pointTo = item.value.split("--")[1];
                        }
                        if (item.name == "from_to" && item.value != "") {
                            endNode.fromTo = item.value.split("--")[1];
                        }
                    });
                    endNode.radio = node.radio;
                    endNode.readonlyInput = node.readonlyInput;
                    ctx.set(try_result.endId, endNode);
                    // $(".liucheng-list.current-show-list").find(".abnormity").find(">.last").find(".liucheng-list").eq(0).append(addLiuchengItem.newNodeItem);
                    $(try_id).find(">.last").find(".liucheng-list").eq(0).append(addLiuchengItem.newNodeItem + try_result.tempHtml);

                    isE = true;
                    break;
                default:
                    break;
            }
            if (isE) {
                return;
            }
            if (liuchengItemSelected.length > 0 && (liuchengItemSelectedType == 0 || liuchengItemSelectedType == 1)) {
                if (liuchengItemSelectedType == 0) { //如果选中状态为for或if逻辑框，将新增节点添加到逻辑框中
                    appendLuoji(liuchengItemSelected, addLiuchengItem, isCurrentEx);
                } else if (liuchengItemSelectedType == 1) { //如果选中状态为普通节点，将新增节点添加到选中节点的后面
                    appendPutong(liuchengItemSelected, addLiuchengItem, isCurrentEx)
                }
            } else {
                //如果没有选中状态的节点，则添加到流程的最后面
                if (isCurrentEx) {
                    if (!isE) {
                        $(try_id).find(".abnormity-node.active").find(".liucheng-list").find(".try-catch-end").before(addLiuchengItem.newNodeItem);
                    }
                    // isCurrentEx = false;
                } else {
                    $(".detail-liucheng-lists-box .liucheng-list.current-show-list").append(addLiuchengItem.newNodeItem);
                }
            }

            function appendLuoji(liuchengItemSelected, addLiuchengItem, isCurrentEx) {
                if (liuchengItemSelected.find(">.node-main-box>.for-menu-box").length > 0) {
                    liuchengItemSelected.find(">.node-main-box>.for-menu-box").find(">ul").append(addLiuchengItem.newNodeItem);
                } else if (liuchengItemSelected.hasClass("if-else-menu-box")) {
                    liuchengItemSelected.eq(0).find(">ul").append(addLiuchengItem.newNodeItem);
                } else {
                    liuchengItemSelected.find(">.node-main-box>.for-menu-box").find(">ul").append(addLiuchengItem.newNodeItem);
                }
            };

            function appendPutong(liuchengItemSelected, addLiuchengItem, isCurrentEx) {
                if (liuchengItemSelected.next()[0] && liuchengItemSelected.next()[0].localName == "li" && liuchengItemSelected.next().hasClass("segmentation-li")) {
                    liuchengItemSelected.next().after(addLiuchengItem.newNodeItem);
                } else {
                    liuchengItemSelected.after(addLiuchengItem.newNodeItem);
                }
            }
        }
        //将新增节点初始化可拖拽状态
        if (!secondListDrap[targetSecondListId])

            secondListDrap[targetSecondListId] = $('.liucheng-list.current-show-list').dad({
                draggable: '.menu-icon'
            });
        else {

            secondListDrap[targetSecondListId].addDrapDad($("#" + addLiuchengItem.uuid + " .menu-icon"))
        }
    }
}

// /**
//  * 类型拼接节点
//  * @param thisNodeType 当前节点的类型 for，hashfor，if。。。
//  * @param domForm 当前弹窗的form标签
//  * @param addLiuchengItem 新增节点的HTML
//  * @param node 节点对象
//  * @returns void
//  */
// function setEditAppendHtml(thisNodeType, domForm, addLiuchengItem, liuchengItem, node) {
//     var thisTipsBox = domForm.find(".liucheng-item-tips").length > 0 ? '<div class="liucheng-item-tips">' + domForm.find(".liucheng-item-tips").eq(0).html() + '</div>' : '';
//     switch (thisNodeType) {
//         case "for":
//             liuchengItem += '</div>';
//             liuchengItem += thisTipsBox;
//             liuchengItem += '<div class="for-menu-box"><ul><li class="segmentation-li"></li>';
//             liuchengItem += '</ul><div id="addOne" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div><div class="annotation-tit"><i></i><span></span></div></div></li><li class="segmentation-li"></li>';
//             node.type = "for";
//             break;
//         case "hashfor":
//             liuchengItem += '</div>';
//             liuchengItem += thisTipsBox;
//             liuchengItem += '<div class="for-menu-box"><ul><li class="segmentation-li"></li>';
//             liuchengItem += '</ul><div id="addOne" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div></div></li><li class="segmentation-li"></li>';
//             node.type = "for";
//             break;
//         case "if":
//             liuchengItem += '</div>';
//             liuchengItem += thisTipsBox + '<div class="if-else-main-box">';
//             liuchengItem += '<div class="if-else-menu-box then"><span>满足条件时执行</span><ul><li class="segmentation-li"></li>';
//             liuchengItem += '</ul>';
//             liuchengItem += '<div id="addTwo" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div>';
//             liuchengItem += '<div class="if-else-menu-box else"><span>不满足条件时执行</span><ul><li class="segmentation-li"></li>';
//             liuchengItem += '</ul><div id="addThree" class="addItemDrag addItemDrag-new" ondrop="drop(event)" ondragover="allowDrop(event)">请添加流程</div></div></div>';
//             liuchengItem += '<div class="annotation-tit"><i></i><span></span></div></div></li><li class="segmentation-li"></li>';
//             node.type = "if";
//             break;
//         default:
//             liuchengItem += '</div>';
//             liuchengItem += thisTipsBox;
//             liuchengItem += '<div class="annotation-tit"><i></i><span></span></div></div></li><li class="segmentation-li"></li>';
//             node.type = thisNodeType;
//             break;
//     }
//     addLiuchengItem.newNodeItem += liuchengItem;
// }

//变量set
function setParameters(node, isInSecondPretreatmentLiucheng, isEditExistedItem) {
    // node.outParameterName = domForm.find("input[name='rename']").val();
    let parentMateFlowId = $(".liucheng-list.current-show-list").eq(0).attr("id");

    if (node.id != node.outParameterName && typeof node.outParameterName != "undefined" && node.outParameterName.trim() != "") {

        let type = node.type;
        let outParam = node.outParameterName;
        //set变量信息
        switch (type) {
            case "IDAccountPassword":
                let tempArray = ctx.get("detailPretreatmentList");
                var inputInfo = node.inputInfo;
                var res = {};
                inputInfo.forEach(e => {
                    res[e.name] = e.value;
                });

                let obj1 = {};
                let obj2 = {};
                let obj3 = {};
                let obj4 = {};
                obj1.fromId = obj2.fromId = obj3.fromId = obj4.fromId = node.id;
                obj1.parentMateFlowId = obj2.parentMateFlowId = parentMateFlowId;
                obj3.parentMateFlowId = obj4.parentMateFlowId = parentMateFlowId;
                obj1.type = obj2.type = obj3.type = obj4.type = node.dataType;
                obj1.name = "账号-" + res["ID"];
                obj2.name = "密码-" + res["ID"];
                obj3.name = "归属地-" + res["ID"];
                obj4.name = "部门-" + res["ID"];

                tempArray.push(obj1);
                tempArray.push(obj2);
                tempArray.push(obj3);
                tempArray.push(obj4);
                ctx.set("detailPretreatmentList", tempArray);
                break;
            case "groupPassword": //口令组选择，不生成全局可选变量  command/selectByGroup
                net.httpPost.post("/api/selectByGroup/" + $(".cover-alert #koulingzuID").attr("index"), function (err, data) {
                    if (err) {
                        // debugger;
                        console.error(err);
                        return;
                    }
                    console.log(data);
                    let currentGroup = {};
                    currentGroup.name = $("#koulingzuID").val();
                    currentGroup.data = JSON.parse(data);
                    let isFirst = true;
                    let cmdTemp;
                    let tempIndex;
                    // debugger;
                    if (typeof ctx.get("cmdGroupList") != "undefined") {
                        cmdTemp = ctx.get("cmdGroupList");
                        cmdTemp.forEach((item, index) => {
                            if (item.name == $("#koulingzuID").val()) {
                                isFirst = false;
                                tempIndex = index;
                            }
                        });
                        if (isFirst) {
                            cmdTemp.push(currentGroup);
                            ctx.set("cmdGroupList", cmdTemp);
                        } else {
                            cmdTemp[tempIndex] = currentGroup;
                            ctx.set("cmdGroupList", cmdTemp);
                        }
                    } else {

                        let tempArray = [];
                        tempArray.push(currentGroup);
                        ctx.set("cmdGroupList", tempArray);
                    };
                });
                break;
            case "backGlobalParam":
                break;
            default:
                if (isInSecondPretreatmentLiucheng) { //设置全局变量
                    // node.outParameterName += "-----全局变量";
                    if (typeof ctx.get("detailPretreatmentList") == "undefined") {

                        let tempArray = [];
                        let setObj = {};
                        setObj.type = node.dataType;
                        setObj.fromId = node.id;
                        setObj.name = node.outParameterName;
                        setObj.parentMateFlowId = parentMateFlowId;
                        tempArray.push(setObj);
                        ctx.set("detailPretreatmentList", tempArray);
                        //刷新全局变量显示
                        myEmitter.emit("refreshParameters", "global");
                    } else {

                        let tempArr = ctx.get("detailPretreatmentList");
                        if (isEditExistedItem) {
                            let hasFind = false;
                            let tObj = {};
                            tempArr.forEach((item, index) => {
                                if (item.fromId == node.id) {

                                    item.type = node.dataType;
                                    item.fromId = node.id;
                                    item.name = node.outParameterName;
                                    item.parentMateFlowId = parentMateFlowId;
                                    hasFind = true;
                                }
                            });
                            if(!hasFind){
                                tObj.type = node.dataType;
                                tObj.fromId = node.id;
                                tObj.name = node.outParameterName;
                                tObj.parentMateFlowId = parentMateFlowId;
                                tempArr.push(tObj);
                            }
                            ctx.set("detailPretreatmentList", tempArr);
                            //刷新全局变量显示
                            myEmitter.emit("refreshParameters", "global");
                        } else if (!isEditExistedItem) {
                            let tempObj = {};
                            tempObj.type = node.dataType;
                            tempObj.fromId = node.id;
                            tempObj.name = node.outParameterName;
                            tempObj.parentMateFlowId = parentMateFlowId;
                            tempArr.push(tempObj);
                            ctx.set("detailPretreatmentList", tempArr);
                            //刷新全局变量显示
                            myEmitter.emit("refreshParameters", "global");
                        }
                    }
                } else { //设置局部变量
                    let targetUlID = $(".liucheng-list.current-show-list").attr("id");
                    if (typeof ctx.get(targetUlID) == "undefined") {
                        let tempArray = [];
                        let setObj = {};
                        setObj.type = node.dataType;
                        setObj.fromId = node.id;
                        setObj.name = node.outParameterName;
                        setObj.parentMateFlowId = parentMateFlowId;
                        tempArray.push(setObj);
                        if (type == "for") {
                            node.parameters.forEach((item, index) => {
                                if (item.name == "rename_i" && item.value != "") {
                                    let setObj2 = {};
                                    setObj2.type = node.dataType;
                                    setObj2.fromId = node.id;
                                    setObj2.name = item.value;
                                    setObj2.parentMateFlowId = parentMateFlowId;
                                    tempArray.push(setObj2);
                                }
                            });
                        }
                        // tempArray = updateSameNameParam(tempArray, node.outParameterName, setObj);
                        ctx.set(targetUlID, tempArray);
                        //刷新局部变量显示
                        myEmitter.emit("refreshParameters", "part", parentMateFlowId);
                    } else {
                        let tempArr = ctx.get(targetUlID);
                        if (isEditExistedItem) {
                            let isOldNull = true;
                            let tObj = {};
                            tempArr.forEach((item, index) => {
                                if (item.fromId == node.id) {
                                    item.type = node.dataType;
                                    item.fromId = node.id;
                                    item.name = node.outParameterName;
                                    item.parentMateFlowId = parentMateFlowId;
                                    isOldNull = false;
                                }
                            });
                            if (isOldNull) {
                                tObj.type = node.dataType;
                                tObj.fromId = node.id;
                                tObj.name = node.outParameterName;
                                tObj.parentMateFlowId = parentMateFlowId;
                                tempArr.push(tObj);
                            }
                            if (type == "for") {
                                node.parameters.forEach((item, index) => {
                                    if (item.name == "rename_i" && item.value != "") {
                                        let setObj2 = {};
                                        setObj2.type = node.dataType;
                                        setObj2.fromId = node.id;
                                        setObj2.name = item.value;
                                        setObj2.parentMateFlowId = parentMateFlowId;
                                        tempArr.push(setObj2);
                                    }
                                });
                            }
                            ctx.set(targetUlID, tempArr);
                            //刷新局部变量显示
                            myEmitter.emit("refreshParameters", "part", parentMateFlowId);
                        } else if (!isEditExistedItem) {
                            let setObj = {};
                            setObj.type = node.dataType;
                            setObj.fromId = node.id;
                            setObj.name = node.outParameterName;
                            setObj.parentMateFlowId = parentMateFlowId;
                            // tempArr = updateSameNameParam(tempArr, node.outParameterName, setObj)
                            tempArr.push(setObj);
                            if (type == "for") {
                                node.parameters.forEach((item, index) => {
                                    if (item.name == "rename_i" && item.value != "") {
                                        let setObj2 = {};
                                        setObj2.type = node.dataType;
                                        setObj2.fromId = node.id;
                                        setObj2.name = item.value;
                                        setObj2.parentMateFlowId = parentMateFlowId;
                                        tempArr.push(setObj2);
                                    }
                                });
                            }
                            ctx.set(targetUlID, tempArr);
                            //刷新局部变量显示
                            myEmitter.emit("refreshParameters", "part", parentMateFlowId);
                        }
                    }
                }
                break;
        }
    }
}
// //刷新全局变量显示
// function refreshGlobalParamList() {
//     let tempArray = ctx.get("detailPretreatmentList");
//     if (typeof tempArray == "undefined") {
//         $(".description-left .this_tree >ul").html("");
//         return;
//     }
//     let correspondArray = [];
//     let newArray = [];
//     let tempHtml = "";
//     tempArray.forEach((item, index) => {
//         let tempInedx = correspondArray.indexOf(item.name);
//         if (tempInedx > -1) {
//             if ($("#" + newArray[tempInedx].parentMateFlowId).hasClass("detail-liucheng-pretreatment")) {
//                 newArray[tempInedx] = item;
//             } else {
//                 if ($("#" + item.parentMateFlowId).hasClass("detail-liucheng-pretreatment")) {

//                 } else {
//                     newArray[tempInedx] = item;
//                 }
//             }
//         } else {
//             correspondArray.push(item.name);
//             newArray.push(item);
//         }
//     });
//     newArray.forEach((item, index) => {
//         if (typeof item.parentMateFlowId == "undefined") {
//             return;
//         }
//         let mainItemId = item.parentMateFlowId.replace("secondList", "");
//         let fromEara;
//         let nameText
//         if ($("#" + mainItemId).hasClass("main-liucheng-pretreatment")) {
//             fromEara = "全局声明";
//             nameText = '<em class="come-global">' + item.name + '</em>';
//         } else {
//             fromEara = "元流程-" + $("#" + mainItemId).find(">span.title").text() + "创建";
//             nameText = '<em class="come-part">' + item.name + '</em>';
//         }
//         let type = item.type;
//         if (typeof type == "undefined") {
//             return;
//         }
//         type = type.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
//         tempHtml += '<li><span>' + nameText + '</span><ul>';
//         tempHtml += '<li><span>' + type + '</span>';
//         tempHtml += '<li><span>' + fromEara + '</span>';
//         tempHtml += '</ul></li>';
//     });
//     $(".description-left .this_tree >ul").html(tempHtml);
// }
// //刷新局部变量显示
// function refreshPartParamList(targetMateFlowId) {
//     let tempArray = ctx.get(targetMateFlowId);
//     if (typeof tempArray == "undefined") {
//         $(".description-right .this_tree >ul").html("");
//         return;
//     };
//     let correspondArray = [];
//     let newArray = [];
//     let tempHtml = "";
//     tempArray.forEach((item, index) => {
//         let tempInedx = correspondArray.indexOf(item.name);
//         if (tempInedx > -1) {
//             newArray[tempInedx] = item;
//         } else {
//             correspondArray.push(item.name);
//             newArray.push(item);
//         }
//     });
//     newArray.forEach((item, index) => {
//         let type = item.type;
//         type = type.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
//         tempHtml += '<li><span><em class="part-param">' + item.name + '</em></span><ul>';
//         tempHtml += '<li><span>' + type + '</span>';
//         tempHtml += '</ul></li>';
//     });
//     $(".description-right .this_tree >ul").html(tempHtml);
// }
// //return局部变量到全局变量  id name
// function backGlobalParam(targetMateFlowId, name, newName, fromIndex, isEdit, targetItemId) {
//     let tempObj = {};
//     let isOut = true;
//     let tempArray = typeof ctx.get(targetMateFlowId) != "undefined" ? ctx.get(targetMateFlowId) : [];
//     let tempGlobalArray = ctx.get("detailPretreatmentList");
//     if (tempArray.length > 0) {
//         tempArray.forEach((item, index) => {
//             if (typeof fromIndex != "undefined") {
//                 if (item.fromId == fromIndex) {
//                     tempObj = commonUtils.getDeepCloneObj(item);
//                 }
//             } else {
//                 if (item.name == name) {
//                     tempObj = commonUtils.getDeepCloneObj(item);
//                 } else {//返回的变量为主流程循环节点的单元出参
//                     tempObj = commonUtils.getDeepCloneObj(tempArray[index - 1]);
//                     tempObj.type = "string";
//                     tempObj.fromId = $("#" + targetMateFlowId.replace("secondList", "")).parents(".this_for").attr("id");
//                     tempObj.isForMate = true;
//                 }
//             }
//         });
//     } else {//返回的变量为主流程循环节点的单元出参
//         tempObj.type = "string";
//         tempObj.fromId = $("#" + targetMateFlowId.replace("secondList", "")).parents(".this_for").attr("id");
//         tempObj.isForMate = true;
//         tempObj.parentMateFlowId = targetMateFlowId;
//     };
//     tempObj.name = newName;
//     tempObj.fromIndex = targetItemId;
//     if (isEdit) {
//         tempGlobalArray.forEach((item, index) => {
//             if (tempObj.fromId == item.fromId) {
//                 tempGlobalArray[index] = tempObj;
//                 isOut = false;
//             }
//         });
//     }
//     if (isOut) {
//         tempGlobalArray.push(tempObj);
//     }
//     ctx.set("detailPretreatmentList", tempGlobalArray);
// }
// //覆盖数组重复变量
// function updateSameNameParam(array, name, item) {
//     let hasSameName = false;
//     array.forEach((ele, index) => {
//         if (ele.name == name) {
//             array[index] = item;
//             hasSameName = true;
//         }
//     });
//     if (!hasSameName) {
//         array.push(item);
//     }
//     return array;
// }
// //刷新主流程块出参信息
// function refreshMainFlowOutParam(id) {
//     let array = ctx.get("detailPretreatmentList");
//     let correspondArray = [];
//     let newArray = [];
//     let pretreatmentSecondId = $(".liucheng-list.detail-liucheng-pretreatment").eq(0).attr("id");
//     if (typeof array == "undefined") {

//         array = [];
//     };
//     array.forEach((item, index) => {
//         let tempInedx = correspondArray.indexOf(item.name);
//         let p = pretreatmentSecondId == item.parentMateFlowId ? true : false;
//         let tempObjIndex;
//         newArray.forEach((ele, index) => {
//             let t = pretreatmentSecondId == ele.parentMateFlowId ? true : false;;
//             if (ele.name == item.name) {
//                 if (p) {
//                     if (t) {
//                         tempObjIndex = index;
//                     }
//                 } else {
//                     if (!t && ele.parentMateFlowId == item.parentMateFlowId) {
//                         tempObjIndex = index;
//                     }
//                 }
//             }
//         });
//         if (typeof tempObjIndex != "undefined") {
//             newArray[tempObjIndex] = item;
//         } else {
//             newArray.push(item);
//         }
//     });
//     if (typeof id == "undefined") {
//         $(".main-liucheng-item").each(() => {
//             $(this).find(">.parameter-botton").find("label").nextAll().remove();
//         })
//         newArray.forEach((item, index) => {
//             let mId = item.parentMateFlowId.replace('secondList', '');
//             let html = '<i>' + item.name + '</i>';
//             $('#' + mId).find('>.parameter-botton').append(html);
//         });
//     } else {
//         refreshDom(id, newArray);
//     };
//     function refreshDom(mainId, tempArray) {
//         let html = '';
//         let array = [];
//         $('#' + mainId).find(">.parameter-botton").find("label").nextAll().remove();
//         tempArray.forEach((item, index) => {

//             let id = item.parentMateFlowId.replace('secondList', '');
//             if (mainId == id) {
//                 array.push(item);
//             }
//         });
//         array.forEach((item, index) => {

//             html += '<i>' + item.name + '</i>'
//         });
//         if ($('#' + mainId).find(">.parameter-botton").length > 0) {

//             $('#' + mainId).find(">.parameter-botton").append(html);
//         }
//     };

// };