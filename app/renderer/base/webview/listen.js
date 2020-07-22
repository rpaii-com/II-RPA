let isVeintc_tipClick = false;
let xPathString = {};
let mouseMoveTimer = null;
let xPathBack = {};
let echoTimer = null;
let echoTimerCount = 0;
let bodyScrollTop;
let iframeList;
// let ddd = require(["/ddd"]);
setTimeout(() => {
    let title = document.title;
    let obj = {};
    obj.isPageTopTitle = true;
    obj.msg = title;
    console.log(obj);
}, 100);


// function offset(curEle) {
//     var totalLeft = null,
//         totalTop = null,
//         par = curEle.offsetParent;
//     let isHasFixed = false;
//     //首先加自己本身的左偏移和上偏移
//     totalLeft += curEle.offsetLeft;
//     totalTop += curEle.offsetTop
//     //只要没有找到body，我们就把父级参照物的边框和偏移也进行累加
//     while (par) {
//         let isParPositionFixed = getComputedStyle(par)["position"] == "fixed" ? true : false;
//         if (navigator.userAgent.indexOf("MSIE 8.0") === -1 && isParPositionFixed) {
//             //累加父级参照物的边框
//             totalLeft += par.clientLeft;
//             totalTop += par.clientTop;
//             isHasFixed = true;
//         }

//         //累加父级参照物本身的偏移
//         totalLeft += par.offsetLeft;
//         totalTop += par.offsetTop;
//         if (par.localName != "body" && !isHasFixed) {
//             totalTop -= par.scrollTop;
//         } else if (par.localName != "body" && isHasFixed) {
//             totalTop += par.scrollTop;
//         } else if (par.localName == "body" && isHasFixed) {
//             totalTop += par.scrollTop;
//         };
//         if (par.localName == "body") {
//             //  debugger;
//         }


//         par = par.offsetParent;
//     }
//     return {
//         offsetLeft: totalLeft,
//         offsetTop: isHasFixed ? totalTop + bodyScrollTop : totalTop
//     }
// }
function offset(curEle) {
    var totalLeft = null,
        totalTop = null,
        par = curEle.parentNode;

    let isHasFixed = false;
    let targetOffset = curEle.offsetParent;
    //首先加自己本身的左偏移和上偏移
    totalLeft += curEle.offsetLeft;
    totalTop += curEle.offsetTop
    //只要没有找到body，我们就把父级参照物的边框和偏移也进行累加
    while (par != document) {
        let isParPositionFixed = getComputedStyle(par)["position"] == "fixed" ? true : false;
        let isParPosition = getComputedStyle(par)["position"] == "static" ? false : true;
        if (par == targetOffset) {
            if (navigator.userAgent.indexOf("MSIE 8.0") !== -1) {
                //累加父级参照物的边框
                totalLeft += par.clientLeft;
                totalTop += par.clientTop;
                // isHasFixed = true;
            }

            //累加父级参照物本身的偏移
            totalLeft += par.offsetLeft;
            totalTop += par.offsetTop;
            if (par.localName != "body" && !isHasFixed) {
                totalTop -= par.scrollTop;
                totalLeft -= par.scrollLeft;
            } else if (par.localName != "body" && isHasFixed) {
                totalTop -= par.scrollTop;
                totalLeft -= par.scrollLeft;
            } else if (par.localName == "body" && isHasFixed) {
                let bodyOverflow = getComputedStyle(document.body)['overflow'];
                par.style.overflow = "visible";
                totalTop += par.scrollTop;
                par.style.overflow = bodyOverflow;
            };
            targetOffset = par.offsetParent;
        } else {
            if (par.scrollTop != 0 || par.scrollLeft != 0) {
                totalTop -= par.scrollTop;
                totalLeft -= par.scrollLeft;
            }
        }

        par = par.parentNode;
    }
    return {
        offsetLeft: totalLeft,
        offsetTop: isHasFixed ? totalTop + bodyScrollTop : totalTop
    }
}

