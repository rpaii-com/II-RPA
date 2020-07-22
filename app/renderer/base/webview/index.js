var webview = $("#foo")[0];

$(document).ready(function () {
    // $(".pretreatment-box .pretreatment-list").css("height", $(".main-box").height() * .66 - 44 + "px");
    const { ipcRenderer } = require('electron')
    //webview标签隐藏（父级隐藏）
    $(".toggle-webview-box").on("click", function () {
        let main_box_height = $(".main-box").height();
        let main_right = $(".main-right").height();
        // let pretreatmentHeight = $("#leftMenu").height() + $(".main-header").height();
        $(this).toggleClass("toggle-webview-selected");
        if (!$(this).hasClass("toggle-webview-selected")) {
            // $(".liucheng-box .pretreatment-box").css("bottom", main_box_height * .33 - 72 + "px");
            // $(".liucheng-box .pretreatment-list").css("height", main_box_height * .5 - 115 + "px");
            // $(this).html("<i class='icon-toggle-webview'></i>收起");
            $(this).find("i.icon-toggle-text").text("收起");
        } else {
            // $(".liucheng-box .pretreatment-box").css("bottom", main_box_height * .5 - 1 + "px");
            // $(".liucheng-box .pretreatment-list").css("height", main_box_height * .66 - 44 + "px");
            // $(this).html("<i class='icon-toggle-webview toggle-webview-selected'></i>展开");
            $(this).find("i.icon-toggle-text").text("展开");
        }
        // $(".main-left").toggleClass("toggle-height");
        $(".main-right").toggleClass("toggle-height");
        $(".main-botttpm").toggleClass("webview-height-0");
    });
    let lastUrl = "",
        lastDom = "";
    // once();
    // ipcRenderer.on("pageTitle", (e, l) => {
    //     console.log(e, l);
    // })

    function webviewEvent(dom) {
        dom.addEventListener('console-message', function (e) {
            // console.log('Guest page logged a message:', e.message);
        });
        dom.addEventListener('dom-ready', function (e) {
            // console.log(e);
            $(".webview-pages >li").last().find("span.page-title").text(dom.getTitle());
            $(".webview-pages >li").last().attr("title", dom.getTitle());
            // once(dom, 'ipc-message', (event) => {
            //     dom.send("pageTitle", document.title);
            // });
            // dom.send("domReady");
        })
        dom.addEventListener('crashed', (e) => {
            ipc.send('crashed', { title: "main-web", msg: e })
        })
        dom.addEventListener('gpu-crashed', (e) => {
            ipc.send('crashed', { title: "pre-web-gpu", msg: e })
        })
        dom.addEventListener('new-window', (e) => {
            if (lastDom == dom && lastUrl == e.url) {
                return;
            } else {
                lastDom = dom
                lastUrl = e.url;
                setTimeout(() => {
                    lastDom = "";
                    lastUrl = "";
                }, 1000);
            }
            const protocol = require('url').parse(e.url).protocol;
            let len = $(".main-botttpm").find("webview").length + 1;
            if (protocol === 'http:' || protocol === 'https:') {
                //shell.openExternal(e.url)
                $('.page-jump-http input').val(e.url);
                let webItem = "<webview src='" + e.url + "' id='foo" + len + "' style='display: inline-flex;' preload='../renderer/base/webview/listen.js' partition='main'></webview>";
                let addLi = "<li index='" + len + "'><div class='icon-newlabel'></div><span class='page-title'>page" + len + "</span><span class='webview-page-tools'><i></i></span></li>"
                $(".main-botttpm").append(webItem);
                //$(".main-botttpm").find("webview").hide();
                $(".main-botttpm").find("webview").addClass("webview-hide");
                //$("#foo" + len).show();
                $("#foo" + len).removeClass("webview-hide");
                $(".webview-pages").append(addLi);
                $(".webview-pages >li").removeClass("page-selected");
                $(".webview-pages >li").last().addClass("page-selected");
                // $("#foo" + len)[0].loadURL(e.url);
                webviewEvent($("#foo" + len)[0])
                webview = $("#foo" + len)[0];
            }

        });
    }
    webviewEvent(webview);
    //选项卡关闭
    $(".webview-pages").on("click", "i", function () {
        if (typeof $(this).parents("li").attr("index") == "undefined") {
            return;
        }
        let index = $(this).parents("li").attr("index");
        $("#foo" + index).remove();
        $(this).parents("li").remove();
        setTimeout(() => {
            $(".webview-pages li").last().click();
            webview = $("webview").last()[0]
        }, 0);

    });
    //选项卡切换
    $(".webview-pages").on("click", "li", function () {
        let index = $(this).attr("index");
        $(".webview-pages").find("li").removeClass("page-selected");
        $(this).addClass("page-selected");
        //$(".main-botttpm webview").hide();
        $(".main-botttpm webview").addClass("webview-hide");
        if (typeof index == "undefined") {
            webview = $("#foo")[0]
            //$("#foo").show();
            $("#foo").removeClass("webview-hide");
        } else {
            webview = $("#foo" + index)[0]
            // $("#foo" + index).show();
            $("#foo" + index).removeClass("webview-hide");
        }
        $(".page-jump-http input").val($(webview).attr("src"))

    });

    initViewForCallFunction();

    //添加加载前监听
    webview.addEventListener("will-navigate", function (e) {
        $('.page-jump-http input').val(e.url);
    });
    webview.addEventListener("load-commit", function (e) {
        $('.page-jump-http input').val(e.url);
    });
    webview.addEventListener("did-stop-loading", function (e) {
        $('.page-jump-http input').val(webview.getURL());
        //返回一个 guest page 是否能够回退的布尔值.
        if (webview.canGoBack()) {

        } else {

        }
        //返回一个 guest page 是否能够前进的布尔值.
        if (webview.canGoForward()) {

        } else {

        }

    });

    //输入网址回车执行
    $('.page-jump-http').keydown(function (e) {
        if (e.keyCode == 13) {
            let url = $('.page-jump-http input').val();
            // if (aa.indexOf("https://") < 0) {
            //     aa = 'https://' + aa;
            // }
            webview.loadURL(url)
        }
    });

    $(".main-botttpm").on("mouseover", webviewZoomFactor);
    $(".main-botttpm").on("mouseleave", unbindMouseWheel);
    let zoomFactor = 1;
    //webview标签的文本放大缩小
    function webviewZoomFactor(event, delta, deltaX, deltaYe) {
        $(webview).bind("mousewheel", function (event, delta, deltaX, deltaYe) {
            // console.log(event, delta, deltaX, deltaYe);
            if (event.altKey) {
                if (delta > 0 && zoomFactor < 3) {
                    zoomFactor = zoomFactor + 0.1;
                } else if (delta < 0 && zoomFactor > 0.3) {
                    zoomFactor = zoomFactor - 0.1;
                }
                webview.setZoomFactor(zoomFactor);
                return false;
            } else {
                return;
            }
        })
    }
    //解除webview的mousewheel
    function unbindMouseWheel() {
        $(webview).unbind("mousewheel");
        webview.setZoomFactor(1);
        zoomFactor = 1;
    }

});