let nowIsDebugger = false;
jQuery(document).ready(function ($) {
    var iconv = require('iconv-lite');
    // var properties = JSON.parse(fs.readFileSync('./config/properties.json', 'utf8'));
    const http = require('http');
    $('body').on('click', '.addItemDrag', function () {

        let pd = true;
        var place = $(".addItemDrag").hasClass("addPlace");
        if (place == true) {
            $(".addItemDrag").removeClass('addPlace')
            $(this).addClass('addPlace');
            pd = false;
        } else {
            $(this).addClass('addPlace');
        }
        if (pd == false) {
            $(".addItemDrag").removeClass('addPlace')
            pd = true
        }
    });


    //鼠标移入注释显示
    $(".detail-liucheng-lists-box").on("mouseover", "li", function (event) {
        event.stopPropagation();
        if (typeof $(this).attr("annotation") != "undefined" && $(this).attr("annotation") != "") {
            let val = $(this).attr("annotation");
            $(this).find(">.node-main-box").find(">.annotation-tit").css("display", "-webkit-box").find("span").text(val);
        } else {
            $(this).find(">.node-main-box").find(">.annotation-tit").hide();
        }
    });
    //鼠标移出注释消失
    $(".detail-liucheng-lists-box").on("mouseleave", "li", function (event) {
        event.stopPropagation();
        if (typeof $(this).attr("annotation") != "undefined") {
            $(this).find(">.node-main-box").find(">.annotation-tit").hide();
        }
    })

    /**********添加注释功能    结束  **********/

    $(".utils-item-7").on("click", function () {
        let json = [];
        doGetWorkflow($(".liucheng-box .liucheng-list > li"), json);
        console.log(JSON.stringify(json).replace(/\\\"/g, "'"));
        // $.ajax({ url: "127.0.0.1:8088", async: false, dataType: "jsonp", data: JSON.stringify(json) });
        $.ajax({
            url: request_url,
            type: 'post',
            dataType: "json",
            data: {
                data: JSON.stringify(json),
                html: $(".liucheng-list").html().toString()
            },
            success: function (data) {
                console.log(data)
            },
            error: function (data) {
                console.log(data)
            }
        });
        console.log("发送成功!");
    });

    /**********调试按钮    开始**********/
    //进入调试
    ipc.on("debugger_show", function () {

        $(".main-liucheng-utils-box .debugger-show").css("display", "inline-block");
        loadingBox.end();
        nowIsDebugger = true;
        $(".description-action .this_tree>ul").empty();
    });

    //断点回传变量
    ipc.on("changeParameters", function (event, data) {
        let gHtml = "";
        let pHtml = "";
        $(".description-left .this_tree>ul").empty();
        $(".description-right .this_tree>ul").empty();
        // console.log(data);
        if (data.globalData.length > 0) {
            data.globalData.forEach((item, index) => {
                let type = {};
                let param;
                let name;
                let tempHtml = '';
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        param = item[key];
                        name = key;
                    }
                }
                let tempType = ctx.signature(param);
                switch (tempType) {
                    case "p": //string  number
                        type = "String";
                        break;
                    case "[p": //array
                        type = "Array";
                        break;
                    case "{p": //obj
                        type = "Object";
                        break;
                    case "[[p": //array[array]
                        type = "Array[Array]";
                        break;
                    case "[{p": //array[obj]
                        type = "Array[Object]";
                        break;
                    default: //其他的是多维数组
                        type = "Array[Array]";
                        break;
                }
                gHtml += '<li><span><em class="come-global">' + name + '</em></span>';
                gHtml += '<ul><li><span>' + type + '</span></li>';
                if (type == "String") {
                    gHtml += '<li><span class="string-value">' + param + '</span></li>';
                } else {
                    gHtml += '<li><span>Value</span>';
                    gHtml += setDetailHtml(param);
                    gHtml += '</li>'
                }
                gHtml += '</ul></li>';
            })
        }
        $(".description-left .this_tree>ul").html(gHtml);
        if (data.partData.length > 0) {
            data.partData.forEach((item, index) => {
                let type = {};
                let param;
                let name;
                let tempHtml = '';
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        param = item[key];
                        name = key;
                    }
                }
                let tempType = ctx.signature(param);
                switch (tempType) {
                    case "p": //string  number
                        type = "String";
                        break;
                    case "[p": //array
                        type = "Array";
                        break;
                    case "{p": //obj
                        type = "Object";
                        break;
                    case "[[p": //array[array]
                        type = "Array[Array]";
                        break;
                    case "[{p": //array[obj]
                        type = "Array[Object]";
                        break;
                    default: //其他的是多维数组
                        type = "Array[Array]";
                        break;
                }
                pHtml += '<li><span><em class="come-part">' + name + '</em></span>';
                pHtml += '<ul><li><span>' + type + '</span></li>';
                if (type == "String") {
                    pHtml += '<li><span class="string-value"><em>' + param + '</em></span></li>';
                } else {
                    pHtml += '<li><span>Value</span>';
                    pHtml += setDetailHtml(param);
                    pHtml += '</li>'
                }
                pHtml += '</ul></li>';
            })
        }
        $(".description-right .this_tree>ul").html(pHtml);

        function setDetailHtml(data, html = "", type) {
            let tempType = ctx.signature(data);
            switch (tempType[0]) {
                case "[":
                    html += '<ul>';
                    data.forEach((item, index) => {
                        html += '<li><span class="array-key"><em>' + index + '</em></span>';
                        html += setDetailHtml(item, '');
                        html += '</li>';
                    });
                    html += '</ul>';
                    break;
                case "{":
                    html += '<ul>';
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            const element = data[key];
                            html += '<li><span class="object-key"><em>' + key + '</em></sapn>';
                            html += setDetailHtml(element, '');
                            html += '</li>';
                        }
                    }
                    html += '</ul>';
                    break;
                default:
                    html += ':<span class="string-value"><em>' + data + '</em></span>';
                    break;
            }
            return html;

        }
    });

    $(".parameters-info-list").on("click", ">li", function () {
        if ($(this).find(">i").hasClass("icon-parameter-open")) {
            $(this).find(">i").removeClass("icon-parameter-open");
            $(this).find(">ul").hide();
        } else {
            $(this).find(">i").addClass("icon-parameter-open");
            $(this).find(">ul").show();
        }
    });

    //调试结束
    ipc.on("changeParameters_end", function () {
        // $(".debugger-parameters").hide();
        // $(".page-jump").show();
        // $(".main-botttpm").show();
        $(".main-liucheng-utils-box .debugger-show").css("display", "none");
        $(".debug-current").removeClass("debug-current");
        nowIsDebugger = false;
        $(".logo-tit-box .status-an").hide();
        myEmitter.emit("refreshParameters", "global");
    });
    /**********调试按钮    结束**********/

    //预处理显示按钮
    $(".utils-item-9").on('click', function () {
        $(".pretreatment-box").css("display", "inline-block");
    });

    //显示当前运行的节点
    ipc.on('doItem', function (event, data) {
        console.log("doItem", data);
        console.log(data.id);
        debugLiuchengView(data.id);
    });
    ipc.on('logJobHtml', function (event, data) {
        let html = $(".main-liucheng-box .main-liucheng-list").html() + thisIsMainAndMateFlag + $(".detail-liucheng-box .detail-liucheng-lists-box").html()
        let job_html = {
            job_id: data,
            job_html: html
        };
        ipc.send("logJobHtmlBack", job_html);

    });
    ipc.on('rpa_action_alert', function (event, data) {
        // TODO 弹出警告窗口
        // $("#main-tips-actuator-box").show();
        remote.getCurrentWindow().focus();
        layer.msg(data, {
            time: 3000, //3s后自动关闭
            icon: 1,
            title: " ",
            skin: 'layer-ext-clearData',
            btn: ['确定'],
            end: function (index) {
                layer.close(index);
                ipc.send("continue_do_fuzhu", "yes");
            },

        });
    });
    ipc.on('fuzhu_actutor_alert_open', function (event, data) {
        // TODO 弹出警告窗口
        // $("#main-tips-actuator-box").show();
        remote.getCurrentWindow().focus();
        layer.confirm('未发现正确的起始运行窗口！是否继续执行？', {
            icon: 2,
            title: " ",
            skin: 'layer-ext-clearData',
            btn: ['继续', '结束'], //按钮
            yes: function (index) {
                ipc.send("continue_do_fuzhu", "yes");
                layer.close(index);

            },
            btn2: function (index) {
                ipc.send("continue_do_fuzhu", "no");
                layer.close(index);
            }
        });
    });

    function calcOffset(id) {
        let item = $("#" + id);
        let itemParent = item.parent();
        let offsetTop = item[0].offsetTop;
        let offsetLeft = item[0].offsetLeft
        while (!itemParent.hasClass("liucheng-list")) {
            offsetTop += itemParent[0].offsetTop;
            offsetLeft += itemParent[0].offsetLeft;
            itemParent = itemParent.parent();
        }
        return {
            offsetTop: offsetTop,
            offsetLeft: offsetLeft
        };
    }
    //debug时断点流程的样式
    function debugLiuchengView(id) {
        if (typeof id === "undefined") {
            return;
        }
        let item = $("#" + id);
        // console.log(id);
        let mainItemId;
        let offsetTop;
        let offsetLeft;
        let itemParent = item.parent();
        let itemParentsUl = item.parents("ul.liucheng-list").eq(0);
        if (!item.hasClass("main-liucheng-item")) {
            offsetTop = calcOffset(id).offsetTop;
            offsetLeft = calcOffset(id).offsetLeft;
            if (typeof itemParentsUl.attr("id") != "undefined" && itemParentsUl.attr("id") != "") {
                mainItemId = itemParentsUl.attr("id").replace("secondList", "");
                if ($("#" + mainItemId).hasClass("main-item-select")) {

                } else {
                    $("#" + mainItemId).click();
                }
            }
            $(".debug-current").removeClass("debug-current");
            item.addClass("debug-current");
            itemParentsUl.scrollTop(offsetTop - itemParentsUl.outerHeight() / 2);
            itemParentsUl.scrollLeft(offsetLeft - itemParentsUl.outerWidth() / 2);
        } else {
            item.click();
        }
        // console.log(itemParentsUl.scrollTop());
    }


    /**********提示框中入参和出参鼠标悬浮效果   开始  **********/
    /**
     * 获得与当前出参有关联的入参
     */
    $('body').on('mouseenter', '.font-out-paramter', function (event) {
        event.preventDefault();
        $(this).parent().parent().find('.in-parameter .font-in-paramter').css('color', 'red');
    });
    $('body').on('mouseout', '.font-out-paramter', function (event) {
        event.preventDefault();
        $(this).parent().parent().find('.in-parameter .font-in-paramter').css('color', '#34afb4');
    });


    /**
     * 获得与当前入参有关联的出参
     */
    var ipc_title = "";
    $('body').on('mouseenter', '.font-in-paramter', function (event) {
        event.preventDefault();
        ipc_title = $(this).text();
        outParameter();
        $(this).parent().find('b').css('color', '#34afb4');
        $(this).parents('li').find('.in-parameter').eq(1).find('b').css('color', 'red')
    });
    $('body').on('mouseout', '.font-in-paramter', function (event) {
        event.preventDefault();
        $('.in-parameter b').css('color', '#34afb4')
    });
    // 获取所有出参

    function outParameter() {
        $(".in-parameter").each(function () {
            if (ipc_title == $(this).find("b").text()) {
                console.log($(this).find("b").text())
                $(this).parents('li').find('.in-parameter b').css('color', 'red')
            }

        });
    }
    /**********提示框中入参和出参鼠标悬浮效果   结束  **********/



    //隐藏机器人提示
    $(".icon-no-data-tip-close").on("click", function () {
        $(this).parent().hide();
    });


    //选中节点新增节点 ----------开始-----------
    $(".detail-liucheng-lists-box").on("click", "li.dads-children,div.if-else-menu-box", function (event) {
        // event.stopPropagation();
        event.stopPropagation();
        event.preventDefault();
        $(".liucheng-list li.liucheng-item-selected,.liucheng-list div.liucheng-item-selected,.pretreatment-list .liucheng-item-selected").removeClass("liucheng-item-selected");
        $(this).addClass("liucheng-item-selected");
        if ($(this).parents(".for-menu-box").length > 0) {
            event.stopPropagation();
        };
        myEmitter.emit('mateLiuchengNodeCut')
    });

    $(".detail-liucheng-lists-box").on("click", ".if-else-menu-box.then", function (event) {
        // event.stopPropagation();
        event.stopPropagation();
        event.preventDefault();
        $(".liucheng-list li.liucheng-item-selected,.liucheng-list div.liucheng-item-selected").removeClass("liucheng-item-selected");
        $(this).addClass("liucheng-item-selected");
    });

    $(".detail-liucheng-lists-box").on("click", ".if-else-menu-box.else", function (event) {
        // event.stopPropagation();
        event.stopPropagation();
        event.preventDefault();
        $(".liucheng-list li.liucheng-item-selected,.liucheng-list div.liucheng-item-selected").removeClass("liucheng-item-selected");
        $(this).addClass("liucheng-item-selected");
    });

    $(".main-right").on("click", function () {
        $(".liucheng-list li.liucheng-item-selected,.liucheng-list .liucheng-item-selected,.liucheng-item-selected").removeClass("liucheng-item-selected");
    });

    //选中节点新增节点 ----------结束-----------

    //节点框下拉功能 暂废弃
    $(".liucheng-list").on("click", ".liucheng-icon-xiala", function () {
        if ($(this).parents("li").find(".if-else-menu-box").length > 0) {
            if ($(this).parents("li").find(".if-else-menu-box").css("display") == "block") {
                $(this).css("background", "url('../img/icon-xiala-xia.png')no-repeat center");
            } else {
                $(this).css("background", "url('../img/icon-xiala.png')no-repeat center");
            }
            $(this).parents("li").find(".if-else-menu-box").toggle();
        } else {
            if ($(this).parents("li").find(".for-menu-box").css("display") == "block") {
                $(this).css("background", "url('../img/icon-xiala-xia.png')no-repeat center");
            } else {
                $(this).css("background", "url('../img/icon-xiala.png')no-repeat center");
            }
            $(this).parents("li").find(".for-menu-box").toggle();
        }
        // $('.for-menu-box ul').dad({
        //     draggable: '.menu-icon1'
        // });

    });

    //删除节点功能
    $(".detail-liucheng-lists-box").on("click", ".liucheng-icon-delete", function () {

        var firstLi = $(this).parents('li').eq(0).attr('id');
        // var firstLi = '#' + firstLi;
        var prevLi = $("#" + firstLi).prev().attr('class');
        let isHasOutParam = false;
        if (typeof (ctx.get(firstLi)) != "undefined") {
            if (typeof (ctx.get(firstLi).outParameterName) != "undefined") {
                isHasOutParam = ctx.get(firstLi).outParameterName;
            }
        }
        let currentListId = $(".liucheng-list.current-show-list").eq(0).attr("id");
        let detailPretreatmentList = ctx.get("detailPretreatmentList");
        // console.log(prevLi);
        // if (typeof ctx.get(firstLi) != "undefined") {
        if ($("#" + firstLi).find(">.node-main-box").find(">span.title").text() === "异常捕获" || ctx.get(firstLi).name === "异常捕获") {
            let isSingle = false;
            let singleId;
            ctx.get(firstLi).inputInfo.forEach((item, index) => {
                if (item.name == 'singleNodeId' && item.value != '') {
                    isSingle = true;
                    singleId = item.value
                }
            })
            if (isSingle) {
                $('#' + singleId).find('>.single-try-catch').find('.single-try-edit').hide();
                $('#' + singleId).find('>.single-try-catch').find('.single-try-start').show();
            }
            $(this).parents(".abnormity-node").remove();
            return;
        }
        if (prevLi == "separate-block") {
            $(this).parents('li').eq(0).prev().remove();
        } else if (prevLi == undefined) {
            $(this).parents('li').next().find('.sub').remove();
            $(this).parents('li').next().find('.sup').remove();
        }
        if (isHasOutParam) {
            if ($(".liucheng-list.current-show-list").hasClass("detail-liucheng-pretreatment")) {
                // let tempArray = ctx.get("detailPretreatmentList");
                detailPretreatmentList.forEach((item, index) => {
                    if (item.fromId == firstLi && item.name == isHasOutParam) {
                        detailPretreatmentList.splice(index, 1);
                    } else if (typeof item.fromIndex != "undefined" && item.fromIndex == firstLi) {
                        detailPretreatmentList.splice(index, 1);
                    }
                });
                ctx.set("detailPretreatmentList", detailPretreatmentList);
                myEmitter.emit("refreshParameters", "global");
            } else {
                let tempArray = ctx.get(currentListId);
                switch (ctx.get(firstLi).type) {
                    case "backGlobalParam":
                        detailPretreatmentList.forEach((item, index) => {
                            if (item.fromIndex == firstLi) {
                                detailPretreatmentList.splice(index, 1);
                            }
                        });
                        ctx.set("detailPretreatmentList", detailPretreatmentList);
                        myEmitter.emit("refreshParameters", "global");
                        myEmitter.emit("refreshParameters", "part", currentListId);
                        break;
                    default:
                        // tempArray.forEach((item, index) => {
                        //     if (item.fromId == firstLi && item.name == isHasOutParam) {
                        //         tempArray.splice(index, 1);
                        //     } else if (typeof item.fromIndex != "undefined" && item.fromIndex == firstLi) {
                        //         tempArray.splice(index, 1);
                        //     }
                        // });
                        setTimeout((function (currentListId) {
                            let tempArray = ctx.get(currentListId);

                            function fn() {
                                let array = [];
                                tempArray.forEach((item, index) => {
                                    if ($("#" + item.fromId).length > 0) {
                                        array.push(item);
                                    }
                                });
                                ctx.set(currentListId, array);
                                myEmitter.emit("refreshParameters", "part", currentListId);
                            };
                            return fn;
                        })(currentListId), 0);
                        break;
                }

            }

        } else if (!$(".liucheng-list.current-show-list").hasClass("detail-liucheng-pretreatment")) {
            let tempArray = ctx.get(currentListId);
            switch (ctx.get(firstLi).type) {
                case "backGlobalParam":
                    detailPretreatmentList.forEach((item, index) => {
                        if (item.fromIndex == firstLi) {
                            detailPretreatmentList.splice(index, 1);
                        }
                    });
                    ctx.set("detailPretreatmentList", detailPretreatmentList);
                    myEmitter.emit("refreshParameters", "global");
                    myEmitter.emit("refreshParameters", "part", currentListId);
                    break;
                default:
                    // tempArray.forEach((item, index) => {
                    //     if (item.fromId == firstLi && item.name == isHasOutParam) {
                    //         tempArray.splice(index, 1);
                    //     } else if (typeof item.fromIndex != "undefined" && item.fromIndex == firstLi) {
                    //         tempArray.splice(index, 1);
                    //     }
                    // });
                    setTimeout((function (currentListId) {
                        let tempArray = ctx.get(currentListId) ? ctx.get(currentListId) : [];

                        function fn() {
                            let array = [];
                            tempArray.forEach((item, index) => {
                                if ($("#" + item.fromId).length > 0) {
                                    array.push(item);
                                }
                            });
                            ctx.set(currentListId, array);
                            myEmitter.emit("refreshParameters", "part", currentListId);
                        };
                        return fn;
                    })(currentListId), 0);
                    break;
            }
        }
        myEmitter.emit('deleteNodeDom', firstLi)
        $(this).parents("li").eq(0).next("li.segmentation-li").remove();
        $(this).parents("li").eq(0).remove();

    });


    //流程list修改数据
    //双击li触发
    $(".detail-liucheng-lists-box,.pretreatment-list").on("dblclick", "span.title", function (event) {
        let thisParantId = $(this).parents("li").eq(0).attr("id");
        let thisNodeInfo = ctx.get(thisParantId);
        let isTryCatch = false;
        isTryCatch = commonUtils.getTargetFlowID().isTryCatch;
        if ($(event.target).text() == "异常捕获") {
            // return;
            if (typeof thisNodeInfo == 'undefined') {
                thisNodeInfo = {};
                let parentId = $(this).parents("li").eq(0).parent('ul.ab_module').attr('id');
                commonUtils.deepClone(thisNodeInfo, ctx.get(parentId));
                thisNodeInfo.id = thisParantId;
                ctx.set(thisParantId, thisNodeInfo)
            }
        } else if ($(event.target).text() == "异常处理") {
            // return;
            if (typeof thisNodeInfo == 'undefined') {
                thisNodeInfo = {};
                let parentId = $(this).parents("li").eq(0).parent('ul.ab_module').attr('id');
                commonUtils.deepClone(thisNodeInfo, ctx.get(parentId));
                thisNodeInfo.id = thisParantId;
                thisNodeInfo.type = 'catch_result';
                ctx.set(thisParantId, thisNodeInfo)
            }
        }
        let menuObj = ctx.get('menu_obj')
        let tempUrl = thisNodeInfo.htmlParameters.tempaltePath;
        let targetUrl = tempUrl.indexOf("?") > -1 ? tempUrl.substring(0, tempUrl.indexOf("?")) : tempUrl;
        modal.$data.editLiuchengItem.isEditExistedItem = true;
        modal.$data.editLiuchengItem.editItemIndex = $(this).parents("li").index();
        modal.$data.editLiuchengItem.editItemId = thisParantId;
        modal.postion = {
            top: event.pageY,
            left: event.pageX,
        }
        switch (thisNodeInfo.type) {
            case "saveNewParam":
                if (thisNodeInfo.name == '设置全局变量') {
                    targetUrl = menuObj['saveNewParam'];
                } else if (thisNodeInfo.name == '设置新变量') {
                    targetUrl = menuObj['saveNewParam'];
                }
                break;
            case "exportFile":
                if (thisNodeInfo.name == '写入文档') {
                    targetUrl = menuObj['exportTextFile'];
                } else if (thisNodeInfo.name == '写入数据表格') {
                    targetUrl = menuObj['exportFile'];
                }
                break;
            case "importFile":
                if ($('#' + thisParantId).parents('.detail-liucheng-pretreatment').length > 0) {
                    targetUrl = menuObj['importFile'];
                } else {
                    targetUrl = menuObj['importFile_normal'];
                }
                break;
            case "importTextFile":
                if ($('#' + thisParantId).parents('.detail-liucheng-pretreatment').length > 0) {
                    targetUrl = menuObj['importTextFile'];
                } else {
                    targetUrl = menuObj['importTextFile_normal'];
                }
                break;
            case "for":
                if (thisNodeInfo.name == '列表遍历') {
                    targetUrl = menuObj['hashfor'];
                } else if (thisNodeInfo.name == '迭代循环') {
                    targetUrl = menuObj['for'];
                }
                break;
            default:
                if (menuObj.hasOwnProperty(thisNodeInfo.type)) {

                    targetUrl = menuObj[thisNodeInfo.type];
                } else {
                    targetUrl = targetUrl.substring(targetUrl.lastIndexOf('template/') + 9)
                }
                break;
        }
        console.log(targetUrl)
        modal.showModal(targetUrl, thisNodeInfo.htmlParameters.tempaltePathName, function () {
            console.log(event)
            $("#coverModal").find(">.cover-alert").attr("comeindex", thisParantId)
            switch ($(event.target).text()) {
                case "http接口":
                    let httpTemp = $(".liadd").eq(0).clone(true).find('[type="text"]').val("").parent().parent().find('.sub').css("display", "inline").parent();
                    $(".liadd").eq(0).find(".sub").hide();
                    thisNodeInfo.parameters.forEach(e => {
                        if ($("#coverModal [name='" + e.name + "']").length > 0) {
                            if ($("#coverModal [name=" + e.name + "]").attr("type") != 'radio') {
                                $("#coverModal [name=" + e.name + "]").val(e.value)
                            }
                        } else {
                            let id = e.name.replace(/[^0-9]/ig, "")
                            httpTemp.clone(true).find("[name='key1']").attr("name", "key" + id).parent().find("[name='value1']").attr("name", "value" + id).parent().parent().appendTo(".httpparameters")
                            if ($("#coverModal [name=" + e.name + "]").attr("type") == 'text') {
                                $("#coverModal [name=" + e.name + "]").val(e.value)
                            }
                        }
                    });
                    break;
                case "数组拼接":
                    var jiheTemp = $(".liadd").eq(0).clone(true).find('[type="text"]').val("").parent().parent().find('.sub').css("display", "inline").parent();
                    $(".liadd").eq(0).find(".sub").hide();
                    thisNodeInfo.parameters.forEach(e => {
                        if ($("#coverModal [name='" + e.name + "']").length > 0) {
                            if ($("#coverModal [name=" + e.name + "]").attr("type") != 'radio') {
                                $("#coverModal [name=" + e.name + "]").val(e.value)
                            }
                        } else {
                            let id = e.name.replace(/[^0-9]/ig, "")
                            jiheTemp.clone(true).find("[name='value1']").attr("name", "value" + id).parents(".input-boxs").appendTo(".httpparameters")
                            if ($("#coverModal [name=" + e.name + "]").attr("type") == 'text') {
                                $("#coverModal [name=" + e.name + "]").val(e.value)
                            }
                        }
                    });
                    break;
                case "设置集合变量":
                    var jiheTemp = $(".liadd").eq(0).clone(true).find('[type="text"]').val("").parent().parent().find('.sub').css("display", "inline").parent();
                    $(".liadd").eq(0).find(".sub").hide();
                    thisNodeInfo.parameters.forEach(e => {
                        if ($("#coverModal [name='" + e.name + "']").length > 0) {
                            if ($("#coverModal [name=" + e.name + "]").attr("type") != 'radio') {
                                $("#coverModal [name=" + e.name + "]").val(e.value)
                            }
                        } else {
                            let id = e.name.replace(/[^0-9]/ig, "")
                            jiheTemp.clone(true).find("[name='key1']").attr("name", "key" + id).parents(".input-boxs").eq(0).find("[name='value1']").attr("name", "value" + id).parents(".input-boxs").appendTo(".httpparameters")
                            if ($("#coverModal [name=" + e.name + "]").attr("type") == 'text') {
                                $("#coverModal [name=" + e.name + "]").val(e.value)
                            }
                        }
                    });
                    break;
                case "发送邮件":
                    thisNodeInfo.parameters.forEach(e => {
                        switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                            case "radio":

                                break;
                            case "checkbox":
                                if (e.value == "on") $("#coverModal [name=" + e.name + "]").attr('checked', 'true');
                                break;
                            default:
                                if (e.name == "html") {
                                    $("#coverModal div[name=html]").html(e.value)
                                } else {
                                    $("#coverModal [name=" + e.name + "]").val(e.value)
                                }
                                break;
                        }
                    });

                    break;
                case "字符串拼接":
                    thisNodeInfo.parameters.forEach(e => {
                        switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                            case "radio":

                                break;
                            case "checkbox":
                                if (e.value == "on") $("#coverModal [name=" + e.name + "]").attr('checked', 'true');
                                break;
                            default:
                                if (e.name == "html") {
                                    var value_html = e.value;
                                    if (value_html.indexOf("@") != (-1)) {
                                        let regx_at = /@\S+/g;

                                        var results = value_html.match(regx_at);
                                        var map_at = new Set();
                                        results.forEach(function (value) {
                                            map_at.add(value);
                                        });
                                        map_at.forEach(function (value) {
                                            var param_ctx = "<span>" + value + " " + "</span>";
                                            if (typeof (param_ctx) != "undefined") {
                                                var new_regx = new RegExp(value + "\\s", "g");
                                                value_html = value_html.replace(new_regx, param_ctx);
                                            }
                                        });
                                    }
                                    $("#coverModal div[name=html]").html(value_html.trim())
                                } else {
                                    $("#coverModal [name=" + e.name + "]").val(e.value)
                                }
                                break;
                        }
                    });
                    break;
                case "异常捕获":
                    thisNodeInfo.parameters.forEach(e => {
                        switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                            case "radio":
                                break;
                            case "checkbox":
                                if (e.value == "on") $("#coverModal [name=" + e.name + "]").attr('checked', 'true');
                                break;
                            default:
                                $("#coverModal [name=" + e.name + "]").val(e.value);
                                // $("#coverModal [name=" + e.name + "]").parent().show();
                                break;
                        }
                    });
                    thisNodeInfo.inputInfo.forEach((item, index) => {
                        if (typeof item.isShow != "undefined") {
                            if (item.isShow && "handle_type,point_to,forActive,from_to".indexOf(item.name) == -1) {
                                $("#coverModal [name=" + item.name + "]").parent().show();
                            }
                        }
                    })
                    break;
                case "异常处理":
                    thisNodeInfo.parameters.forEach(e => {
                        switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                            case "radio":
                                break;
                            case "checkbox":
                                if (e.value == "on") $("#coverModal [name=" + e.name + "]").attr('checked', 'true');
                                break;
                            default:

                                $("#coverModal [name=" + e.name + "]").length > 0 ? $("#coverModal [name=" + e.name + "]").val(e.value) : '';
                                // $("#coverModal [name=" + e.name + "]").parent().show();
                                break;
                        }
                    });
                    thisNodeInfo.inputInfo.forEach((item, index) => {
                        if (typeof item.isShow != "undefined") {
                            if (item.isShow && "handle_type,point_to,forActive,from_to".indexOf(item.name) > -1) {
                                $("#coverModal [name=" + item.name + "]").parent().show();
                            }
                        }
                    })
                    break;
                case "写入数据表格":
                    thisNodeInfo.parameters.forEach(e => {
                        switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                            case "radio":
                                // $("#coverModal [name=" + e.name + "]")
                                break;
                            case "checkbox":
                                if (e.value == "on") $("#coverModal [name=" + e.name + "]").attr('checked', 'true');
                                if (e.name == "isSaveHistory" && e.value == "true") {
                                    $("#coverModal div.save-history").show();
                                }
                                break;
                            default:
                                $("#coverModal [name=" + e.name + "]").val(e.value);
                                if (e.value != "") {
                                    $("#coverModal [name=" + e.name + "]").parent().show();
                                };
                                break;
                        }
                    })
                    break;
                case "写入文档":
                    thisNodeInfo.parameters.forEach(e => {
                        switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                            case "radio":
                                // $("#coverModal [name=" + e.name + "]")
                                break;
                            case "checkbox":
                                if (e.value == "on") $("#coverModal [name=" + e.name + "]").attr('checked', 'true');
                                if (e.name == "isSaveHistory" && e.value == "true") {
                                    $("#coverModal div.save-history").show();
                                }
                                break;
                            default:
                                $("#coverModal [name=" + e.name + "]").val(e.value);
                                if (e.value != "") {
                                    $("#coverModal [name=" + e.name + "]").parent().show();
                                };
                                break;
                        }
                    })
                    break;
                case "保存验证码图片":
                    thisNodeInfo.parameters.forEach(e => {
                        switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                            case "radio":
                                // $("#coverModal [name=" + e.name + "]")
                                break;
                            case "checkbox":
                                if (e.value == "on") $("#coverModal [name=" + e.name + "]").attr('checked', 'true');
                                if (e.name == "isSaveHistory" && e.value == "true") {
                                    $("#coverModal div.save-history").show();
                                }
                                break;
                            default:
                                $("#coverModal [name=" + e.name + "]").val(e.value);
                                if (e.value != "") {
                                    $("#coverModal [name=" + e.name + "]").parent().show();
                                };
                                break;
                        }
                    })
                    break;
                case "指定范围截屏":
                    thisNodeInfo.parameters.forEach(e => {
                        switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                            case "radio":
                                // $("#coverModal [name=" + e.name + "]")
                                break;
                            case "checkbox":
                                if (e.value == "on") $("#coverModal [name=" + e.name + "]").attr('checked', 'true');
                                if (e.name == "isSaveHistory" && e.value == "true") {
                                    $("#coverModal div.save-history").show();
                                }
                                break;
                            default:
                                $("#coverModal [name=" + e.name + "]").val(e.value);
                                if (e.value != "") {
                                    $("#coverModal [name=" + e.name + "]").parent().show();
                                };
                                break;
                        }
                    })
                    break;
                default:
                    $('#coverModal input[type="checkbox"]').prop('checked', false);
                    thisNodeInfo.parameters.forEach(e => {
                        if (typeof e.name == 'undefined' || e.name == '') {

                        } else {

                            switch ($("#coverModal [name=" + e.name + "]").attr("type")) {
                                case "radio":

                                    break;
                                case "checkbox":
                                    if (e.value == "on" || e.value == true || e.value == 'true') {
                                        $("#coverModal [name=" + e.name + "]").attr('checked', true);
                                        $("#coverModal [name=" + e.name + "]").prop('checked', true);
                                    } else {
                                        $("#coverModal [name=" + e.name + "]").attr('checked', false);
                                        $("#coverModal [name=" + e.name + "]").prop('checked', false);
                                    }
                                    break;
                                default:
                                    $("#coverModal [name=" + e.name + "]").val(e.value)
                                    break;
                            }
                        }
                    });
                    break;

            }
            if ($('#coverModal .goon input').length > 0) {
                $('#coverModal .goon input').eq(0).attr('checked', true);
                $('#coverModal .goon input').eq(0).prop('checked', true);
            }

            if (thisNodeInfo.type !== 'catch_result' && thisNodeInfo.radio.length > 0) {
                thisNodeInfo.radio.forEach(function (el, index) {
                    $("#coverModal input[name='" + el.name + "']").each(function () {
                        if ($(this).parent().text().trim() == el.value.trim() || $(this).val().trim() == el.value.trim()) {
                            $(this).attr("checked", "checked");
                        }
                    })
                })
            }
            if (typeof thisNodeInfo.checkbox != "undefined" && thisNodeInfo.checkbox.length > 0) {
                thisNodeInfo.checkbox.forEach(function (el, index) {
                    $("#coverModal input[name='" + el.name + "']").each(function () {
                        if ($(this).parent().text().trim() == el.value.trim() || $(this).val().trim() == el.value.trim()) {
                            $(this).attr("checked", true);
                            $(this).prop("checked", true);
                        }
                    })
                })
            }
            if (typeof thisNodeInfo.readonlyInput != "undefined" && thisNodeInfo.readonlyInput.length > 0) {
                thisNodeInfo.readonlyInput.forEach(function (el, index) {
                    $("#coverModal input[name='" + el.name + "']").attr("readonly", "readonly");
                    $("#coverModal input[name='" + el.name + "']").css("background", "rgb(204, 204, 204)");
                    $("#coverModal input[name='" + el.name + "']").siblings('.toggleType').css('display', 'inline');
                    $("#coverModal input[name='" + el.name + "']").siblings('.parameters').css('display', 'none');
                })
            }

            switch ($(event.target).text()) {
                case "返回全局变量":
                    newLI({
                        onlyPart: true,
                        isTryCatch: isTryCatch
                    });
                    break;
                default:
                    newLI({
                        isTryCatch: isTryCatch
                    });
                    break;
            }
        })
        // newLI($(this).parent());

    });

    $(".pretreatment-box .pretreatment-tit").click(function (event) {
        event.stopPropagation();
        $(".liucheng-item-selected").removeClass("liucheng-item-selected");
        $(this).parent().addClass("liucheng-item-selected")
    });

    let pretreatmentWidth = 240;
    $(".icon-pretreatment-unfold").click(function (event) {
        pretreatmentWidth = $(".pretreatment-box").width();
        $(".pretreatment-box").css("min-width", "0px");
        $(".pretreatment-box").css("width", "0px");
        $(".liucheng-box .liucheng-list").css("margin-left", 55 + "px");
    });

    $(".icon-pretreatment-pack-up").click(function (event) {
        $(".pretreatment-box").show();
        $(this).css("width", "0px");
    });

    $(".icon-pretreatment-pack-up").on("transitionend webkitTransitionEnd", function () {

        if ($(this).width() > 0) {

        } else {
            if (pretreatmentWidth <= 240) {
                $(".pretreatment-box").css("width", "240px");
                $(".liucheng-box .liucheng-list").css("margin-left", 240 + 20 + "px");
            } else {
                $(".pretreatment-box").css("width", "auto");
                $(".liucheng-box .liucheng-list").css("margin-left", pretreatmentWidth + 20 + "px");
            }
        }
    });

    $(".pretreatment-box").on("transitionend webkitTransitionEnd", function () {
        if ($(this).width() > 0) {
            $(this).css("min-width", "240px");
            // $(".icon-pretreatment-pack-up").css("width", "35px");
            // $(".icon-pretreatment-unfold").css("display", "none");
        } else {
            $(".pretreatment-box").hide();
            $(".icon-pretreatment-pack-up").css("width", "35px");
            // $(this).css("display", "none");
            // $(".icon-pretreatment-unfold").css("display", "block");
        }
    });

    //滚动条事件
    $(".main-right").scroll(function () {
        $(".pretreatment-box").css("top", $(this).scrollTop());
        $(".pretreatment-box").css("left", $(this).scrollLeft())
    });

    //单个节点的异常捕获
    $(".detail-liucheng-lists-box").on("click", "a.single-try-start", function (event) {
        let currentLiId = $(this).parents("li").eq(0).attr("id");
        let currentMateId = $(this).parents("ul.liucheng-list").eq(0).attr("id");
        console.log("singleNodeCreateTry");
        myEmitter.emit("singleNodeCreateTry", currentLiId, currentMateId)
    });
    //单个节点异常的修改编辑
    $(".detail-liucheng-lists-box").on("click", "a.single-try-edit", function (event) {
        let currentLiId = $(this).parents("li").eq(0).attr("id");
        let currentMateId = $(this).parents("ul.liucheng-list").eq(0).attr("id");
        console.log("singleNodeEditTry");
        myEmitter.emit("singleNodeEditTry", currentLiId, currentMateId)
    });
    //单个节点hover
    $(".detail-liucheng-lists-box").on("mouseover", "li.separate-icon", function () {
        let mateId = $(this).parents("ul.liucheng-list").not(".ab_module").length > 0 ? $(this).parents("ul.liucheng-list").not(".ab_module").attr("id").replace("secondList", "") : "";
        let thisId = $(this).attr("id");
        let tryId = "try" + mateId;
        if ($("#" + tryId).find(".abnormity-node[singleid='" + thisId + "']").length > 0) {
            $("#" + tryId).find(".abnormity-node[singleid='" + thisId + "']").find(".abnormity-node-top").find(">span").addClass("highlight-font");
        }
    });
    $(".detail-liucheng-lists-box").on("mouseout", "li.separate-icon", function () {
        let mateId = $(this).parents("ul.liucheng-list").not(".ab_module").length > 0 ? $(this).parents("ul.liucheng-list").not(".ab_module").attr("id").replace("secondList", "") : "";
        let thisId = $(this).attr("id");
        let tryId = "try" + mateId;
        if ($("#" + tryId).find(".abnormity-node[singleid='" + thisId + "']").length > 0) {
            $("#" + tryId).find(".abnormity-node[singleid='" + thisId + "']").find(".abnormity-node-top").find(">span").removeClass("highlight-font");
        }
    })

});