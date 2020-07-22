//添加once方法
function once(dom, event, callback) {
    var handle = function (e) {
        e.stopPropagation();
        callback(e);
        dom.removeEventListener(event, handle);
        handle = null;
    }
    dom.addEventListener(event, handle)
    return handle;
}
onload = function () {
    Date.prototype.format = function (fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "H+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    ipc.on('step', function (event, data) {
        document.getElementById("main-body").innerHTML = `
            <ul class="webview-pages">
                <li class="page-selected">
                    <div class="icon-newlabel"></div>
                    <span class="page-title">Document</span>
                    <span class="webview-page-tools">
                        <i></i>
                    </span>
                </li>
            </ul>
            <webview id="foo" src="about:blank" minheight="700" preload="../main/debuger/actuator.js" partition="debug${new Date().getTime()}" userAgent="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"></webview>
        `
        webview = document.getElementById("foo");
        webviewEvent(webview);
        worker.init(
            data.json,
            sysConfig.category,
            sysConfig.rootDirectory,
            sysConfig.outTime,
            data.id,
            sysConfig.globalWaitTime,
            data.srciptInfo
        )
        //记录日志，任务的html
        ipc.send("logJobHtml", worker.id);
        worker.Start();
    });
    ipc.on('endJob', function (event, data) {
        if (worker.id != data) {
            ipc.send("operateCallback", {
                code: 500,
                msg: "当前正在执行的脚本不符"
            })
        } else {
            ipc.send("operateCallback", {
                code: 200,
                msg: ""
            })
            worker.emit("taskEnd")
        }
    })
    ipc.on('stopJob', function (event, data) {
        worker.emit("taskStop")
        ipc.send("operateCallback", {
            code: 200,
            msg: ""
        })
        setTimeout(() => {
            worker.emit("taskGoon")
        }, 12000)
    });
    ipc.on('goonJob', function (event, data) {
        ipc.send("operateCallback", {
            code: 200,
            msg: ""
        })
        worker.emit("taskGoon")
    });
    ipc.on('debugNext', function (event, data) {
        worker.emit("nextDebug")
    });
    ipc.on('debugStop', function (event, data) {
        worker.emit("stopDebug")
    });
    worker.on("forInfo", function (forinfo) {
        ipc.send("forInfo", forinfo);
    })
    worker.on("logInfo", function (step, error) {
        ipc.send("logInfo", {
            code: 200,
            msg: {
                step: step,
                error: error
            }
        })
    })
    worker.on("status", function (obj) {
        switch (obj.type) {
            case "TimeOutFinsh":
                break;
            case "peopleClose":
                webview.send("callbackFlag", false)
                break;
            default:
                console.log(obj);
                break;
        }

    })
    worker.on("debugInfo", function (obj) {
        console.log("debuggerInfo:", obj)
    })
    worker.on("compeleteyDo", function (stepInfo) {
        console.log(`[${new Date().format("yyyy-MM-dd HH:mm:ss.S")}] compeleteyDo: ${stepInfo.type}`)
    })
    worker.on("readyDo", function (stepInfo) {
        ipc.send("logInfo", {
            code: 200,
            msg: "ready do:" + JSON.stringify(stepInfo)
        })
        ipc.send("doTargetItem", stepInfo)
        console.log(`[${new Date().format("yyyy-MM-dd HH:mm:ss.S")}] readyDo: ${stepInfo.type}`)
    })
    worker.on("workFailed", function (failInfo) {
        ipc.send("logInfo", {
            code: 500,
            msg: failInfo
        });
        console.log("workFailed:", failInfo)
        console.log("****************************************************")
    })
    worker.on("workSuccess", function (ret) {
        ipc.send("logInfo", {
            code: 200,
            msg: "workflow successed"
        });
        console.log("workSuccess")
        console.log("****************************************************")
    })
    /*
    *emit(触发debug)
    *nextDebug
    *stopDebug
    *startDebug
    */
    window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
        var info = "错误信息：" + errorMessage + "\n" +
            "出错文件：" + scriptURI + "\n" +
            "出错行号：" + lineNumber + "\n" +
            "出错列号：" + columnNumber + "\n" +
            "错误详情：" + errorObj + "\n";
        if ((errorObj + "").indexOf("Callback was already called") > -1) {
            console.log(info + "因解绑问题所产生的报错，可以无视");
            return true;
        } else {
            ipc.send("logInfo", {
                code: 500,
                msg: info
            });
            return false;

        }
    }

}