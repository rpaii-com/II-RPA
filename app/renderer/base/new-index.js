$(document).ready(function () {
    let tipsType = "";
    let layerIndex;//layer的index
    //二级流程id前缀
    let secondListIdPrev = "secondList";
    // let utilsHtml = '<div class="liucheng-item-utils"><i class="liucheng-item-util-add"></i><i class="liucheng-item-util-remove"></i><i class="liucheng-item-util-default"></i></div>';
    //设置预处理id
    let tempDate = new Date().getTime();
    //需要加1，不然和tempDate值一样
    let finallyTime = new Date().getTime() + 1;

    //初始进应用，预处理展开
    $(".left-menu >li").css("cssText", "display:none!important");
    $(".left-menu >li").eq(0).css("cssText", "display:block");
    $("#leftMenu .search-menu-box").hide();
    //初始化预处理的元流程
    $(".main-liucheng-list").find("li.main-liucheng-pretreatment").eq(0).attr("id", tempDate);
    $(".detail-liucheng-lists-box").find("ul.detail-liucheng-pretreatment").eq(0).attr("id", secondListIdPrev + tempDate);
    //初始化finally节点
    $(".main-liucheng-list").find("li.main-liucheng-finally").attr("id", finallyTime);
    $(".detail-liucheng-lists-box").find(".detail-liucheng-finally").eq(0).attr("id", secondListIdPrev + finallyTime);
    $(".detail-liucheng-lists-box").append('<div id="try' + finallyTime + '" class="abnormity"></div>');
    ctx.set("detailPretreatmentList", []);
    ctx.set("secondList" + finallyTime, []);
    ctx.set(finallyTime, { type: "finally", parameters: [{ name: "finallyName", value: "结束节点" }] })
    //左边按钮-业务块
    $("#left_btn_ywk").click(function () {
        // console.log($(this));
        tipsType = "left_btn_ywk";
        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            shadeClose: false,
            area: ['400px', '250px'],
            skin: 'layer-ext-professional-modal',
            content: $("#main-tips-cover-box .cover-alert").html(),
            btn: ['确认', '关闭'],
            btnAlign: 'c',
            yes: addNewMainItem,
            no: closeLayer
        });
    });
    //左边按钮-列表循环
    $("#left_btn_lbxh").click(function () {
        tipsType = "left_btn_lbxh";
        let globalParam = ctx.get("detailPretreatmentList");
        let ulHtml = '';
        let isSelectHasParant = $(".main-liucheng-list .main-item-select").parents(".this_for,.li-branch-if,this_concurrence").length > 0 ? true : false;
        if (isSelectHasParant) {
            return;
        }
        if (typeof globalParam != "undefined") {
            globalParam.forEach((item, index) => {
                ulHtml += '<li>' + item.name + '</li>';
            });
        }
        $("#main-for-tips-cover-box #for_professional_dec").text("");
        $("#main-for-tips-cover-box .cover-alert").find("ul.parameters-can-select").html(ulHtml);
        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            shadeClose: false,
            area: ['400px', '450px'],
            skin: 'layer-ext-professional-modal',
            content: $("#main-for-tips-cover-box .cover-alert").html(),
            btn: ['确认', '关闭'],
            btnAlign: 'c',
            yes: addNewMainItem,
            no: closeLayer
        });
    });
    //左边按钮-迭代循环
    $("#left_btn_ddxh").click(function () {
        tipsType = "left_btn_ddxh";
    });
    //左边按钮-条件判断
    $("#left_btn_tjpd").click(function () {
        let isSelectHasParant = $(".main-liucheng-list .main-item-select").parents(".this_for,.li-branch-if,this_concurrence").length > 0 ? true : false;
        if (isSelectHasParant) {
            return;
        }
        tipsType = "left_btn_tjpd";
        let globalParam = ctx.get("detailPretreatmentList");
        let ulHtml = '';
        if (typeof globalParam != "undefined") {
            globalParam.forEach((item, index) => {
                ulHtml += '<li>' + item.name + '</li>';
            });
        }
        $("#main-if-tips-cover-box #if_professional_dec").text("");
        $("#main-if-tips-cover-box .cover-alert").find("ul.parameters-can-select").html(ulHtml);
        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            shadeClose: false,
            area: ['400px', '400px'],
            skin: 'layer-ext-professional-modal',
            content: $("#main-if-tips-cover-box .cover-alert").html(),
            btn: ['确认', '关闭'],
            btnAlign: 'c',
            yes: addNewMainItem,
            no: closeLayer
        });
    });
    //左边按钮-异常捕获
    $("#left_btn_ycbh").click(function () {
        tipsType = "left_btn_ycbh";
    });
    //左边按钮-并发处理
    $("#left_btn_bfcl").click(function () {
        let isSelectHasParant = $(".main-liucheng-list .main-item-select").parents(".this_for,.li-branch-if,this_concurrence").length > 0 ? true : false;
        if (isSelectHasParant) {
            return;
        }
        tipsType = "left_btn_bfcl";
        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            shadeClose: false,
            area: ['400px', '250px'],
            skin: 'layer-ext-professional-modal',
            content: $("#main-tips-cover-box .cover-alert").html(),
            btn: ['确认', '关闭'],
            btnAlign: 'c',
            yes: addNewMainItem,
            no: closeLayer
        });
    });
    $(".layer-ext-professional-modal .cover-box-foot .btn-cancel").click(function () {
        layer.close(layerIndex);
    });

    //utils点击事件
    $(".main-liucheng-list");
    //主流程点击切换显示二级流程
    $(".main-liucheng-list").on("click", "li", function (ev) {
        // console.time("start切换");
        ev.stopPropagation();
        // console.time("start开始");
        if ($(this).hasClass("this_for")) {
            return;
        }
        let $this = $(this);
        let isThisHasId = typeof $(this).attr("id") != "undefined" ? true : false;
        let thisId = $(this).attr("id");
        // console.timeEnd("start开始");
        if ($(this).hasClass("main-liucheng-item")) {
            $(this).parents(".main-liucheng-list").find(".main-item-select").removeClass("main-item-select");
            $(this).addClass("main-item-select");
        }
        if (isThisHasId && $("#" + secondListIdPrev + thisId).length > 0) {
            $(".detail-liucheng-box .detail-liucheng-lists-box >ul").removeClass("current-show-list").hide();
            $(".detail-liucheng-box .detail-liucheng-lists-box >ul.breviary-list").removeClass("breviary-list");
            $("#" + secondListIdPrev + thisId).addClass("current-show-list").show();

            // refreshPartParamList(secondListIdPrev + thisId);
            if (!nowIsDebugger) {
                myEmitter.emit("refreshParameters", "part", secondListIdPrev + thisId);
            }
            if ($("#" + secondListIdPrev + thisId).hasClass("detail-liucheng-pretreatment")) {
                $(".left-menu >li").css("cssText", "display:none!important");
                // $(".left-menu >li >ul.child-menu").css("display", "none !important");
                $(".left-menu >li").eq(0).css("cssText", "display:block");
                $("#leftMenu .search-menu-box").hide();
                // $(".left-menu >li").eq(0).click();
                if ($(".left-menu >li").eq(0).hasClass("on")) {

                } else {
                    $(".left-menu >li").eq(0).click();
                }
            } else {
                $(".left-menu >li").css("cssText", "display:block");
                $(".left-menu >li").eq(0).css("cssText", "display:none!important");
                $("#leftMenu .search-menu-box").show();
            }
            $(".detail-liucheng-lists-box >.abnormity").hide();
            $("#try" + thisId).show();
            myEmitter.emit('mainLiuchengCut',"secondList"+thisId)
        } else if (!isThisHasId && $(this).find(">span").length > 0 && $(this).find(">span").text() == "" && $(this).hasClass("main-liucheng-item")) {
            layer.open({
                type: 1,
                title: false,
                closeBtn: 1,
                shadeClose: false,
                area: ['400px', '250px'],
                skin: 'layer-ext-professional-modal',
                content: $("#main-tips-cover-box .cover-alert").html(),
                btn: ['确认', '关闭'],
                btnAlign: 'c',
                yes: function (index, layero) {
                    let tempDate = new Date().getTime();
                    $this.attr("id", tempDate);
                    let inputText = $(layero[0]).find("textarea").val();
                    $this.find(">span").text(inputText);
                    let adn_html = "<div id='try" + tempDate + "' class='abnormity'></div>";
                    layer.close(index);
                    $(".detail-liucheng-box .detail-liucheng-lists-box >ul").removeClass("current-show-list").hide();
                    $(".detail-liucheng-box .detail-liucheng-lists-box").append("<ul id=" + secondListIdPrev + tempDate + " class='liucheng-list current-show-list'></ul>" + adn_html);
                    $("#" + secondListIdPrev + tempDate).show();
                    $(".detail-liucheng-lists-box >.abnormity").hide();
                    $("#try" + tempDate).show();
                    let tempObj = {};
                    let jsonArray = $(layero[0]).find("form").serializeArray();
                    tempObj.parameters = jsonArray;
                    tempObj.type = "MetaWorkflow";
                    // let tempId = $this.attr("id");
                    ctx.set(tempDate, tempObj);
                    myEmitter.emit("refreshParameters", "part", secondListIdPrev + tempDate);
                    if ($("#" + secondListIdPrev + tempDate).hasClass("detail-liucheng-pretreatment")) {
                        $(".left-menu >li").css("cssText", "display:none!important");
                        // $(".left-menu >li >ul.child-menu").css("display", "none !important");
                        $(".left-menu >li").eq(0).css("cssText", "display:block");
                        $("#leftMenu .search-menu-box").hide();
                        // $(".left-menu >li").eq(0).click();
                        if ($(".left-menu >li").eq(0).hasClass("on")) {

                        } else {
                            $(".left-menu >li").eq(0).click();
                        }
                    } else {
                        $(".left-menu >li").css("cssText", "display:block");
                        $(".left-menu >li").eq(0).css("cssText", "display:none!important");
                        $("#leftMenu .search-menu-box").show();
                    }
                    myEmitter.emit('mainLiuchengCut',"secondList"+tempDate)
                },
                no: closeLayer
            });
        }
        // myEmitter.emit('mainLiuchengCut')
        // console.timeEnd("start切换");
    });
    $(".main-liucheng-list").on("dblclick", "li.main-liucheng-item", function () {
        let tempDec = $(this).find("span.title").text();
        let $this = $(this);
        $("#main-tips-cover-box .cover-alert").find("textarea#professional_dec").text("");
        $("#main-tips-cover-box .cover-alert").find("textarea#professional_dec").text(tempDec);
        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            shadeClose: false,
            area: ['400px', '250px'],
            skin: 'layer-ext-professional-modal',
            content: $("#main-tips-cover-box .cover-alert").html(),
            btn: ['确认', '关闭'],
            btnAlign: 'c',
            yes: function (index, layero) {
                let inputText = $(layero[0]).find("textarea").val();
                if (inputText == "") {
                    return;
                }
                let tempObj = {};
                let jsonArray = $(layero[0]).find("form").serializeArray();
                tempObj.parameters = jsonArray;
                tempObj.type = "MetaWorkflow";
                let tempId = $this.attr("id");
                ctx.set(tempId, tempObj);
                $this.find("span.title").text(inputText);
                $this.find("span.title").attr("title", inputText);
                layer.close(index);
                $(".main-liucheng-item").removeClass("main-item-select");
                $this.addClass("main-item-select");
                myEmitter.emit("refreshParameters", "global");
            },
            no: closeLayer
        });
        $("#main-tips-cover-box .cover-alert").find("textarea#professional_dec").text("");
    });
    //主流程的下拉选择 --li点击
    $(document).on("click", "div.layer-ext-professional-modal li", function () {
        let tempStr = $(this).text();
        if ($(this).parent().hasClass("parameters-can-select")) {
            tempStr = "@" + $(this).text();
        }
        $(this).parent().parent().find("input").val(tempStr);
        $(this).parent().hide();
    });

    //点击输入框显示可选变量列表
    $(document).on("click", "div.layer-ext-professional-modal input", function () {
        if ($(this).parent().find("ul").length > 0) {
            $(this).parent().find("ul").toggle();
        }
    });

    //显示主流程弹窗可选变量列表
    $(document).on("click", "div.layer-ext-professional-modal i.parameters", function () {
        $(this).parent().find("ul").toggle()
    });
    $(document).on("click", "div.layer-ext-professional-modal i.if-else-item-xia", function () {
        $(this).parent().find("ul").toggle()
    });

    //双击打开编辑已有for循环条件
    $(document).on("dblclick", "div.for-condition", function () {
        let targetId = $(this).parents(".this_for").eq(0).attr("id");
        let paramInfo = ctx.get(targetId);
        paramInfo.parameters.forEach((item, index) => {
            let dom = $("#main-for-tips-cover-box").find("[name=" + item.name + "]");
            let tempItem = item;
            if (dom[0].localName == "input") {
                setTimeout(function () {
                    $(".layer-ext-professional-modal").find("[name=" + tempItem.name + "]").val(tempItem.value);
                    let globalParam = ctx.get("detailPretreatmentList");
                    let ulHtml = '';
                    if (typeof globalParam != "undefined") {
                        globalParam.forEach((item, index) => {
                            ulHtml += '<li>' + item.name + '</li>';
                        });
                    }
                    $(".layer-ext-professional-modal").find("ul.parameters-can-select").html(ulHtml);
                    // dom.val(tempItem.value)
                }, 0);
                dom.val('');
                dom.val(tempItem.value)
            } else {
                dom.text('');
                dom.text(tempItem.value)
            }
        });

        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            shadeClose: false,
            area: ['400px', '450px'],
            skin: 'layer-ext-professional-modal',
            content: $("#main-for-tips-cover-box .cover-alert").html(),
            btn: ['确认', '关闭'],
            btnAlign: 'c',
            yes: function (index, layero) {
                let inputText = $(layero[0]).find("textarea").val();
                if (inputText == "") {
                    return;
                }
                layer.close(index);
                // $(".main-liucheng-item").removeClass("main-item-select");
                // $this.addClass("main-item-select");
                let tempObj = ctx.get(targetId);
                let jsonArray = $(layero[0]).find("form").serializeArray();
                tempObj.parameters = jsonArray;
                ctx.set(targetId, tempObj);
                $("#" + targetId).find(">.for-condition").html('<i class="icon-main-liucheng-item icon-main-item-lbxh"></i>' + inputText);
                $("#main-for-tips-cover-box").find("textarea").text("");
            },
            no: closeLayer
        });
    });

    //双击打开编辑已有if条件判断条件
    $(document).on("dblclick", "li.branch-if", function () {
        let targetId = $(this).parents(".li-branch-if").eq(0).attr("id");
        let paramInfo = ctx.get(targetId);
        paramInfo.parameters.forEach((item, index) => {
            let dom = $("#main-if-tips-cover-box").find("[name=" + item.name + "]");
            let tempItem = item;
            if (dom[0].localName == "input") {
                setTimeout(function () {
                    $(".layer-ext-professional-modal").find("[name=" + tempItem.name + "]").val(tempItem.value);
                    // dom.val(tempItem.value)
                    let globalParam = ctx.get("detailPretreatmentList");
                    let ulHtml = '';
                    if (typeof globalParam != "undefined") {
                        globalParam.forEach((item, index) => {
                            ulHtml += '<li>' + item.name + '</li>';
                        });
                    }
                    $(".layer-ext-professional-modal").find("ul.parameters-can-select").html(ulHtml);
                }, 0);
                dom.val('');
                dom.val(tempItem.value)
            } else {
                dom.text('');
                dom.text(tempItem.value)
            }
        });

        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            shadeClose: false,
            area: ['400px', '450px'],
            skin: 'layer-ext-professional-modal',
            content: $("#main-if-tips-cover-box .cover-alert").html(),
            btn: ['确认', '关闭'],
            btnAlign: 'c',
            yes: function (index, layero) {
                let inputText = $(layero[0]).find("textarea").val();
                if (inputText == "") {
                    return;
                }
                layer.close(index);
                // $(".main-liucheng-item").removeClass("main-item-select");
                // $this.addClass("main-item-select");
                let tempObj = ctx.get(targetId);
                let jsonArray = $(layero[0]).find("form").serializeArray();
                tempObj.parameters = jsonArray;
                ctx.set(targetId, tempObj);
                $("#main-if-tips-cover-box").find("textarea").text("");
            },
            no: closeLayer
        });
    });
    //添加新的主流程
    function addNewMainItem(index, layero) {
        let tempDate = new Date().getTime();
        let inputText = $(layero[0]).find("textarea").val();
        let trimText = inputText.trim();
        if (trimText == '') {
            return;
        }
        let isAppendSecondFlow = false;
        let isCanAppendToSelect = false;
        let appendHtml = '';
        let utilsHtml;
        switch (tipsType) {
            case "left_btn_lbxh":
                let inParam = $(layero[0]).find("input[name='objectList']").val();
                let outParam = $(layero[0]).find("input[name='rename']").val();
                utilsHtml = editMainItemUtils();
                appendHtml = '<li itemType="this_for" id=' + tempDate + ' class="this_for"><div class="for-condition"><i class="icon-main-liucheng-item icon-main-item-lbxh"></i>' + inputText + '</div><ul><li itemType="MetaWorkflow" class="main-liucheng-item for-liucheng-start"><i class="connecting"></i>' + utilsHtml + '<i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title"></span><i class="icon-for-start"></i><i class="icon-for-sanjiao"></i><i class="icon-right-h"></i><div class="parameter-botton"><label>出参：</label></div></li>';
                appendHtml += '<li itemType="MetaWorkflow" class="main-liucheng-item for-liucheng-end"><i class="connecting"></i>' + utilsHtml + '<i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title=></span><i class="icon-for-end"></i><i class="icon-right-h"></i><div class="parameter-botton"><label>出参：</label></div></li>';
                appendHtml += '</ul></li>';
                break;
            case "left_btn_tjpd":
                let leftParam = $(layero[0]).find("input[name='lid']").val();
                let midParam = $(layero[0]).find("input[name='op']").val();
                let rightParam = $(layero[0]).find("input[name='rid']").val();
                utilsHtml = editMainItemUtils(false, true);
                appendHtml = '<li id=' + tempDate + ' itemType="li-branch-if" class="li-branch li-branch-if"><div class="logic-box-off"></div><ul class="branch-container clear">';
                appendHtml += '<li class="branch-start"><div class="branch-start-top"></div><div class="exhibition"></div></li>';
                appendHtml += '<li class="branch-end"><div class="exhibition"></div></li><li class="branch-if"><span class="title">条件判断</span></li><li class="branch-way">';
                appendHtml += '<ul class="tunnel"><li itemType="MetaWorkflow" class="point main-liucheng-item main-item-select">' + utilsHtml + '<i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title"></span><div class="parameter-botton"><label>出参：</label></div></li>';
                appendHtml += '<li class="long-string"></li></ul></li><li class="branch-way"><ul class="tunnel"><li itemType="MetaWorkflow" class="point main-liucheng-item">' + utilsHtml + '<i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title></span><div class="parameter-botton"><label>出参：</label></div></li>';
                appendHtml += '<li class="long-string"></li></ul></li></ul></li><br>';
                break;
            case "left_btn_bfcl":
                utilsHtml = editMainItemUtils(true, true);
                appendHtml = '<li id=' + tempDate + ' itemType="concurrence" class="li-branch this_concurrence"><div class="concurrence-condition"></div><div class="logic-box-off"></div><ul class="branch-container clear"><li class="branch-start"><div class="branch-start-top"></div>';
                appendHtml += '<div class="exhibition"></div></li><li class="branch-end"><div class="exhibition"></div></li><li class="branch-way"><ul class="tunnel">';
                appendHtml += '<li itemType="MetaWorkflow" class="point main-liucheng-item main-item-select">' + utilsHtml + '<i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title"></span><div class="parameter-botton"><label>出参：</label></div></li>';
                appendHtml += '<li class="long-string"></li></ul></li><li class="branch-way"><ul class="tunnel"><li itemType="MetaWorkflow" class="point main-liucheng-item">' + utilsHtml + '<i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title></span><div class="parameter-botton"><label>出参：</label></div></li><li class="long-string"></li>';
                appendHtml += '</ul></li></ul></li><br>';
                break;
            default:
                utilsHtml = editMainItemUtils();
                appendHtml = '<li itemType="MetaWorkflow" id=' + tempDate + ' class="main-liucheng-item"><i class="connecting"></i><i class="set_linellae"></i><i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title=' + inputText + '>' + inputText + '</span>' + utilsHtml + '<div class="parameter-botton"><label>出参：</label></div></li>';
                isAppendSecondFlow = true;
                isCanAppendToSelect = true;
                break;
        }
        if (true) {
            if ($(".main-liucheng-item.main-item-select").not(".main-liucheng-finally").length > 0) {
                if ($(".main-liucheng-item.main-item-select").eq(0).attr("itemtype") == "pretreatment") {
                    $(".main-liucheng-item.main-item-select").eq(0).after(appendHtml);
                }
                if ($(".main-liucheng-item.main-item-select").eq(0).attr("itemtype") == "MetaWorkflow" && $(".main-liucheng-item.main-item-select").eq(0).parent().hasClass("main-liucheng-list")) {
                    $(".main-liucheng-item.main-item-select").eq(0).after(appendHtml);
                }
                if ($(".main-liucheng-item.main-item-select").eq(0).attr("itemtype") == "MetaWorkflow" && $(".main-liucheng-item.main-item-select").eq(0).parents("li.this_for").eq(0).length > 0) {
                    if ($(".main-liucheng-item.main-item-select").eq(0).hasClass("for-liucheng-end")) {
                        $(".main-liucheng-item.main-item-select").eq(0).parents(".this_for").eq(0).after(appendHtml);
                    } else {
                        $(".main-liucheng-item.main-item-select").eq(0).after(appendHtml);
                    }
                }
            } else {
                $(".main-liucheng-box .main-liucheng-list .main-liucheng-finally").before(appendHtml);
            }
        } else {
            $(".main-liucheng-box .main-liucheng-list .main-liucheng-finally").before(appendHtml);
        }
        let jsonArray = $(layero[0]).find("form").serializeArray();
        let tempObj = {};
        let isPrevCurrentListPretreatment = false;
        tempObj.type = tipsType;
        tempObj.parameters = jsonArray;
        layer.close(index);
        if ($(".liucheng-list.current-show-list").hasClass("detail-liucheng-pretreatment")) {
            // $("#" + tempDate).click();
            isPrevCurrentListPretreatment = true;
        }
        let adn_html = "<div id='try" + tempDate + "' class='abnormity'></div>";
        if (isAppendSecondFlow) {
            $(".detail-liucheng-box .detail-liucheng-lists-box >ul").removeClass("current-show-list").hide();
            $(".detail-liucheng-box .detail-liucheng-lists-box").append("<ul id=" + secondListIdPrev + tempDate + " class='liucheng-list current-show-list'></ul>" + adn_html);
            $(".main-liucheng-item").removeClass("main-item-select");
            $("#" + tempDate).addClass("main-item-select");
            myEmitter.emit("refreshParameters", "part", secondListIdPrev + tempDate);
        }
        ctx.set(tempDate, tempObj);
        if (isPrevCurrentListPretreatment) {
            $("#" + tempDate).click();
        }
    };
    //编辑主流程的描述
    function editMainItemDec(index, layero, $this) {
        let inputText = $(layero[0]).find("textarea").val();
        $this.find("span.title").text(inputText);
        $this.find("span.title").attr("title", inputText);
        layer.close(index);
        $(".main-liucheng-item").removeClass("main-item-select");
        $this.addClass("main-item-select");
    };
    //关闭弹窗
    function closeLayer(index) {
        layer.close(index);
    };
    //新建流程时填写流程信息
    function writeMainItemDec() { }
    //点击显示二级流程
    function showThisSecondFlow() { }
    //添加新增主节点
    function appendMainItemHtml(tipsType) {

    };
    //编辑主流程utils的Html
    function editMainItemUtils(addLine = false, addAfter = false) {
        let utilsHtml = '<div class="liucheng-item-utils">';
        if (addLine) {
            utilsHtml += '<i class="liucheng-item-util-add"></i>';
        }
        utilsHtml += '<i class="liucheng-item-util-remove"></i>';
        if (addAfter) {
            utilsHtml += '<i class="liucheng-item-util-default"></i>';
        }
        utilsHtml += '</div >';
        return utilsHtml;
    }



    //变量显示按钮的hover
    $(".description-btn").on("mousemove", function () {
        $(".description-box").css({ height: "100%" });
    });
    //变量显示的mouseout消失
    $(".description-box").on("mouseleave", function () {
        if ($(this).attr("isClick") == 1) {
            return;
        } else {
            $(this).css("height", 0);
        }
    })

    //点击变量显示mouseout不消失
    $(".description-box").on("click", function (e) {
        e.stopPropagation();
        $(this).attr("isClick", 1);
        // return false;
    });

    //取消变量显示的isClick
    $(".liucheng-box").on("click", function (e) {
        // e.stopPropagation();
        if (!$(this).hasClass("description-box") && !($(this).parents(".description-box").length > 0)) {
            $(".description-box").attr("isClick", 0);
            // alert(1)
            $(".description-box").css("height", 0)
        }
        // $(".description-box").css("height", 0)
    });

    //取消主流程选中状态
    $(".main-liucheng-list").on("click", function (e) {
        if ($(e.target).hasClass("main-liucheng-item")) {

        } else {
            $(".main-liucheng-list").find(".main-item-select").removeClass("main-item-select");
        }
    })
});


