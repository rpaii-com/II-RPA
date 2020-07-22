//变量列表
var parameters = [];
//添加回显
//变量下标
//画板的包括主流程和元流程的宽高总和；
let bannerFullSizes = [];
let currentWindowSize;
var parameters_index = {};
// const remote = require("electron").remote;
//应用系统时间插件
// let silly_datetime = require("silly-datetime");
var processList = [];
var scanProcess;
let isExistCSFile;
// let clipboard = remote.clipboard;
let globalShortcut = remote.globalShortcut;
const ipc = require('electron').ipcRenderer;
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
let scrollBoxs = {};
let mateWorkFlows = {};
let hasDownLoadNewSuccess = false;

window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
    var info = "错误信息：" + errorMessage + "</br>" +
        "出错文件：" + scriptURI + "</br> " +
        "出错行号：" + lineNumber + "</br>" +
        "出错列号：" + columnNumber + "</br>" +
        "错误详情：" + errorObj + "</br></br>";
    ipc.send({
        code: 500,
        msg: info
    })
}
//单个节点异常flag
let singleTryFlag = false;

/**
 * 获取 用户自定义 或 顺序生成的 变量名
 * @param name 节点唯一标识 id 也是 页面元素id属性
 * @param isNotNew
 * @returns 变量名
 */
function getParameterNameIndex(name, isNotNew) {

    let myname = $("body>.cover-box [name='rename']").val().trim();
    if (myname && myname.trim() != '') {
        // 用户 命名 变量
        return myname;
    } else {
        // 用户未命名变量
        name = $("#" + name + " > .title").text().trim();
        if (typeof (isNotNew) == "undefined") {
            if (typeof (parameters_index[name]) == "undefined") {
                parameters_index[name] = 0;
            } else {
                parameters_index[name]++;
            }
        }
        return name + "(" + parameters_index[name] + ")";
    }

}


/**
 * 返回变量
 */
function getParameter(ParameterName) {
    let ret = {};
    ret.name = ParameterName
    parameters.forEach(e => {
        if (ParameterName.substring(1, ParameterName.length) == e.name) {
            console.log(e.id)
            // ret.name = ctx.get(e.id);
            ret.value = ctx.get(e.id);
            ret.id = e.id
        }
    })
    return ret;
}

