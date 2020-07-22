const electron = require('electron')
const remote = electron.remote
const ipc = electron.ipcRenderer;
const overallCtx = remote.getGlobal('context');
const sysConfig = remote.getGlobal('sysConfig');
const path = require('path');
const join = path.join;
const log = remote.getGlobal('log');
const Context = remote.getGlobal('important').context.Context;
const fs = require("fs")
const incident = require(sysConfig.rootPath + 'app/main/debuger/Scalable/incident');
const worker = require(sysConfig.rootPath + 'app/main/debuger/Scalable/workflowClient')
incident.init(fs);
worker.module(incident);
//const incident = require('electron').remote.getGlobal('incident');
incident.setmdkir(function (path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
})
incident.addEVent("writeError", true, function (path, filename, appendText, call) {
    let filePath = join(path, filename);
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    if (!fs.existsSync(filePath)) {
        fs.createWriteStream(filePath)
    }
    fs.appendFile(filePath, appendText, function (err) {
        call(err)
    });
})
incident.setDirectory(sysConfig.rootDirectory,sysConfig.isPackager);
const async = require('async');
const URL = require('url');
const exec = require('child_process').exec;
const nodemailer = require('nodemailer');
const iconv = require('iconv-lite');
iconv.skipDecodeWarning = true;
const sysPath = remote.getGlobal('path');
const important = remote.getGlobal('important');
const util = require("../main/util");
for (let i in util) {
    window[i] = util[i]
}
let tarr = util['extendUtil'](sysConfig.rootPath);
for (let i in tarr) {
    window[i] = tarr[i]
}
for (let i in important) {
    window[i] = important[i]
}
var webview;

function webviewEvent(dom) {
    dom.addEventListener('console-message', function (e) {
        // console.log('Guest page logged a message:', e.message);
    });

    dom.addEventListener('dom-ready', function (e) {
        console.log(e);
        $(".webview-pages >li").last().find("span.page-title").text(dom.getTitle());
        $(".webview-pages >li").last().attr("title", dom.getTitle());

        // once(dom, 'ipc-message', (event) => {
        //     dom.send("pageTitle", document.title);
        // });
        // dom.send("domReady");
    });

    dom.addEventListener('crashed', (e) => {
        ipc.send('crashed', {
            title: "pre-web",
            msg: e
        })
    })
    dom.addEventListener('gpu-crashed', (e) => {
        ipc.send('crashed', {
            title: "pre-web-gpu",
            msg: e
        })
    })
    dom.addEventListener('new-window', (e) => {
        //console.log(e)
        let lastWebview = webview;
        webview = null;
        let protocol = URL.parse(e.url).protocol;
        let len = $("#main-body").find("webview").length + 1;
        if (protocol === 'http:' || protocol === 'https:') {
            //shell.openExternal(e.url)
            // $('.page-jump-http input').val(e.url);
            // $("#foo")[0].loadURL(e.url);
            // $(dom).attr("disablewebsecurity", "");
            let webItem = `<webview src='${e.url} ' id='foo${len}' style='width:auto' minheight='700' preload='../main/debuger/actuator.js' partition='${$("#foo").attr("partition")}' userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36' ></webview > `;
            let addLi = "<li index='" + len + "'><span class='page-title'>page" + len + "</span><span class='webview-page-tools'><i></i></span></li>"
            $("#main-body").append(webItem);
            // $("#main-body").find("webview").hide();
            // $("#foo" + len).show();
            $("#main-body").find("webview").addClass("webview-hide");
            $("#foo" + len).removeClass("webview-hide");

            $(".webview-pages").append(addLi);
            $(".webview-pages >li").removeClass("page-selected");
            $(".webview-pages >li").last().addClass("page-selected");
            // $("#foo" + len)[0].loadURL(e.url);
            webviewEvent($("#foo" + len)[0])
            webview = $("#foo" + len)[0];
            try {
                webview.focus();
            } catch (err) {
                console.log(err);
            }
        } else {
            webview = lastWebview;
            try {
                webview.focus();
            } catch (err) {
                console.log(err);
            }
        }

    });
}
/**
 * 同步加载js脚本
 * @param url  js文件的相对路径或绝对路径
 * @return {Boolean}  返回是否加载成功，true代表成功，false代表失败
 */
function loadJS(url) {
    var xmlHttp = null;
    if (window.ActiveXObject) //IE
    {
        try {
            //IE6以及以后版本中可以使用
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            //IE5.5以及以后版本可以使用
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    } else if (window.XMLHttpRequest) //Firefox，Opera 8.0+，Safari，Chrome
    {
        xmlHttp = new XMLHttpRequest();
    }
    //采用同步加载
    xmlHttp.open("GET", url, false);
    //发送同步请求，如果浏览器为Chrome或Opera，必须发布后才能运行，不然会报错
    xmlHttp.send(null);
    //4代表数据发送完毕
    if (xmlHttp.readyState == 4) {
        //0为访问的本地，200到300代表访问服务器成功，304代表没做修改访问的是缓存
        if ((xmlHttp.status >= 200 && xmlHttp.status < 300) || xmlHttp.status == 0 || xmlHttp.status == 304) {
            var myHead = document.getElementsByTagName("HEAD").item(0);
            var myScript = document.createElement("script");
            myScript.language = "javascript";
            myScript.type = "text/javascript";
            try {
                //IE8以及以下不支持这种方式，需要通过text属性来设置
                myScript.appendChild(document.createTextNode(xmlHttp.responseText));
            } catch (ex) {
                myScript.text = xmlHttp.responseText;
            }
            myHead.appendChild(myScript);
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * 
 * @param startPath  起始目录文件夹路径
 * @returns {Array}
 */
function findSync(startPath) {
    let result = [];

    function finder(path) {
        let files = fs.readdirSync(path);
        files.forEach((val, index) => {
            let fPath = join(path, val);
            let stats = fs.statSync(fPath);
            if (stats.isDirectory()) finder(fPath);
            if (stats.isFile() && !fPath.includes("test.js")) result.push(fPath);
        });

    }
    finder(startPath);
    return result;
}
let fileNames = overallCtx.get("extendJS");
//fileNames.pushimposysConfig.rootPath + 'app/main/util/systemParamUtil.js')
fileNames.forEach(e => {
    loadJS(e)
})