var tip = {
    $: function (ele) {
        if (typeof (ele) == "object")
            return ele;
        else if (typeof (ele) == "string" || typeof (ele) == "number")
            return document.getElementById(ele.toString());
        return null;
    },
    _init: function (obj) {
        let left = offset(obj).offsetLeft;
        let top = offset(obj).offsetTop;
        let width = obj.clientWidth;
        let height = obj.clientHeight;
        var div = document.createElement("div");
        var divChild = document.createElement("div");
        var divSanjiao = document.createElement("div");
        var divChildSpan = document.createElement("span");
        var divChildOtherSpan = document.createElement("span");
        var divChildI = document.createElement("i");
        div.setAttribute("id", "Veintc_tip");
        div.setAttribute("style", 'width:' + width + 'px;height:' + height + 'px;background:rgba(0,0,0,0);position:absolute;left:' + left + 'px;top:' + top + 'px;z-index:-1;');
        divChild.setAttribute("id", "Veintc_tip_child");
        divChild.setAttribute("style", 'width:auto;height:20px;background:#1b2025;position:absolute;left:0px;top:-30px;border-radius:2px;white-space: nowrap');
        divSanjiao.setAttribute("id", "Veintc_tip_sanjiao");
        divSanjiao.setAttribute("style", 'width:0;height:0;position:absolute;left:10px;bottom: -9px;border-left: 8px solid transparent;border-right: 8px solid transparent;border-top: 10px solid #1b2025;');
        divChildSpan.setAttribute("id", "Veintc_tip_child_fs");
        divChildSpan.setAttribute("style", "color:#aab0c1;font-size:12px;margin-left: 10px;");
        divChildOtherSpan.setAttribute("id", "Veintc_tip_child_ss");
        divChildOtherSpan.setAttribute("style", "color:#aab0c1;font-size:12px;");
        divChildI.setAttribute("style", "display:inline-block;margin-left:10px;margin-right:10px;width:1px;height:9px;background:#aab0c1;");
        divChild.appendChild(divChildSpan);
        divChild.appendChild(divChildI);
        divChild.appendChild(divChildOtherSpan);
        divChild.appendChild(divSanjiao);
        div.appendChild(divChild);
        document.body.appendChild(div);
        document.getElementById("Veintc_tip").addEventListener('click', (event) => {
            event.stopPropagation();
            console.log(xPathBack.framePath)
            //destory();
            // this._destory();
            callback(xPathBack)
            isVeintc_tipClick = true;

        })
    },
    _initEcho: function (obj) {
        let left = offset(obj).offsetLeft;
        let top = offset(obj).offsetTop;
        let width = obj.clientWidth;
        let height = obj.clientHeight;
        var div = document.createElement("div");
        div.setAttribute("class", "echo_tip");
        div.setAttribute("style", 'width:' + width + 'px;height:' + height + 'px;background:rgba(0,0,0,0);position:absolute;left:' + left + 'px;top:' + top + 'px;z-index:9999999999999;');
        document.body.appendChild(div);
        return div;
    },
    start: function (obj, iframe) {
        let self = this;
        var t = self.$("Veintc_tip");
        if (typeof (t) === undefined || t === null) tip._init(obj)
        else {
            let left, top,
                tip_child = document.getElementById("Veintc_tip_child"),
                tip_sanjiao = document.getElementById("Veintc_tip_sanjiao");
            if (typeof iframe == "undefined") {
                left = offset(obj).offsetLeft;
                top = offset(obj).offsetTop;
            } else {
                left = offset(obj).offsetLeft + offset(iframe).offsetLeft;
                top = offset(obj).offsetTop + offset(iframe).offsetTop;

            }
            t.style.width = obj.offsetWidth + 'px'
            t.style.height = obj.offsetHeight + 'px'
            t.style.left = left + 'px'
            t.style.top = top + 'px';
            t.style.backgroundColor = 'rgba(99,201,68,0.7)'
            // console.log(t)
            if (left > 650) {
                tip_child.style.left = "initial";
                tip_child.style.right = "0px";
                tip_sanjiao.style.left = "initial";
                tip_sanjiao.style.right = "10px";
            } else {
                tip_child.style.right = "initial";
                tip_child.style.left = "0px";
                tip_sanjiao.style.right = "initial";
                tip_sanjiao.style.left = "10px";
            }
            if (top < 70) {
                tip_child.style.top = "initial";
                tip_child.style.bottom = "-30px";
                tip_sanjiao.style.bottom = "initial";
                tip_sanjiao.style.top = "-9px";
                tip_sanjiao.style.borderTop = "none";
                tip_sanjiao.style.borderBottom = "10px solid #1b2025";
            } else {
                tip_child.style.bottom = "initial";
                tip_child.style.top = "-30px";
                tip_sanjiao.style.top = "initial";
                tip_sanjiao.style.bottom = "-9px";
                tip_sanjiao.style.borderBottom = "none";
                tip_sanjiao.style.borderTop = "10px solid #1b2025";
            }
        }

    },
    startEcho: function (obj) {
        var t = tip._initEcho(obj);
        t.style.width = obj.offsetWidth + 'px'
        t.style.height = obj.offsetHeight + 'px'
        t.style.left = offset(obj).offsetLeft + 'px'
        t.style.top = offset(obj).offsetTop + 'px';
        t.style.boxSizing = "border-box";
        t.style.border = "3px solid red";
        return t;

    },
    _destory: function () {
        try {

            document.getElementById("Veintc_tip").remove();
        } catch (e) {

        }
    }
}
var ipcRenderer = require('electron').ipcRenderer;
var isframe = false;
//添加once方法
function once(dom, event, callback) {
    var handle = function (e) {
        e.stopPropagation();
        callback(e);
        dom.removeEventListener(event, handle);
    }
    dom.addEventListener(event, handle)
    return handle;
}
var fnHighlignt = function (event) {
    // console.log(event);
    bodyScrollTop = document.body.scrollTop;
    event.stopPropagation();
    var isThisEventTargetWidthIsNull = false;
    if (!isframe) {
        //console.log(1)
        tip.start(event.target);
    } else {
        tip.start(event.target, document.evaluate(xPathBack.framePath, document).iterateNext());
    }
    if (event.target.id != "Veintc_tip" && event.target.id != "Veintc_tip_child") {

        xPathBack.single = readXPath(event.target);
        xPathBack.hasId = readXPathHasId(event.target);

        if (event.target.tagName.toLowerCase() == "iframe" && isframe == false) {
            isframe = true;
            event.target.contentWindow.document.querySelector("*").addEventListener('mousemove', fnHighlignt)
            once(event.target, "mouseout", function () {
                isframe = false;
                event.target.contentWindow.document.querySelector("*").removeEventListener('mousemove', fnHighlignt)

            })
            xPathBack.framePath = xPathBack.single;

        }
        //寻找相似元素
        //xPathBack.alike =readXPathAlike(event.target,false,true);
        // console.log(xPathBack.single)
        xPathBack.alike = readXPathAlike(xPathBack.single, xPathBack.single, true);
        xPathString.targetNodeName = event.target.nodeName.toLowerCase();
        // console.log("targetNode:" + xPathString.targetNodeName);
        xPathString.xpath = xPathBack.single.replace("//*", "");
        if (event.target.offsetWidth == 0 || event.target.offsetWidth == '') {
            // alert(11);
            // console.log("come from parent node:" + event.target.parentNode);
            //console.log(event.target.parentNode);
            if (!isframe) {
                tip.start(event.target.parentNode);
            } else {
                tip.start(event.target.parentNode, document.evaluate(xPathBack.framePath, document).iterateNext());
            }
            isThisEventTargetWidthIsNull = true;
        } else {
            if (!isframe) {
                tip.start(event.target);
            } else {
                tip.start(event.target, document.evaluate(xPathBack.framePath, document).iterateNext());
            }
        }

    }
    document.getElementById("Veintc_tip").style.zIndex = -1;
    document.getElementById("Veintc_tip_child").querySelector("span").innerText = '';
    var thisEvent = event;
    clearTimeout(mouseMoveTimer);

    mouseMoveTimer = setTimeout(function () {

        document.getElementById("Veintc_tip_child_fs").innerText = xPathString.targetNodeName;
        document.getElementById("Veintc_tip_child_ss").innerText = xPathString.xpath;
        document.getElementById("Veintc_tip").style.zIndex = 9999999999999;

        switch (xPathString.targetNodeName) {
            case "a":
                document.getElementById("Veintc_tip_child_fs").style.color = "#F34235";
                break;
            case "input":
                document.getElementById("Veintc_tip_child_fs").style.color = "#8AC249";
                break;
            case "button":
                document.getElementById("Veintc_tip_child_fs").style.color = "#9B26AF";
                break;
            case "div":
                document.getElementById("Veintc_tip_child_fs").style.color = "#FCD734";
                break;
            default:
                document.getElementById("Veintc_tip_child_fs").style.color = "#00ABC0";
                break;
        }

    }, 100);
    event.target.removeEventListener('click', domClick);
    event.target.addEventListener('click', domClick);
}