///添加验证捕获元素
///添加验证捕获元素
function verification(id) {
    var jsonarray = $('.cover-box form').serializeArray();
    let xpath;
    let type;
    let matchType;
    let matchText;
    // let webview = $("#foo")[0];
    let flag = false;
    jsonarray.forEach(element => {
        console.log(element)
        switch (element.name) {
            case "click": //点击网页元素
                type = "document.evaluate('xpath', document).iterateNext().click()"
                break;
            case "mouseDown": //点击网页元素(down)
                type = `var triggerEvent=function (el, eventName) {
                                if (el.fireEvent) { // < IE9
                                    (el.fireEvent('on' + eventName));
                                } else {
                                    var evt = document.createEvent('Events');
                                    evt.initEvent(eventName, true, false);
                                    el.dispatchEvent(evt);
                                }
                            };`
                type += "triggerEvent(document.evaluate('xpath', document).iterateNext(),'mousedown')"
                break;
            case "mouseover": //鼠标移动元素位置
                type = "var evt = document.createEvent('Events');" +
                    "evt.initEvent('mouseover', true, false);" +
                    "document.evaluate('xpath', document).iterateNext().dispatchEvent(evt);"
                break;
            case "selectOption": //选择下拉框内容
                type = `var util = {
                            //是否匹配正则
                            _stringRegMatch: function (str, regStr) {
                                if (this._emptyStr(str) || this._emptyStr(regStr)) {
                                    return false;
                                }

                                var pattern = new RegExp(regStr);
                                return pattern.test(str);
                            },
                            _emptyStr: function (str) {
                                return str == null || str == "" || str == undefined
                            },
                            _trim: function (str) {
                                return str == null ? null : str.replace(/(^\s*)|(\s*$)/g, "");
                            },
                            //根据传入 eventName 触发相应事件
                            triggerEvent: function (el, eventName) {
                                if (el.fireEvent) { // < IE9
                                    (el.fireEvent('on' + eventName));
                                } else {
                                    var evt = document.createEvent('Events');
                                    evt.initEvent(eventName, true, false);
                                    el.dispatchEvent(evt);
                                }
                            },
                            /**
                             * 获取元素el下元素tag=tagname的所有元素
                             */
                            getTagNameCollection: function (el, tagName) {
                                if (el == null || this._emptyStr(tagName)) {
                                    return null
                                }
                                return el.getElementsByTagName(tagName)
                            },
                            /**
                             * 下拉选择：完全/模糊/正则 匹配输入值
                             */
                            optionClick: function (el, type, value) {

                                if (el == null) {
                                    return "-1";
                                }

                                var array = this.getTagNameCollection(el, "option");
                                if (array == null || array.length == 0) {
                                    return "0";
                                }

                                for (var item = 0; item < array.length; item++) {
                                    var itemText = this._trim(array[item].outerText);
                                    switch (type) {
                                        case "all":
                                            if (itemText == value) {
                                                el.focus();
                                                array[item].selected = true;
                                                array[item].focus();
                                                array[item].click();
                                                this.triggerEvent(el, 'change');
                                                console.log(123)
                                                return 1;
                                            }
                                            break;
                                        case "like":
                                            if (itemText.indexOf(value) > -1) {
                                                el.focus();
                                                array[item].selected = true;
                                                array[item].focus();
                                                array[item].click();
                                                this.triggerEvent(el, 'change');
                                                return 1;
                                            }
                                            break;
                                        case "php":
                                            if (this._stringRegMatch(itemText, value)) {
                                                el.focus();
                                                array[item].selected = true;
                                                array[item].focus();
                                                array[item].click();
                                                this.triggerEvent(el, 'change');
                                                return 1;
                                            }
                                            break;
                                    }

                                }
                            },
                        };`
                type += "util.optionClick(document.evaluate('xpath', document).iterateNext(),'" + matchType + "','" + matchText + "')"
                break;
            case "matchText":
                matchText = element.value;
                break;
            case "matchType":
                matchType = element.value;
                break;
            case "getSystemParameter":
                type = "getSystemParameter";
                flag = true;
            case "xpath":
                xpath = element.value;
                break;
        }
    })
    try {
        if (flag) {
            webview.send("operate", {
                id: id,
                xpath: xpath,
                type: type
            })
        } else {
            webview.executeJavaScript(type.replace("xpath", xpath), true, function (reslut) {

                // console.log(reslut)
            });

            // console.log(type)

        }
    } catch (error) {
        console.error('cannot get somethin' + xpath);
    }

}
//新版本下载完毕
ipc.on('hasDownLoadNewSuccess', () => {
    hasDownLoadNewSuccess = true;
    layer.open({
        type: 1,
        title: false,
        offset: 't',
        content: '<div style="padding: 20px 20px;">新版本内容已下载好，是否立即重启更新？</div>',
        btn: ['确定', '取消'],
        btnAlign: 'c',
        shade: 0 ,
        closeBtn:0,
        offset: 'rb',
        yes: function (index, layero) {
            layer.close(index);
        },
        btn2: function (index, layero) {
            layer.close(index);
        }
    });
});

//当前是最新版本
ipc.on('isLasterVersion',function(){
    layer.open({
        type: 1,
        title: false,
        offset: 't',
        content: '<div style="padding: 20px 20px;">当前已是最新版本！</div>',
        btn: ['确定', '取消'],
        btnAlign: 'c',
        shade: 0 ,
        closeBtn:0,
        offset: 'rb',
        yes: function (index, layero) {
            layer.close(index);
        },
        btn2: function (index, layero) {
            layer.close(index);
        }
    });
})

