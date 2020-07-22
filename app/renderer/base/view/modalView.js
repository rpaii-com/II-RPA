$(function(){
    $(".cover-alert").on("change", "[type='checkbox']", function () {
        if (!$(this).is(':checked')) {
            console.log(typeof $(this).prev().attr("type") !== "undefined" && $(this).prev().attr("type") === "hidden")
            if (typeof $(this).prev().attr("type") !== "undefined" && $(this).prev().attr("type") === "hidden") {
                $(this).prev().val(false)
            } else {
                $(this).before("<input type='hidden' name='" + $(this).attr("name") + "' value='false'>")
            }
        }
    })
    $(".cover-alert").on("click", "li", function () {
        if ($(this).parent().hasClass("options-list")) {
            let thisText = $(this).text();
            $(this).siblings().data("haschoiced", 0);
            $(this).data("haschoiced", 1);
            $(this).parent().parent().find("input").not("input[type='hidden']").eq(0).val(thisText);
            $(this).parent().hide();
        } else if ($(this).parent("ul.common-list").length > 0 && !$(this).parent("ul.common-list").hasClass("parameters-can-select")) {
            let thisText = $(this).text();
            if ($(this).parent("ul.common-list").hasClass("catch-type-list")) {
                $(this).parent().parent().find("input").not("input[type='hidden']").eq(0).val($(this).attr("catchtype"));
            } else {
                $(this).parent().parent().find("input").not("input[type='hidden']").eq(0).val(thisText);
            }
            $(this).parent().parent().find("input").not("input[type='hidden']").eq(0).attr("index", ($(this).index()));
            $(this).parent().parent().find("input").not("input[type='hidden']").eq(0).trigger("change")
            $(this).parent().hide();
        }
        if ($(this).parent("ul.common-list").parent().find("#save-liucheng-type").length > 0) {
            $(this).parent("ul.common-list").parent().find("#save-liucheng-type").attr("typeid", $(this).attr("typeid"))
        }
    })
    $(".cover-box ").on("click", ".CScaptureNew", function () {
        let isError = false;
        let modelType = $(this).parents(".cover-box-main").find("input[type='hidden'].item-type").attr("name").toString().trim();
        let loadingBoxStartText = '';
        let loadingBoxEndText = '正在等待工具变量返回';
        switch (modelType) {
            // case "mouseRoll":
            //     loadingBoxStartText = "等待工具打开，在目标程序中进行鼠标滚动"
            //     break;
            default: loadingBoxStartText = "正在打开工具";
                break;
        }
        loadingBox.start();
        loadingBox.setMsg(loadingBoxStartText)
        const exec = require('child_process').exec;
        const path = require('path')
        let timeOut = setTimeout(() => {
            loadingBox.setMsg(loadingBoxEndText)
        }, 1000);
        exec(sysPath.CShandle + '/uispy.exe -m newui', { encoding: 'binary' }, function (err, stdout, stderr) {
            if (err) {
                clearTimeout(timeOut);
                loadingBox.setMsg("启动桌面工具失败！")
                loadingBox.end();
                layer.msg('启动桌面工具失败！', {
                    icon: 2,
                    title: "提示",
                    btn: ['确定'], //按钮
                    end: function (index) { },
                });
                return;
            } else {
                try {
                    let result = JSON.parse(iconv.decode(new Buffer(stdout, 'binary'), 'GBK'));
                    for (let i in result) {
                        if (result[i] === "") {
                            continue;
                        }
                        $(".cover-box [name='" + i + "']").val(result[i]);
                    }
                    loadingBox.end();
                } catch (e) {
                    console.log(e);
                    loadingBox.end();
                    layer.msg('回传数据有误！', {
                        icon: 2,
                        title: "提示",
                        btn: ['确定'], //按钮
                        end: function (index) { },
                    });
                }
            }
        })


    })
    $(".cover-box ").on("click", ".CScapture", function () {
        let isError = false;
        let modelType = $(this).parents(".cover-box-main").find("input[type='hidden'].item-type").attr("name").toString().trim();
        let loadingBoxStartText = '';
        let loadingBoxEndText = '正在等待工具变量返回';
        switch (modelType) {
            // case "mouseRoll":
            //     loadingBoxStartText = "等待工具打开，在目标程序中进行鼠标滚动"
            //     break;
            default: loadingBoxStartText = "正在打开工具";
                break;
        }
        loadingBox.start();
        loadingBox.setMsg(loadingBoxStartText)
        const exec = require('child_process').exec;
        const path = require('path')
        let timeOut = setTimeout(() => {
            loadingBox.setMsg(loadingBoxEndText)
        }, 1000);
        exec(sysPath.CShandle + '/uispy.exe', { encoding: 'binary' }, function (err, stdout, stderr) {
            if (err) {
                clearTimeout(timeOut);
                loadingBox.setMsg("启动桌面工具失败！")
                loadingBox.end();
                layer.msg('启动桌面工具失败！', {
                    icon: 2,
                    title: "提示",
                    btn: ['确定'], //按钮
                    end: function (index) { },
                });
                return;
            } else {
                try {
                    let result = JSON.parse(iconv.decode(new Buffer(stdout, 'binary'), 'GBK'));
                    for (let i in result) {
                        if (result[i] === "") {
                            continue;
                        }
                        if (i == "rectangle" && result[i] != null) {
                            let te = result[i].split(",");
                            let x = parseFloat(te[2]) / 2 + parseFloat(te[0]);
                            let y = parseFloat(te[3]) / 2 + parseFloat(te[1]);
                            let temp = x + "," + y
                            $(".cover-box [name='rectangle']").val(temp);

                        } else if (i == "position" && result[i] != null) {
                            $(".cover-box [name='" + i + "']").val(result[i]);
                            $(".cover-box [name='rectangle']").val(result[i]);
                        } else if (result[i] == true) {
                            $(".cover-box [name='" + i + "']").attr("checked", true);
                        } else if (result[i] == false) {
                            $(".cover-box [name='" + i + "']").removeAttr('checked');
                        } else {
                            $(".cover-box [name='" + i + "']").val(result[i]);
                        }
                    }
                    loadingBox.end();
                } catch (e) {
                    console.log(e);
                    loadingBox.end();
                    layer.msg('回传数据有误！', {
                        icon: 2,
                        title: "提示",
                        btn: ['确定'], //按钮
                        end: function (index) { },
                    });
                }
            }
        })


    })
    $(".cover-box ").on("click", ".CScapturePos", function () {
        let isError = false;
        let modelType = $(this).parents(".cover-box-main").find("input[type='hidden'].item-type").attr("name").toString().trim();
        let loadingBoxStartText = '';
        let loadingBoxEndText = '正在等待工具变量返回';
        switch (modelType) {
            // case "mouseRoll":
            //     loadingBoxStartText = "等待工具打开，在目标程序中进行鼠标滚动"
            //     break;
            default: loadingBoxStartText = "正在打开工具";
                break;
        }
        loadingBox.start();
        loadingBox.setMsg(loadingBoxStartText)
        const exec = require('child_process').exec;
        const path = require('path')
        let timeOut = setTimeout(() => {
            loadingBox.setMsg(loadingBoxEndText)
        }, 1000);
        exec(sysPath.CShandle + '/uispy.exe -m po', { encoding: 'binary' }, function (err, stdout, stderr) {
            if (err) {
                clearTimeout(timeOut);
                loadingBox.setMsg("启动桌面工具失败！")
                loadingBox.end();
                layer.msg('启动桌面工具失败！', {
                    icon: 2,
                    title: "提示",
                    btn: ['确定'], //按钮
                    end: function (index) { },
                });
                return;
            } else {
                try {
                    let result = JSON.parse(iconv.decode(new Buffer(stdout, 'binary'), 'GBK'));
                    for (let i in result) {
                        if (result[i] === "") {
                            continue;
                        }
                        if (i == "rectangle" && result[i] != null) {
                            let te = result[i].split(",");
                            let x = parseFloat(te[2]) / 2 + parseFloat(te[0]);
                            let y = parseFloat(te[3]) / 2 + parseFloat(te[1]);
                            let temp = x + "," + y
                            $(".cover-box [name='rectangle']").val(temp);

                        } else if (i == "position" && result[i] != null) {
                            $(".cover-box [name='" + i + "']").val(result[i]);
                            $(".cover-box [name='rectangle']").val(result[i]);
                        } else if (result[i] == true) {
                            $(".cover-box [name='" + i + "']").attr("checked", true);
                        } else if (result[i] == false) {
                            $(".cover-box [name='" + i + "']").removeAttr('checked');
                        } else {
                            $(".cover-box [name='" + i + "']").val(result[i]);
                        }
                    }
                    loadingBox.end();
                } catch (e) {
                    console.log(e);
                    loadingBox.end();
                    layer.msg('回传数据有误！', {
                        icon: 2,
                        title: "提示",
                        btn: ['确定'], //按钮
                        end: function (index) { },
                    });
                }
            }
        })
    })
    $(".cover-box").on("click", ".capture-iframe", function () {
        $(".tool >i").attr("class", "");
        if (modal.$data.editLiuchengItem.isEditExistedItem) {
            $("#" + modal.$data.editLiuchengItem.editItemId).find(">.node-main-box").find(">i")[0].classList.forEach(function (el, index) {
                if (el.indexOf("diy-icon-menu") > -1) {
                    $(".tool >i").addClass(el);
                }
            })
        } else {
            $(".tool >i").addClass(modal.$data.addLiuchengItem.newNodeLeftIconClass);
        }
        modelHeight = $(".cover-alert").height();
        $(".cover-box > .cover-alert").animate({
            height: "0px",
            width: "0px",
            top: "50px",
            left: "100%",
            opacity: '0',
        }, function () {
            $(".cover-box").animate({
                opacity: '0',
            }, 100, () => {
                $(".cover-box").hide();
                $(".tool").show();
                modal.postion = $(".tool").position()
            })
        });
        webview.insertCSS("*{cursor: pointer;}");
        once(webview, 'ipc-message', (event) => {
            event.stopPropagation();
            if (typeof (event.channel.single) == "undefined") {
                ctx.set(event.channel.id, event.channel.context);
            } else {
                $("body > .cover-box").show();
                $(".tool").hide();
                $("body > .cover-box > .cover-alert").css("height", "auto")
                modal.animateModal()
                webview.send("stop", "");
                webview.insertCSS("*{cursor: auto;}");
                let single = event.channel.single
                $("body > .cover-box [id='xpath']").val(single);
                if (typeof (event.channel.iframeSrc) != "undefined") {
                    $("body > .cover-box [id='xpath']").attr("iframesrc", event.channel.iframeSrc)
                }
            }
        });
        webview.send('iframe', "");
    });
    $(".cover-box").on("click", ".capturePos", function () {
        let mainR = $(".main-right");
        mainR.removeClass("toggle-height");
        mainR.addClass("toggle-fullPage");
        remote.getCurrentWindow().maximize();
        $(".tool >i").attr("class", "");
        if (modal.$data.editLiuchengItem.isEditExistedItem) {
            $("#" + modal.$data.editLiuchengItem.editItemId).find(">.node-main-box").find(">i")[0].classList.forEach(function (el, index) {
                if (el.indexOf("diy-icon-menu") > -1) {
                    $(".tool >i").addClass(el);
                }
            })
        } else {
            $(".tool >i").addClass(modal.$data.addLiuchengItem.newNodeLeftIconClass);
        }
        //$(".cover-box").hide();//隐去模态框
        modelHeight = $(".cover-alert").height();
        // $(".cover-alert").animate({
        $(".cover-box > .cover-alert").animate({
            height: "0px",
            width: "0px",
            top: "50px",
            left: "100%",
            opacity: '0',
        }, function () {
            $(".cover-box").animate({
                opacity: '0',
            }, 100, () => {
                $(".cover-box").hide();
                // $(".tool .title").html($(".cover-box .alert-tit").html())
                $(".tool").show();
                modal.postion = $(".tool").position()
            })

        });
        let x, y;
        $(document).on("mousemove", function (event) {
            x = event.clientX;
            y = event.clientY;
        })
        once(webview, 'ipc-message', (event) => {
            event.stopPropagation();
            if (typeof (event.channel.single) == "undefined") {
                ctx.set(event.channel.id, event.channel.context);
            } else {
                $("body > .cover-box").show();

                $(".tool").hide();
                $("body > .cover-box > .cover-alert").css("height", "auto")

                modal.animateModal()
                webview.send("stop", "");
                webview.insertCSS("*{cursor: auto;}");
                $("[name='elementPos']").val(x + "," + y);
            }
            mainR.removeClass("toggle-fullPage");
            if ($(".toggle-webview-box").hasClass("toggle-webview-selected")) {
                mainR.addClass("toggle-height");
            }
        })
        webview.insertCSS("*{cursor: pointer;}");
        webview.send('start', "");

    });
    $(".cover-box").on("click", ".capture", function () {
        $(".tool >i").attr("class", "");
        if (modal.$data.editLiuchengItem.isEditExistedItem) {
            $("#" + modal.$data.editLiuchengItem.editItemId).find(">.node-main-box").find(">i")[0].classList.forEach(function (el, index) {
                if (el.indexOf("diy-icon-menu") > -1) {
                    $(".tool >i").addClass(el);
                }
            })

        } else {
            $(".tool >i").addClass(modal.$data.addLiuchengItem.newNodeLeftIconClass);
        }
        //$(".cover-box").hide();//隐去模态框
        modelHeight = $(".cover-alert").height();
        // $(".cover-alert").animate({
        $(".cover-box > .cover-alert").animate({
            height: "0px",
            width: "0px",
            top: "50px",
            left: "100%",
            opacity: '0',
        }, function () {
            $(".cover-box").animate({
                opacity: '0',
            }, 100, () => {
                $(".cover-box").hide();
                // $(".tool .title").html($(".cover-box .alert-tit").html())
                $(".tool").show();
                modal.postion = $(".tool").position()
            })

        });

        webview.insertCSS("*{cursor: pointer;}");
        // if (ctx.get("sysConfig").isDev) {
        //     webview.openDevTools() // 这里！ 打开 webview的控制台
        // }
        once(webview, 'ipc-message', (event) => {
            event.stopPropagation();
            if (typeof (event.channel.single) == "undefined") {
                ctx.set(event.channel.id, event.channel.context);
            } else {
                $("body > .cover-box").show();

                $(".tool").hide();
                $("body > .cover-box > .cover-alert").css("height", "auto")

                modal.animateModal()
                webview.send("stop", "");
                webview.insertCSS("*{cursor: auto;}");
                console.log(event.channel.framePath, event.channel)
                let single, alike, hasId;
                if (typeof event.channel.framePath != "undefined" && event.channel.framePath != "") {
                    single = event.channel.framePath + "," + event.channel.single
                    alike = event.channel.framePath + "," + event.channel.alike
                    hasId = event.channel.framePath + "," + event.channel.hasId
                } else {
                    single = event.channel.single
                    alike = event.channel.alike
                    hasId = event.channel.hasId
                }
                //如果是寻找相似标签的内容 event.channel 需要将event.channel.single=>>>>>>event.channel.alike
                if ($("body > .cover-box .alert-tit").html().indexOf("表格") > -1) {
                    let tableD = single.substring(single.lastIndexOf('table'), single.length)
                    let tablePath = single.substring(0, single.lastIndexOf('table')) + tableD.substring(0, tableD.indexOf("/"))
                    $("body > .cover-box [name='xpath']").val(tablePath);
                } else {
                    $("body > .cover-box [name='xpath']").val(single);
                    if (typeof hasId != "undefined") {
                        $("body > .cover-box [name='xpath']").attr("hasIdXpath", hasId);
                    }
                }
                $("body > .cover-box [id='xpath']").val(single);
                $("body > .cover-box [id='xpathAlike']").val(alike);
                $("body > .cover-box [name='xpathAlike']").val(alike);
            }


        });
        webview.send('start', "");
        //$(".cover-box").hide();
    });


    function newFunction() {
        viewProcessMessage("robot");
    }
    $(".tool >i").on("click", function (event) {
        console.log(2)

        event.stopPropagation();
        $(".cover-box").show();
        // $(".cover-alert").animate({
        modal.postion = {
            top: event.clientY,
            left: event.clientX,
        }
        modal.animateModal(function () {
            $(".tool").hide();
        });
    })

    $(".tool").on("click", function () {
        console.log(1)
        $(".tool").hide();
        webview.send('stop', 'stop');
        webview.insertCSS("*{cursor: auto;}");

        modal.$data.editLiuchengItem.isEditExistedItem = false;
    })

    $(".cover-alert").on("keydown", "input", function (e) {
        if ($(this).attr("name") == "hotKey") {
            return;
        }
        if (e.keyCode == 13) {
            $(".cover-alert .btn-start").click();
            return false;
        }
    })
    //mouseover回显
    $(".cover-box .cover-alert").on("mouseenter", function () {
        echoBtn()
    });

    /**********新增或编辑流程有出参时出现2秒自动消失的弹框    开始  **********/
    var hide = function () {
        $('.parameter-state').hide();
    }

    // var options = [{ "data": "1" }, { "data": "2" }]
    var parameter = {
        "init": function (options) {
            var parameterList = "";
            $('.parameter-state').fadeToggle(500);
            parameterList += "<li>本次步骤生成变量：<i>" + options[0].data + "</i></li>";
            parameterList += "<li>预计生成变量类型为：<i>" + options[1].data + "</i></li>";
            $('.parameter-state>ul').html(parameterList);
            setTimeout(hide, 2000);
        },
        scrollInit: function (options) {
            var parameterList = "";
            $('.parameter-state').fadeToggle(500);
            parameterList += "<li>请在目标程序中，鼠标" + options[0].data + options[1].data + "</li>";
            $('.parameter-state>ul').html(parameterList);
            let text = $('.parameter-state>ul>li').eq(0).text();
            if (text.substr(text.length - 1, 1) == "," || text.substr(text.length - 1, 1) == "，") {
                $('.parameter-state>ul>li').eq(0).text(text = text.substr(0, text.length - 1))
            };
            setTimeout(hide, 2000);
        }
    }
    $('.on-parameter').click(function () {
        $('.parameter-state').hide();
    });
    /**********新增或编辑流程有出参时出现2秒自动消失的弹框    结束  **********/

    //鼠标移出弹出框，有捕获页面元素的弹框会停止回显
    $(".cover-box .cover-alert").on("mouseleave", function () {
        webview.send("echo-stop", "");
    });
    //弹出框中取消按钮功能
    $("body>.cover-box .btn-cancel").on("click", function () {
        modal.$data.addLiuchengItem.newNodeItem = '';
        webview.send('stop', 'stop');
        webview.insertCSS("*{cursor: auto;}");
    });
    //流程项填入提示所需内容
    function initLiuchengItemTips(inputArrayValue, thisLi) {
        inputArrayValue.forEach(function (e) {
            let targetClass = "tips-" + e.name;
            $(thisLi).find(".liucheng-item-tips").find("." + targetClass + "").text(e.value);
        })
    }
    /********** 点击可选入参项 **********/
    $(".cover-box").on("click", ".parameter", function () {
        // $(this).parent().find("ul").toggle();
        var thisVal = $(this).text();
        let indexId;
        if (typeof $(this).attr("globalName") != "undefined" && typeof $(this).attr("globalName") != "") {
            thisVal = $(this).attr("globalName")
        }
        if (typeof $(this).attr("index") != "undefined" && $(this).attr("index") != "") {
            indexId = $(this).attr("index");
        }

        if ($(this).parent().parent().find("input").length > 0) {
            $(this).parent().parent().find("input").not("input[type='hidden']").not("input[type='file']").eq(0)[0]._value = "@" + thisVal;
            $(this).parent().parent().find("input").not("input[type='hidden']").not("input[type='file']").val("@" + thisVal);
            $(this).parent().parent().find("input").not("input[type='hidden']").not("input[type='file']").attr("readonly", "readonly");
            $(this).parent().parent().find("input").not("input[type='hidden']").not("input[type='file']").css("background", "#ccc");
            if (indexId) {
                $(this).parent().parent().find("input").not("input[type='hidden']").not("input[type='file']").attr("fromIndex", indexId);
            }
            $(this).parent().parent().find("input").not("input[type='hidden']").not("input[type='file']").trigger("change");
        }
        if ($(this).parent().parent().find("textarea").length > 0) {
            $(this).parent().parent().find("textarea").val("@" + thisVal);
            $(this).parent().parent().find("textarea").attr("readonly", "readonly");
            $(this).parent().parent().find("textarea").css("background", "#ccc");
            if (indexId) {
                $(this).parent().parent().find("textarea").attr("fromIndex", indexId);
            }
            $(this).parent().parent().find("textarea").trigger("change");
        }
        $(this).parent().parent().find(".toggleType").show();
        $(this).parent().parent().find(".parameters").hide();
        $(this).parent().hide();
    });
    /********** 显示可选入参 **********/
    $(".cover-box").on("click", ".parameters", function () {
        $(this).parent().find("ul").toggle();
        initListAbsolute(event);
    })
    //通用下拉按钮
    $(".cover-alert").on("click", ".common-xia-list", function () {
        $(this).siblings(".options-list").toggle();
        initListAbsolute(event);
    });
    $(".cover-box").on("click", ".xiala-icon.xia-op", function () {
        $(this).parent().find("ul").toggle();
        initListAbsolute(event);
    })
    /********** toggle显示可选入参 **********/
    $(".cover-box").on("click", ".toggleType", function () {
        // $(this).parent().find("ul").toggle();
        $(this).parent().find("input").not("input[type='hidden']").eq(0)[0]._value = "";
        $(this).parent().find("input").val("");
        $(this).parent().find("input").css("background", "#fff")
        $(this).parent().find("input").not("input[mustReadonly='true']").removeAttr("readonly")
        $(this).parent().find("input").trigger("change");
        $(this).parent().find(".toggleType").hide();
        $(this).parent().find(".parameters").show();

    });
    var nowNode = "<li class='separate-block'></li>";
    //点击弹窗中的输入框
    $(".cover-box,.data_import,.data_io").on("click", "input", function (event) {
        // if ($(this).siblings("i.parameters").length > 0 && typeof $(this).attr("readonly") == "undefined") {
        //     $(this).siblings("i.parameters").click();
        // }
        // $("#coverModal .input-box ul").hide();
        if ($(this).parent().find("ul").length > 0) {
            $(this).parent().find("ul").toggle();
            initListAbsolute(event);
        }
    });
    //input框中输入隐藏可选入参
    $(".cover-box").on("keyup", "input", function (event) {
        if ($(this).parent().find("ul").length > 0) {
            $("#coverModal .input-box ul").hide();
        }
    });
    //弹出框关闭按钮
    $(".cover-alert").on("click", ".cover-close-icon", function () {
        if ($(this).parents(".cover-alert").parents("#coverModal").length == 0) {
            $(this).parents(".cover-alert").eq(0).parent().hide();
        }
    });
    $(".cover-alert").on("click", ".btn-cancel", function () {
        if ($(this).parents(".cover-alert").parents("#coverModal").length == 0) {
            $(this).parents(".cover-alert").eq(0).parent().hide();
        }
    });
    //
    //滚动条监听
    // $("#coverModal").on("scroll", ".stipulation", function (event) {
    //     let currentDom = $(event.target);
    //     if (currentDom.parent("div.input-box").length > 0) {

    //     } else {
    //         $("#coverModal .input-box ul").hide();
    //     }
    // })
    $(document).bind("mousewheel", function (event) {
        if (event.target.localName == "li" && $(event.target).parent("ul").parent(".input-box").length > 0) {

        } else {
            $("#coverModal .cover-alert .input-box >ul").hide();
        }
    });

    //检测重名变量
    $("#coverModal .cover-alert").on("keyup", "input[name='rename']", function () {
        let thisVal = $(this).val();
        let isNotHasSame = true;
        let currentUl = $(".detail-liucheng-box .detail-liucheng-lists-box .current-show-list").eq(0);
        let timer;
        let info = {};
        //先于当前元流程的局部变量作对比
        if (typeof ctx.get(currentUl.attr("id")) != "undefined") {
            let currentPart = ctx.get(currentUl.attr("id"));
            // isNotHasSame = currentPart.every((item, index) => {
            //     return thisVal != item.name;
            // });
            currentPart.forEach((item, index) => {
                if (item.name == thisVal) {
                    if (modal.$data.editLiuchengItem.isEditExistedItem && item.fromId == modal.$data.editLiuchengItem.editItemId) {

                    } else {
                        isNotHasSame = false;
                    }
                }
            });
        }
        //如果没有重名的局部变量就与全局变量作对比
        if (isNotHasSame && typeof ctx.get("detailPretreatmentList") != "undefined") {
            let global = ctx.get("detailPretreatmentList");
            // isNotHasSame = global.every((item, index) => {
            //     return thisVal != item.name;
            // });
            global.forEach((item, index) => {
                if (item.name == thisVal) {
                    if (modal.$data.editLiuchengItem.isEditExistedItem && item.fromId == modal.$data.editLiuchengItem.editItemId) {

                    } else {
                        isNotHasSame = false;
                    }
                }
            });
        };
        clearTimeout(timer);
        if (!isNotHasSame) {
            info.x = $(this).offset().left + $(this).outerWidth() - $("#sameName_tips").outerWidth();
            info.y = $(this).offset().top - $("#sameName_tips").outerHeight() - 5;
            setTimeout(function () {
                $("#sameName_tips").show().css({
                    top: info.y + "px",
                    left: info.x + "px"
                });
            }, 200);
        } else {
            $("#sameName_tips").hide();
        }
    })

    //ul下拉框的位置init
    function initListAbsolute(event) {
        let currentDom = $(event.target).parent().find("input").not(".item-type,input[type='hidden'],input[type='file']").eq(0)[0];
        let jQcurrentDom = $(currentDom);
        let targetDom = $(currentDom).parent().find("ul").eq(0)[0];
        targetDom.style.top = jQcurrentDom.offset().top + currentDom.offsetHeight + 'px';
        targetDom.style.left = jQcurrentDom.offset().left + 'px';
        targetDom.style.width = currentDom.offsetWidth + "px"
    };
})