function init() {
    document.querySelector("*").addEventListener('mousemove', fnHighlignt);
}

function destory() {
    //移除事件监听
    document.querySelector("*").removeEventListener('mousemove', fnHighlignt)
    document.querySelector("*").removeEventListener('click', domClick)
    tip._destory();
    // window.location.reload();
}
function domClick(e) {
    console.log(e);
    e.stopPropagation();
    let xpath = readXPath(e.target);
    callback(xPathBack)
    isVeintc_tipClick = true;
    destory();
    return false;
}
function isNotAllUndefined(sibling, element) {
    return typeof (sibling.getAttribute("class")) != "undefined" && typeof (element.getAttribute("class")) != "undefined" || typeof (sibling.getAttribute("name")) != "undefined" && typeof (element.getAttribute("name")) != "undefined"
}

function isNotAllNull(sibling, element) {
    return (sibling.getAttribute("class")) != null && (element.getAttribute("class")) != null || (sibling.getAttribute("name")) != null && element.getAttribute("name") != null
}

function isHiveAttr(sibling, element) {
    try {
        sibling.getAttribute("class");
        element.getAttribute("class");
        sibling.getAttribute("name");
        sibling.getAttribute("name");

    } catch (e) {
        return false;
    }
    return true;
}
function readXPathAlike(xpath, cpath, init) {
    let index = cpath.search(/\d/);
    //console.log(index)
    if (index == -1) return xpath;
    let num = cpath.charAt(index);
    let i = 2;
    let xp = xpath.substring(0, index + i);
    while (xp[xp.length - 1] != ']') {
        xp = xpath.substring(0, index + ++i);
    }
    let qiancp = cpath.substring(0, index);
    let qianxp = xpath.substring(0, index);
    let houxp = xpath.substring(index + 1, xpath.length);
    var siblings = [];
    var n = document.evaluate(xp, document).iterateNext().parentNode.firstChild;
    for (; n; n = n.nextSibling) {
        if (n.nodeType === 1) {
            siblings.push(n);
        }
    }
    let isNull = false;
    for (let i = 1; i <= siblings.length; i++) {
        //console.log(siblings.length)
        if (siblings.length == 1) {
            isNull = true;
            break;
        }
        // if (siblings.length == 12) {
        //     console.log(document.evaluate(qianxp + i + houxp, document).iterateNext(), i, qianxp + i + houxp)
        // }
        if (i == parseInt(num)) continue;
        if (document.evaluate(qianxp + i + houxp, document).iterateNext() == null) {
            if (i < num || i == 2) isNull = true;
            break;
        }
    }
    cpath = qiancp + "_" + houxp
    if (isNull) return arguments.callee(xpath, cpath, false);
    else return qianxp + "$***$" + houxp;
}
/**
 * @param xpath div[1]/div[$***$]/div[1]
 * @param cpath div[1]/div[1]/div[1]
 */