// function getForNodeInfoArray(targetMateId) {
//     if (typeof targetMateId == "undefined") {
//         targetMateId = $(".liucheng-list.current-show-list").eq(0).attr("id").replace("secondList", "");
//     }
//     let tempArray = [];
//     let thisParentClass = $("#" + targetMateId).parent("ul").hasClass("main-liucheng-list");
//     let targetParentLi;
//     let targetLi = $("#" + targetMateId);
//     while (!thisParentClass) {
//         let tempObj = {};
//         tempParent = targetLi.parents(".this_for").eq(0);
//         if (tempParent.length > 0) {
//             tempObj = ctx.get(tempParent.attr("id"));
//             tempObj.id = tempParent.attr("id");
//             tempObj.isGlobal = true;
//             tempArray.push(tempObj);
//             targetLi = tempParent;
//             thisParentClass = targetLi.hasClass("main-liucheng-list");
//         } else {
//             thisParentClass = true;
//         };
//     };
//     $("#secondList" + targetMateId).find(".for-menu-box").each((index, item) => {
//         let tempObj = {};
//         let targetParentLi = $(item).parents("li").eq(0);
//         tempObj = ctx.get(targetParentLi.attr("id"));
//         tempObj.isGlobal = false;
//         tempArray.push(tempObj);
//     });
//     return tempArray;
// }
// function getFirstForNodeInfoArray(targetMateId) {
//     if (typeof targetMateId == "undefined") {
//         targetMateId = $(".liucheng-list.current-show-list").eq(0).attr("id").replace("secondList", "");
//     }
//     let tempArray = [];
//     let thisParentClass = $("#" + targetMateId).parent("ul").hasClass("main-liucheng-list");
//     let thisPrev = $("#" + targetMateId).prev("li.this_for");
//     let targetParentLi;
//     let targetLi = $("#" + targetMateId);
//     while (!thisParentClass) {
//         let tempObj = {};
//         tempParent = targetLi.parents(".this_for").eq(0);
//         if (tempParent.length > 0) {
//             targetLi = tempParent;
//             thisParentClass = targetLi.hasClass("main-liucheng-list");
//             if (!thisParentClass) {
//                 tempObj = ctx.get(tempParent.attr("id"));
//                 tempObj.id = tempParent.attr("id");
//                 tempObj.isGlobal = true;
//                 tempArray.push(tempObj);
//             }
//         } else {
//             thisParentClass = true;
//         };
//     };
//     thisPrev = targetLi.prev("li.this_for");
//     while (thisPrev.length > 0) {
//         let tempObj = {};
//         tempObj = ctx.get(thisPrev.attr("id"));
//         tempObj.id = thisPrev.attr("id");
//         tempObj.isGlobal = true;
//         tempArray.push(tempObj);
//         thisPrev = thisPrev.prev("li.this_for");
//     };
//     return tempArray;
// };
// function getPrevMainList(targetMateId) {
//     if (typeof targetMateId == "undefined") {
//         targetMateId = $(".liucheng-list.current-show-list").eq(0).attr("id").replace("secondList", "");
//     }
//     let tempArray = [];
//     let thisParentClass = $("#" + targetMateId).parent("ul").hasClass("main-liucheng-list");
//     let thisPrev = $("#" + targetMateId).prev("li.this_for");
//     let targetParentLi;
//     let targetLi = $("#" + targetMateId);
//     while (!thisParentClass) {
//         let tempObj = {};
//         tempParent = targetLi.parents(".this_for").eq(0);
//         if (tempParent.length > 0) {
//             targetLi = tempParent;
//             thisParentClass = targetLi.hasClass("main-liucheng-list");
//             if (!thisParentClass) {
//                 tempObj = ctx.get(tempParent.attr("id"));
//                 tempObj.id = tempParent.attr("id");
//                 tempObj.type = targetLi.attr("itemtype");
//                 tempObj.isGlobal = true;
//                 tempArray.push(tempObj);
//             }
//         } else {
//             thisParentClass = true;
//         };
//     };
//     thisPrev = targetLi.prev("li");
//     while (thisPrev.length > 0) {
//         let tempObj = {};
//         tempObj = typeof ctx.get(thisPrev.attr("id")) != "undefined" ? ctx.get(thisPrev.attr("id")) : {};
//         tempObj.id = thisPrev.attr("id");
//         tempObj.isGlobal = true;
//         tempObj.type = thisPrev.attr("itemtype");
//         tempArray.push(tempObj);
//         thisPrev = thisPrev.prev("li");
//     };
//     return tempArray;
// }
$(document).ready(function () {
    var addLiuchengItem = {};

    var onceFlag = 1;
    var json = {};
    var list = [];
    var modelHeight;
    var editLiuchengItem = {
        isEditExistedItem: false,
        editItemIndex: "",
        editItemId: ""
    };
    let scrollAnnotationTips;
    let scrollHoverTimer;
    currentWindowSize = remote.getCurrentWindow().getContentSize();

    concurrence();
    $(".logo-tit-box .logo-main-tit").text("数字员工");
    $("#set_main_setter").text(`copyright@北明软件`).css({
        cursor: "not-allowed",
        color:"#E6E9ED", 
        "text-align": "center",
        width: "100%",
        display: "block"
    })
    //debug按钮
    $(".detail-liucheng-lists-box").on("click", ".debug-flag", function (e) {
        // e.preventDefault();
        e.stopPropagation();
        $(this).toggleClass("debug-true");
        return false;
    });

    $(".cover-box .cover-close-icon").on("click", function () {
        modal.cleanModal();
        webview.send('stop', 'stop');
        editLiuchengItem.isEditExistedItem = false;
    });

    // //鼠标移入注释缩略
    // $(".detail-liucheng-scroll").on('mouseenter','span.scroll-item-annotation',function(){
    //     let tit = $(this).data('title');
    //     let that = this;
    //     layer.close(scrollAnnotationTips);
    //     scrollAnnotationTips = layer.tips(tit,that,{
    //         tips:4,
    //         time:0
    //     })
    // })

    // $(".detail-liucheng-scroll").on('mouseleave','span.scroll-item-annotation',function(){
    //     layer.close(scrollAnnotationTips);
    // })

    //点击注释缩略
    $(".detail-liucheng-scroll").on('click', 'span.scroll-item-annotation', function () {
        let tempId = $(this).parent('li.scroll-nodeItem').attr('id');
        let targetListId = $(this).parents('ul.scroll-nodeItem-list').eq($(this).parents('ul.scroll-nodeItem-list').length - 1).attr('id').replace('scrollList', 'secondList');
        let targetId = tempId.replace('scrollItem', '');
        let targetSize = domUtils.calcOffset(targetId);
        let itemParentsUl = $('#' + targetListId)
        itemParentsUl.scrollTop(targetSize.offsetTop - itemParentsUl.outerHeight() / 2);
        itemParentsUl.scrollLeft(targetSize.offsetLeft - itemParentsUl.outerWidth() / 2);
        $('.detail-liucheng-lists-box .liucheng-item-selected').removeClass('liucheng-item-selected');
        $('#' + targetId).addClass('liucheng-item-selected');
    })

    $('.li-up').on('click', function () {
        addLiuchengItem.newNodeItem = '';
        // var webview = $("#foo")[0];
        webview.goBack();
    })

    $('.li-down').on('click', function () {
        addLiuchengItem.newNodeItem = '';
        // var webview = $("#foo")[0];
        webview.goForward();
    })

    $('.li-refresh').on('click', function () {
        addLiuchengItem.newNodeItem = '';
        // var webview = $("#foo")[0];
        webview.reload();
    });
    //通用下拉按钮
    // $(".cover-alert").on("click", ".common-xia-list", function () {
    //     $(this).siblings(".options-list").toggle();
    // });
    // $(".cover-alert").on("click", "li", function () {
    //     if ($(this).parent().hasClass("options-list")) {
    //         let thisText = $(this).text();
    //         $(this).siblings().data("haschoiced", 0);
    //         $(this).data("haschoiced", 1);
    //         $(this).parent().parent().find("input").not("input[type='hidden']").eq(0).val(thisText);
    //         $(this).parent().hide();
    //     }
    // })



    function initLiuchengItemTips(inputArrayValue, thisLi) {
        inputArrayValue.forEach(function (e) {
            let targetClass = "tips-" + e.name;
            $(thisLi).find(".liucheng-item-tips").find("." + targetClass + "").text(e.value);
        })
    }





    $(".child-menu .child-menu-title").each(function () {
        let str = $(this)[0].innerText;
        $(this).attr("title", str);
    })
    /********** if逻辑匡收缩    结束  暂废弃 **********/

    foo();
    remote.globalShortcut.unregisterAll();

    function foo() {
        var foo = $('#foo').attr('src')
        $('.page-jump-http input').val(foo);
    };
    /***********初始化节点的index    开始  暂弃用**********/


    // 关闭并发和条件判断
    $('body').on('click', '.logic-box-off', function () {
        $(this).parent('li').remove();
    })

    // 变量描述
    $('.description-btn').click(function () {
        // $(this).stop().animate({ width: "0" }, 300, function () {
        //     $(this).parent().find('.description-action').stop().animate({ width: "165px" }, 300);
        // });

    })

    //暂未找到功能点
    $('.description-content-btn').click(function () {
        $(this).parent('.description-action').stop().animate({
            width: "0px"
        }, 300, function () {
            $(this).parent().find('.description-btn').stop().animate({
                width: "35px"
            }, 300)
        });
    })



    function concurrence() {
        let tempDate;
        // 并发往下添加
        // let concurrence_node = '<li class="point main-liucheng-item main-item-select" id=' + tempDate + ' ><div class="liucheng-item-utils"><i class="liucheng-item-util-add"></i><i class="liucheng-item-util-remove"></i><i class="liucheng-item-util-default"></i></div><i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title=""></span><div class="parameter-botton"><label>出参：</label></div></li>';

        let concurrence_list = '<li class="branch-way"><ul class="tunnel"><li itemType="MetaWorkflow" class="point main-liucheng-item main-item-select"><div class="liucheng-item-utils"><i class="liucheng-item-util-add"></i><i class="liucheng-item-util-remove"></i><i class="liucheng-item-util-default"></i></div><i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title=""></span><div class="parameter-botton"><label>出参：</label></div></li><li class="long-string"></li></ul></li>'
        //向下添加一项，暂支持if和并发
        $('.main-liucheng-list').on('click', '.liucheng-item-util-default', function (ev) {
            ev.stopPropagation();
            tempDate = new Date().getTime();
            $(".main-item-select").removeClass("main-item-select");
            let concurrence_node = '<li itemType="MetaWorkflow" class="point main-liucheng-item main-item-select"><div class="liucheng-item-utils"><i class="liucheng-item-util-add"></i><i class="liucheng-item-util-remove"></i><i class="liucheng-item-util-default"></i></div><i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title=""></span><div class="parameter-botton"><label>出参：</label></div></li>';
            $(this).parents('.point').after(concurrence_node);
        })
        //主流程节点删除按钮
        $('.main-liucheng-list').on('click', '.liucheng-item-util-remove', function (ev) {
            ev.stopPropagation();
            let currentLiId = $(this).parents("li.main-liucheng-item").eq(0).attr("id");
            let currentSecondId = 'secondList' + currentLiId;
            var li_list = $(this).parents('.tunnel').find('.point').length;
            var way_list = $(this).parents('.branch-container').find('.branch-way').length;
            if ($(this).parents(".main-liucheng-item").hasClass("point")) {
                if ($(".detail-liucheng-lists-box").find("#" + currentSecondId).find("li").not(".segmentation-li").length > 0) {
                    alert("请先清空元流程再删除");
                    return;
                } else {
                    if (way_list == 1 && li_list == 1) {
                        // 并发处理
                        $(this).parents('.this_concurrence').next('br').remove();
                        $(this).parents('.this_concurrence').remove();
                        // 条件判断
                        $(this).parents('.li-branch-if').next('br').remove();
                        $(this).parents('.li-branch-if').remove();
                    } else if (li_list == 1) {
                        $(this).parents('.branch-way').remove();
                    }
                    $(this).parents('.point').remove();
                    $(".detail-liucheng-lists-box").find("#" + currentSecondId).remove();
                }
            } else if ($(this).parents(".main-liucheng-item").eq(0).hasClass("for-liucheng-start") || $(this).parents(".main-liucheng-item").eq(0).hasClass("for-liucheng-end")) {
                let startId = "secondList" + $(this).parents(".this_for").eq(0).find("li.for-liucheng-start").attr("id");
                let endId = "secondList" + $(this).parents(".this_for").eq(0).find("li.for-liucheng-end").attr("id");
                if ($(this).parents(".main-liucheng-item").parents("li").eq(0).find(">ul").find(">li.main-liucheng-item").length > 2) {
                    alert("请先清空循环中流程")
                    return;
                } else if ($("#" + startId).find("li").not(".segmentation-li").length > 0 || $("#" + endId).find("li").not(".segmentation-li").length > 0) {
                    alert("请先清空元流程中流程")
                    return;
                } else {

                    $(this).parents(".main-liucheng-item").parents("li").eq(0).find(">ul").find(">li.main-liucheng-item").each(function () {
                        let currentSecondId = "secondList" + $(this).attr("id");
                        $("#" + currentSecondId).remove();
                        ctx.set(currentSecondId, null);
                    });
                    $(this).parents(".this_for").remove()
                }
            } else {
                if ($(".detail-liucheng-lists-box").find("#" + currentSecondId).find("li").not(".segmentation-li").length > 0) {
                    alert("请先清空元流程再删除");
                    return;
                } else {
                    $(this).parents(".main-liucheng-item").remove();
                    $(".detail-liucheng-lists-box").find("#" + currentSecondId).remove();
                }
            }

        })

        // 并发添加一列
        $('.main-liucheng-list').on('click', '.liucheng-item-util-add', function (ev) {
            ev.stopPropagation();
            $(".main-item-select").removeClass("main-item-select");
            $(this).parents('.branch-way').after(concurrence_list);
        })
    };



    // 变量 树结构js
    $('.description-action').on('click', '.this_tree li > span', function () {
        var children = $(this).parent('li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
        } else {
            children.show('fast');
        }
    })


    // $('.this_for').resize(function () {
    //     console.log($(this).height());
    // })

    // $('.main-liucheng-list').on('resize', '.this_for', function () {
    //     // $(this).height()
    //     console.log(123456789);
    // })


    // 模糊查询
    $('.search-menu-box').bind('input propertychange', function () {
        var inputVal = $('.search-menu-box input').val();

        if (inputVal != '') {
            $('span.child-menu-title').parents('.child-menu').find('li').hide();
            $('span.child-menu-title').parents('.left-menu > li').hide();

            var txt = $(this).parents('#leftMenu').find('span.child-menu-title').each(function () {
                var txt = $(this).text();
                if (txt.indexOf(inputVal) != -1) {
                    console.log(inputVal);
                    var txt = $(this).text();
                    console.log(txt);
                    var text = txt.replace(inputVal, "<b>" + inputVal + "</b>");
                    console.log(text);
                    $(this).find('label').html(text);
                    $(this).parent().show();
                    $(this).parent().parent().parent().show();
                }
            });
        } else {
            var txt = $(this).parents('#leftMenu').find('span.child-menu-title').each(function () {
                var txt = $(this).text();
                if (txt.indexOf(inputVal) != -1) {
                    console.log(inputVal);
                    var txt = $(this).text();
                    console.log(txt);
                    var text = txt.replace("<b>", "");
                    console.log(text);
                    $(this).find('label').html(text);
                    $(this).parent().show();
                    $(this).parent().parent().parent().show();
                }
            });

            $('span.child-menu-title').parents('.left-menu > li').show();
            $('span.child-menu-title').parents('.left-menu > li > ul > li').hide();
            $('span.child-menu-title').parents('.left-menu > li > ul > li').css({
                'opacity': '1'
            });
            $('span.child-menu-title').parents('.left-menu > li > ul > li').css({
                'height': 'auto'
            });
            $('span.child-menu-title').parents('.left-menu > li > ul > li > span').hide();
            $('span.child-menu-title').parents('.left-menu > li:first').hide();
        }
    });

    //判断目录地址是否存在某文件
    function isExistFile(src, dst, callback) {
        fs.exists(dst, function (exists) {
            // 已存在
            if (exists) {
                callback(src, dst);
            }

            // 不存在
            else {
                fs.mkdir(dst, function () {
                    callback(src, dst);
                });
            }
        });
    }
    //写入文件
    function writeFile() {

    }
    let tempDst = path.join(sysConfig.rootPath, "../CShandle");
    let tempSrc = path.join(sysConfig.rootPath, "./app/renderer/CShandle");
    isExistCSFile = fs.existsSync(tempDst);
    if (isExistCSFile) {

    } else {
        let csFiles;
        fs.mkdirSync(tempDst);
        fs.readdir(path.join(sysConfig.rootPath, "./app/renderer/CShandle"), function (err, files) {
            if (err) {
                return;
            }
            files.forEach((item, index) => {
                let src = tempSrc + "\\" + item;
                let dst = tempDst + "\\" + item;
                let readable, writable;
                fs.stat(src, function (err, stats) {
                    if (err) {
                        return;
                    }
                    // 判断是否为文件
                    if (stats.isFile()) {
                        // // 创建读取流
                        // readable = fs.createReadStream(src);
                        // // 创建写入流
                        // writable = fs.createWriteStream(dst, { encoding: "utf8" });
                        // // 通过管道来传输流
                        // readable.pipe(writable);
                        fs.writeFileSync(dst, fs.readFileSync(src))
                        // fs.copyFileSync(src, dst);
                    } else if (stats.isDirectory()) {
                        exists(src, dst, copy);
                    }

                })
            });
        });
    }


    // function exists(url, dest, callback) {
    //     fs.exists(dest, function (exists) {
    //         if (exists) {
    //             callback && callback(url, dest);
    //         } else {
    //             //第二个变量目录权限 ，默认0777(读写权限)
    //             fs.mkdir(dest, 0777, function (err) {
    //                 if (err) throw err;
    //                 callback && callback(url, dest);
    //             });
    //         }
    //     });
    // }

    // var copy = function (src, dst) {
    //     //判断文件需要时间，则必须同步
    //     if (fs.existsSync(src)) {
    //         fs.readdir(src, function (err, files) {
    //             if (err) { console.log(err); return; }
    //             files.forEach(function (filename) {
    //                 //url+"/"+filename不能用/直接连接，Unix系统是”/“，Windows系统是”\“
    //                 var url = path.join(src, filename),
    //                     dest = path.join(dst, filename);
    //                 console.log(url);
    //                 console.log(dest);
    //                 fs.stat(path.join(src, filename), function (err, stats) {
    //                     if (err) throw err;
    //                     //是文件
    //                     if (stats.isFile()) {
    //                         //创建读取流
    //                         readable = fs.createReadStream(url);
    //                         //创建写入流 
    //                         writable = fs.createWriteStream(dest, { encoding: "utf8" });
    //                         // 通过管道来传输流
    //                         readable.pipe(writable);
    //                         //如果是目录
    //                     } else if (stats.isDirectory()) {
    //                         exists(url, dest, copy);
    //                     }
    //                 });
    //             });
    //         });
    //     } else {
    //         console.log("给定的目录不存，读取不到文件");
    //         return;
    //     }
    // }
    // copy(tempSrc, tempDst);
    // window.onbeforeunload = function () {
    //     window.localStorage.setItem('prevUrl', window.location.href);
    // }
    // window.onload = function () {
    //     if (window.localStorage.getItem('prevUrl') != null && window.localStorage.getItem('prevUrl') != window.location.href) {
    //         window.location.href = window.localStorage.getItem('prevUrl')
    //     }
    // }

    $('body').on('click', '.fluctuate-bottom', function (event) {
        event.stopPropagation()
        var thisModule = $(this).parents('.abnormity-node');
        if ($(thisModule).next())
            $(thisModule).next().after($(thisModule));
    })

    $('body').on('click', '.fluctuate-top', function (event) {
        event.stopPropagation()
        var thisModule = $(this).parents('.abnormity-node');
        if ($(thisModule).prev())
            $(thisModule).prev().before($(thisModule));
    })

    $('body').on('click', '.abnormity-node-top', function () {

        var div_Hei = $(this).parents('.abnormity').height();

        var ul_Hei = $('.detail-liucheng-lists-box').height();

        $(this).parent().siblings().find('.ab_module').animate({
            height: 0
        }, 300);

        if ($(this).parent().find('ul').height() == 0) {
            $(this).parents('.abnormity-node').addClass('active').siblings().removeClass('active');
            $(this).parent().find('ul').animate({
                height: ul_Hei - div_Hei
            }, 300);

        } else {

            $(this).parent().find('ul').animate({
                height: 0
            }, 300, function () {
                $(this).parents('.abnormity-node').removeClass('active');
            });

        }
    })



    // 左右模块中间位置拖动
    var isResizing = false;
    var lastDownX = 0;

    var container = $('.box-drag');

    var left = $('.main-liucheng-box');
    var right = $('.detail-liucheng-box');
    var resizor = $('.resizor-box');

    resizor.on('mousedown', function (e) {
        isResizing = true;
        lastDownX = e.clientX;
        console.log(e.clientX)
    });

    $(document).on('mousemove', function (e) {
        if (!isResizing) return true;
        var offsetRight = container.width() - (e.clientX - container.offset().left);
        // 判断左右拖动范围
        // console.log(offsetRight)
        if (offsetRight < 0 || offsetRight >= container.width()) {
            isResizing = false;
            return true;
        }

        left.css('right', offsetRight);
        resizor.css('right', offsetRight);
        right.css('width', offsetRight);

    }).on('mouseup', function (e) {
        isResizing = false;
    });
    // 关闭提示引导
    $('body').click(function () {
        $('.icon-prompt').hide();
    });

    /**
     * 监听窗口的resize，max和umax
     */
    // remote.getCurrentWindow.on("resize", () => {
    //     let array = [];
    //     array.push($(".box-drag").eq(0).width(), $(".box-drag").eq(0).height());
    //     bannerFullSizes = array;
    // })
})

function copyFolder(srcDir, tarDir, cb) {
    let files = fs.readdirSync(srcDir);
    folderCreate(tarDir);
    files.forEach((file, index) => {
        let fileType = fs.lstatSync(srcDir + "\\" + file).isDirectory();
        let src = srcDir + "\\" + file;
        let tar = tarDir + "\\" + file;
        if (fileType) {
            copyFolder(src, tar)
        } else {
            // fs.copyFileSync(src, tar);
            fs.writeFileSync(tar, fs.readFileSync(src))
        }
    });

    function folderCreate(dir) {
        let isTarDirExist = fs.existsSync(dir);
        if (!isTarDirExist) {
            fs.mkdirSync(dir)
        }
    }
}