function unLockXPathAlike(xpath) {
    let index = xpath.indexOf('$***$');

    let cp = xpath.substring(0, index) + "1]";
    let qianxp = xpath.substring(0, index); //div[1]/div[
    let houxp = xpath.substring(index + 5, xpath.length);//]/div[1]
    var siblings = [];
    var n = document.evaluate(cp, document).iterateNext().parentNode.firstChild;
    for (; n; n = n.nextSibling) {
        if (n.nodeType === 1) {
            siblings.push(n);
        }
    }
    return qianxp + "$*" + siblings.length + "*$" + houxp;
}
// function readXPathAlike(xpath, cpath, init) {
//     let index = cpath.search(/\d/);
//     if (index == -1) return xpath;
//     let num = cpath.charAt(index);
//     let i = 2;
//     let xp = xpath.substring(0, index + i);
//     while (xp[xp.length - 1] != ']') {
//         xp = xpath.substring(0, index + ++i);
//     }
//     let qiancp = cpath.substring(0, index);
//     let qianxp = xpath.substring(0, index);
//     let houxp = xpath.substring(index + 1, xpath.length);
//     var siblings = [];
//     var n = document.evaluate(xp, document).iterateNext().parentNode.firstChild;
//     for (; n; n = n.nextSibling) {
//         if (n.nodeType === 1) {
//             siblings.push(n);
//         }
//     }
//     let isNull = false;
//     for (let i = 1; i <= siblings.length; i++) {
//         if (siblings.length == 1 && i == parseInt(num)) {
//             isNull = true;
//         }
//         if (i == parseInt(num)) continue;
//         if (document.evaluate(qianxp + i + houxp, document).iterateNext() == null) {
//             isNull = true;
//             break;
//         }
//     }
//     cpath = qiancp + "_" + houxp
//     if (isNull) return arguments.callee(xpath, cpath, false);
//     else return qianxp + "$*" + siblings.length + "*$" + houxp;
// }
// function readXPathAlike(element,init,first){
//     //这里需要主要字符串转译问题，可参考js动态生成html时字符串和变量转译（注意引号的作用）
//     if (element == document.body) { //递归到body处，结束递归
//         return '/html/' + element.tagName.toLowerCase();
//     }
//     var isFinded=false |init;
//     var ix = 1, //在nodelist中的位置，且每次点击初始化
//         siblings = element.parentNode.childNodes; //同级子元素
//     let flag=0;
//     for (var i = 0, l = siblings.length; i < l; i++) {
//         var sibling = siblings[i];
//         //如果这个元素是siblings数组中的元素，则执行递归操作
//         if(isFinded==true){
//             if (sibling == element ) {
//                 return arguments.callee(element.parentNode,isFinded,false) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
//                 //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
//             } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
//                 ix++;
//             }
//         }else{
//             //通过class 与name 相匹配
//             if(isHiveAttr(sibling,element)&&sibling.getAttribute("class") == element.getAttribute("class") && sibling.getAttribute("name") == element.getAttribute("name")&&isNotAllUndefined(sibling,element)&&isNotAllNull(sibling,element)&&sibling != element){
//                 console.log(sibling.getAttribute("class"))
//                 isFinded=true;
//                 return arguments.callee(element.parentNode,isFinded,false) + '/' + element.tagName.toLowerCase() + '[$**$]';
//             }else{
//                 if (sibling == element ) {
//                     flag=ix;
//                     //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
//                 } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
//                     ix++;
//                 }
//             }
//         }
//     }
//     if(flag!=0){
//         let ret=arguments.callee(element.parentNode,isFinded,false) 
//         if(siblings.length>1&&ret.indexOf('$**$')==-1&&first){
//             ret+= '/' + element.tagName.toLowerCase() + '[$**$]';
//         }else{
//             ret+= '/' + element.tagName.toLowerCase() + '[' + (flag) + ']';
//         }
//         //else{
//         //     ret = null
//         // }
//         return ret;
//     }
// }
function readXPath(element) {
    //暂时废弃
    
    //这里需要主要字符串转译问题，可参考js动态生成html时字符串和变量转译（注意引号的作用）
    if (element.tagName.toLowerCase() == "html") {
        return '/html';
    }
    if (element == document.body || element.tagName.toLowerCase() == "body") { //递归到body处，结束递归
        return '/html/' + element.tagName.toLowerCase();
    }
    var ix = 1, //在nodelist中的位置，且每次点击初始化
        siblings = element.parentNode.childNodes; //同级子元素

    for (var i = 0, l = siblings.length; i < l; i++) {
        var sibling = siblings[i];
        //如果这个元素是siblings数组中的元素，则执行递归操作
        if (sibling == element) {
            return arguments.callee(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
            //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
        } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
            ix++;
        }
    }
}

function readXPathHasId(element) {
    //暂时废弃
    if (element.id != '') { //判断id属性，如果这个元素有id，则显示//*[@id='xPath']形式内容
        return '//*[@id=\"' + element.id + '\"]';
    }
    //这里需要主要字符串转译问题，可参考js动态生成html时字符串和变量转译（注意引号的作用）
    if (element == document.body) { //递归到body处，结束递归
        return '/html/' + element.tagName.toLowerCase();
    }
    var ix = 1, //在nodelist中的位置，且每次点击初始化
        siblings = element.parentNode.childNodes; //同级子元素

    for (var i = 0, l = siblings.length; i < l; i++) {
        var sibling = siblings[i];
        //如果这个元素是siblings数组中的元素，则执行递归操作
        if (sibling == element) {
            return arguments.callee(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
            //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
        } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
            ix++;
        }
    }
}

function echo(obj) {
    //回显
    if (obj == null) return;
    var echoDom = tip.startEcho(obj);
    echoTimer = setInterval(function () {
        if (echoDom.style.border == "none") {
            echoDom.style.border = "3px solid red";
        } else {
            echoDom.style.border = "none";
        }
    }, 300);

}

function callback(args) {
    ipcRenderer.sendToHost(args);
}

ipcRenderer.on('start', function (event, message) {
    console.log(event, message)
    init();
});
frameInit = function (obj) {
    let left = offset(obj).offsetLeft;
    let top = offset(obj).offsetTop;
    let width = obj.clientWidth;
    let height = obj.clientHeight;
    let div = document.createElement("div");
    let divChild = document.createElement("div");
    let divSanjiao = document.createElement("div");
    let divChildSpan = document.createElement("span");
    let divChildOtherSpan = document.createElement("span");
    let divChildI = document.createElement("i");
    div.setAttribute("class", "Veintc_tip");
    div.setAttribute("style", 'width:' + width + 'px;height:' + height + 'px;background:rgba(99,201,68,0.7);position:absolute;left:' + left + 'px;top:' + top + 'px;z-index:999999999999999999999999999;');
    divChild.setAttribute("class", "Veintc_tip_child");
    divChild.setAttribute("style", 'width:auto;height:20px;background:#1b2025;position:absolute;left:0px;top:-30px;border-radius:2px;white-space: nowrap');
    divSanjiao.setAttribute("class", "Veintc_tip_sanjiao");
    divSanjiao.setAttribute("style", 'width:0;height:0;position:absolute;left:10px;bottom: -9px;border-left: 8px solid transparent;border-right: 8px solid transparent;border-top: 10px solid #1b2025;');
    divChildSpan.setAttribute("class", "Veintc_tip_child_fs");
    divChildSpan.setAttribute("style", "color:#BBABC0;font-size:12px;margin-left: 10px;");
    divChildOtherSpan.setAttribute("class", "Veintc_tip_child_ss");
    divChildOtherSpan.setAttribute("style", "color:#aab0c1;font-size:12px;");
    divChildI.setAttribute("style", "display:inline-block;margin-left:10px;margin-right:10px;width:1px;height:9px;background:#aab0c1;");
    divChild.appendChild(divChildSpan);
    divChildSpan.innerHTML = "iframe"
    divChild.appendChild(divChildI);
    divChild.appendChild(divChildOtherSpan);
    divChildOtherSpan.innerHTML = readXPath(obj)
    divChild.appendChild(divSanjiao);
    div.appendChild(divChild);
    document.body.appendChild(div);
    once(div, 'click', (event) => {
        event.stopPropagation();
        xPathBack.single = readXPath(obj);
        let src = obj.src.indexOf("http") > -1 && obj.src.indexOf("http") == 0 ? obj.src : window.location.origin + obj.src;
        xPathBack.iframeSrc = src;
        // xPathBack.windowOrigin = window.location.origin;
        callback(xPathBack);
        let objList = document.getElementsByClassName("Veintc_tip");
        for (let i = 0; i < objList.length; i++) {
            objList[i].remove();
        }
        isVeintc_tipClick = true;
    })
}
ipcRenderer.on('iframe', function (event, message) {
    console.log(event, message)
    iframeList = document.querySelectorAll("iframe")
    if (iframeList.length == 0) {
        callback()
    } else {
        iframeList.forEach(element => {
            frameInit(element)
        });
    }
});
ipcRenderer.on('stop', function (event, message) {
    console.log(event, message);
    destory();
});
ipcRenderer.on('echo-start', function (event, message) {
    console.log("回显中");
    if (Object.prototype.toString.call(message) === '[object Array]') {
        //todo
        message = unLockXPathAlike(message[0])
        let xpaths = [];
        let num = message.substring(message.indexOf("$*") + 2, message.indexOf("*$"))
        for (let i = 1; i <= parseInt(num); i++) {
            xpaths.push(message.substring(0, message.indexOf("$*")) + i + message.substring(message.indexOf("*$") + 2, message.length))
        }
        xpaths.forEach(xpath => {
            echo(document.evaluate(xpath, document).iterateNext());
        });
    } else {
        echo(document.evaluate(message, document).iterateNext());
    }
    // document.evaluate(message, document).iterateNext();
})
ipcRenderer.on('echo-stop', function (event, message) {
    console.log("取消回显");
    clearInterval(echoTimer);
    let ts = document.getElementsByClassName("echo_tip");
    let length = ts.length;
    for (let i = 0; i < length; i++) {
        ts[0].remove();
    }
})
ipcRenderer.on('operate', function (event, message) {
    console.log(message)
    let ret = {};
    ret.id = message.id;
    let xp = message.xpath;
    let isRet = true;
    if (typeof message.isBack != "undefined" && message.isBack == false) {
        isRet = false;
    }
    switch (message.type) {
        case "InnerHTML": //获取页面元素内容
            ret.context = util.getText(document.evaluate(xp, document).iterateNext())
            break;
        case "getList": //获取列表内容
            ret.context = util.getList(document.evaluate(xp, document).iterateNext())
            break;
        case "getTable": //获取表格内容
            ret.context = util.getTable(document.evaluate(xp, document).iterateNext())
            break;
        case "resemblance": //获取相似元素内容
            ret.context = util.resemblance(document.evaluate(xp, document).iterateNext())
            break;
        case "openIframe"://打开框架 iframe
            if (message.isOpenNewWindow) {
                window.open(message.src);
            } else {
                window.location.href = message.src
            }
            break;
        case "url"://加载网址
            if (typeof message.url != "undefined" && message.url != "") {
                window.location.href = message.url;
            }
            break;
        case "historyBack"://网页后退
            window.history.back();
            break;
    }
    if (isRet) {

        callback(ret);
    }

});

function countScroll(el) {
    let inEl = el;
    let doEl = inEl;
    let els = [];
    while (doEl.parentNode.localName != "html") {
        els.push(doEl.parentNode);
        doEl = doEl.parentNode;
    }
    return els;
}

function loadScriptString(code) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    try {
        script.appendChild(document.createTextNode(code));
    } catch (ex) {
        script.text = code;
    }
    document.body.appendChild(script);
}
onload = function () {
    loadScriptString(`
        window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
            var info = "错误信息：" + errorMessage + "</br>" +
                "出错文件：" + scriptURI + "</br> " +
                "出错行号：" + lineNumber + "</br>" +
                "出错列号：" + columnNumber + "</br>" +
                "错误详情：" + errorObj + "</br></br>";
            console.log(info);
            return false;
        }
        window.alert1=window.alert 
        window.alert = function (data) {
            console.log(data)
        }
        window.confirm = function(data){
            return true;
        }
    `)
}