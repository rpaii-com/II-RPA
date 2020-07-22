var ipcRenderer = require('electron').ipcRenderer;
var tesseract = require('node-tesseract');

var fs = require('fs');
const exec = require('child_process').exec;
var ret = {
    code: "200",
    msg: null,
    context: {},
    action: null
}
//tesseract 变量
var options = {
    l: 'eng',
    psm: 7

};
var verify = {
    _emptyStr: function (str) {
        return str == null || str == "" || str == undefined
    },
    _trim: function (str) {
        return str == null ? null : str.replace(/(^\s*)|(\s*$)/g, "");
    },

    _converSpecialStr: function (str) {
        if (!this._emptyStr) {
            str = str.replace(/\t/, "    ")
        }
        return str;
    },

    //是否匹配正则
    _stringRegMatch: function (str, regStr) {
        if (this._emptyStr(str) || this._emptyStr(regStr)) {
            return false;
        }

        var pattern = new RegExp(regStr);
        return pattern.test(str);
    },

    /**
    base64加密函数
    **/
    _base64Encode: function (input) {
        var rv;
        rv = encodeURIComponent(input);
        rv = unescape(rv);
        rv = window.btoa(rv);
        return rv;
    },

    /**
    base64解密函数
    **/
    _base64Decode: function (input) {
        rv = window.atob(input);
        rv = escape(rv);
        rv = decodeURIComponent(rv);
        return rv;
    },
    _isJsonObj: function (obj) {
        return typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    },
    /**
     * 获取子元素
     * @param {*} el 
     * @param {*} name 
     */
    _children: function (el, name) {
        var ret = []
        var arr = el.children;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].tagName == name) ret.push(arr[i])
        }
        return ret
    },
    _getTable: function (el) {
        if (el.tagName == "TABLE") return el;
        else if (el.parentNode.tagName == "TABLE") return el.parentNode;
        else if (el.parentNode.tagName == "HTML") return null;
        else return this._getTable(el.parentNode);
    },
    _unLockXPathAlike: function (xpath) {
        let index = xpath.indexOf('$***$');
        let i = 1;
        let goCp = xpath.substring(0, index);
        let cp = xpath.substring(0, index) + "1]";
        let houxp = xpath.substring(index + 6, xpath.length);//]/div[1]
        var siblings = [];
        var xpaths = [];
        var n = document.evaluate(cp, document).iterateNext().parentNode.firstChild;
        for (; n; n = n.nextSibling) {
            if (n.nodeType === 1) {
                if (document.evaluate(goCp + i + "]" + houxp, document).iterateNext() == null) continue;
                xpaths.push(goCp + i + "]" + houxp)
                siblings.push(document.evaluate(goCp + i++ + "]" + houxp, document).iterateNext());
            }
        }
        return { el: siblings, xpaths: xpaths };
    }


}
var util = {
    isText: true,
    openIframe: function (el, jsonObject) {
        var openNew = !jsonObject.openNew;
        var src = el.getAttribute("src");
        if (src.indexOf("http") == -1) {
            var host = window.location.host;
            var protocol = window.location.protocol;
            src = protocol + "//" + host + src;
        };
        try {
            chrome.runtime.sendMessage({ href: src });

        } catch (error) {

        }

        if (openNew) {
            window.open(src);
        } else {
            window.location.href = src;
        };

        return;
    },
    getElePosition: function (el, jsonObject) {
        if (!el) return '';
        var result = el.getBoundingClientRect();

        return result;
    },
    focus: function (el) {
        if (el) {
            el.focus();
            el.value = "";
        }
    },

    input: function (el, Value) {
        if (el) {
            el.focus();

            let tagName = el.nodeName.toLowerCase();
            if (tagName == "input" || tagName == "textarea" || tagName == "select") {
                el.value = Value;
            } else {
                el.innerText = el.innerText + Value
            }
            this.triggerKeyEVent(el, 'focus');
            this.triggerKeyEVent(el, 'keydown');
            this.triggerKeyEVent(el, 'keyup');
            this.triggerKeyEVent(el, 'keypress');
            this.triggerKeyEVent(el, 'change');
            this.triggerKeyEVent(el, 'blur');
        }
    },

    click: function (el) {
        if (el) {
            el.focus();
            el.click();
        }
    },

    check: function (el) {
        if (el && !el.checked) {
            el.focus();
            el.click();
        }
    },

    uncheck: function (el) {
        if (el && el.checked) {
            el.focus();
            el.click();
        }
    },

    /**
     * 获取a,imag超链接
     */
    getLink: function (el) {
        if (el) {
            return el.href || el.src;
        }
        return '';
    },

    getText: function (el) {
        if (!el) return '';
        return util.isText == true || util.isText == "true" || util.isText == "text" || typeof (util.isText) == "undefined" ? (el.outerText || el.value) : el.outerHTML;
    },

    getCode: function (el) {
        if (!el) return '';
        return el.outerHTML.replace(/\r/g, "").replace(/\n/g, "").replace(/\t/g, "")
    },

    /**
     * 获取元素坐标
     */
    getPosition: function (el, iframeSrc, parentNode) {
        if (!el) return "-1";
        el.scrollIntoViewIfNeeded();
        let { left, top, width, height } = el.getBoundingClientRect();
        if (iframeSrc) {
            let frameOffset = CsCodeInspect.iframe.getIframeRootPosi(iframeSrc);
            if (frameOffset) {
                left += frameOffset.left;
                top += frameOffset.top;
            }
        }
        let centerX = left + 1 / 2 * width;
        let centerY = top + 1 / 2 * height;
        return {
            x: String(centerX),
            y: String(centerY)
        };
    },
    hover: function (el) {
        var id = 'simulatedStyle' + new Date().getTime();
        var styleText = "";
        var generateEvent = function (selector) {
            var style = "";
            for (var i in document.styleSheets) {
                var rules = document.styleSheets[i].cssRules;
                for (var r in rules) {
                    if (rules[r].cssText && rules[r].selectorText) {
                        if (rules[r].selectorText.indexOf(selector) > -1) {
                            var regex = new RegExp(selector, "g")
                            var text = rules[r].cssText.replace(regex, "");
                            var arr = text.split(";");
                            for (var i = 0; i < arr.length - 1; i++) {
                                arr[i] += "!important"
                            }
                            style += arr.join(";") + "\n";
                        }
                    }
                }
            }
            return style;
        };
        var wash = function (style) {
            var classArr = el.className == "" ? "" : el.className.split(" ");
            var id = el.id;
            var styleArr = [];
            if (classArr != "") {
                classArr.forEach(e => {
                    style.forEach(ee => {
                        if (ee.includes("." + e)) {
                            styleArr.push(ee)
                        }
                    })
                })
            }
            if (id != "") {
                style.forEach(ee => {
                    if (ee.includes('#' + id)) {
                        styleArr.push(ee)
                    }
                })
            }
            return styleArr.join("\n");

        }
        var styleChild = document.createElement('style');
        el.onmouseenter = function () {
            styleChild.id = id;
            styleChild.type = 'text/css';
            styleChild.innerHTML = styleText;
            el.appendChild(styleChild);
        }
        el.onmouseout = function () {
            var thisNode = document.getElementById(id);
            try {
                el.removeChild(thisNode);
            } catch (e) {

            }
        };
        styleText = generateEvent(":hover");
        styleText = wash(styleText.split("\n"))
        return el
    },
    optionClick: function (el, value) {
        if (!el) return;

        let array = this.getTagNameCollection(el, "option");
        if (array == null || array.length == 0) {
            return;
        }

        for (var item = 0; item < array.length; item++) {
            var itemText = verify._trim(array[item].outerText);
            if (itemText == value) {
                el.focus();
                array[item].selected = true;
                array[item].focus();
                array[item].click();
                this.triggerEvent(el, 'change');
            }
        }
    },
    /**
     * 判断某个元素有无在页面中可见
     */
    isDisplayed: function (el) {
        if (!el) return "-1";
        let node = el;
        while (node && node.nodeType == 1) {
            let display = getComputedStyle(node)["display"];
            if (display == '' || display == 'none')
                return "-1";
            node = node.parentNode;
        }
        return 1;
    },
    //根据传入 eventName 触发相应事件
    triggerEvent: function (el, eventName) {
        if (el.fireEvent) { // < IE9
            (el.fireEvent('on' + eventName));
        } else {
            console.log(el)
            var evt = document.createEvent('Events');
            evt.initEvent(eventName, true, false);
            el.dispatchEvent(evt);
        }
    },
    triggerKeyEVent: function (el, eventName) {
        var eventObj = document.createEventObject ?
            document.createEventObject() : document.createEvent("Events");
        if (eventObj.initEvent) {
            eventObj.initEvent(eventName, true, true);
        }
        eventObj.keyCode = 37;
        eventObj.which = 37;
        el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("on" + eventName, eventObj);
    },
    /**
     * 获取元素el下元素tag=tagname的所有元素
     */
    getTagNameCollection: function (el, tagName) {
        if (el == null || verify._emptyStr(tagName)) {
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
            return "-1";
        }

        for (var item = 0; item < array.length; item++) {
            var itemText = verify._trim(array[item].outerText);
            switch (type) {
                case "all":
                    if (itemText == value) {
                        el.focus();
                        array[item].selected = true;
                        array[item].focus();
                        array[item].click();
                        this.triggerEvent(el, 'change');
                        return "1";
                    }
                    break;
                case "like":
                    // alert(1)
                    if (itemText.indexOf(value) > -1) {
                        el.focus();
                        array[item].selected = true;
                        array[item].focus();
                        array[item].click();
                        this.triggerEvent(el, 'change');
                        return "1";
                    }
                    break;
                case "php":
                    if (verify._stringRegMatch(itemText, value)) {
                        el.focus();
                        array[item].selected = true;
                        array[item].focus();
                        array[item].click();
                        this.triggerEvent(el, 'change');
                        return "1";
                    }
                    break;
            }

        }
        return "-1";
    },
    /**
     * 获取列表内容
     */
    /**
     * getList:function(el){
      let arry=[]
      let array=[]
      let map={}
      if(el.tagName=='UL'||el.tagName=='OL'){
          arry=verify._children(el,'LI');
          if(arry.length==0) return {};
           for(let i=0;i<arry.length;i++){
              array.push(this.getList(arry[i]));
          }
          return array;
      }else if(el.tagName=='LI'){
          arry=verify._children(el,'UL')||verify._children(el,'OL');
          if(arry.length==0) {
              return el.innerText.trim().split(" ")[0];
          }
          for(let i=0;i<arry.length;i++){
              map[el.innerText]=(this.getList(arry[i]));
          }
          
          return map;
  
      }
     */
    getList: function (el) {
        let arry = []
        let array = []
        let map = {}
        if (el.tagName == 'UL') {
            arry = verify._children(el, 'LI');
            if (arry.length == 0) return {};
            for (let i = 0; i < arry.length; i++) {
                array.push(this.getList(arry[i]));
            }
            return array;
        } else if (el.tagName == 'LI') {
            arry = verify._children(el, 'UL');
            if (arry.length == 0) {
                return util.getText(el).trim();
            }
            for (let i = 0; i < arry.length; i++) {
                map[util.getText(el)] = (this.getList(arry[i]));
            }

            return map;

        }

    },
    /**
     * 获取表格内容
     */
    getTable: function (el) {
        let row = el.rows;
        let names = []
        let ret = [];
        for (let i = 0; i < row.length; i++) {
            if (row[i].tagName === "TH") {
                let td = verify._children(row[i], "TD");
                for (let j = 0; j < td.length; j++) {
                    names.push(util.getText(td[j]))
                }
            } else if (row[i].tagName === "TR") {
                let td = verify._children(row[i], "TD");
                let tds = [];
                let map = {}
                for (let j = 0; j < td.length; j++) {
                    if (names.length == 0) {
                        tds[j] = util.getText(td[j])
                    } else {
                        map[names[j]] = util.getText(td[j])
                    }
                }
                if (names.length == 0) {
                    ret.push(tds)
                } else {
                    ret.push(map)

                }

            }
        }
        return ret;
    },
    resemblance: function (el) {
        var ret = []
        try {

            el.forEach(element => {
                ret.push(util.getText(element))
            });
            return ret;

        } catch (err) {
            ret.code = 500;
            ret.msg = err
            ret.context = null;
            common._callback(ret);
        }
        return null;
    },
    // 获取验证码
    getVerificationCode: function (imgName, callback, key) {
        ret.action = "getVerificationCode"
        console.log("getVerificationCode");
        console.log("tesseratc " + imgName + " result -l eng -psm 7");
        exec("tesseract " + imgName + " result -l eng -psm 7", { encoding: 'binary' }, (error, stdout, stderr) => {
            if (error) {
                ret.code = 500;
                ret.msg = error
                ret.context = null;
                //callback(ret);
                return callback(ret);
            }
            var result = fs.readFileSync('result.txt', 'UTF-8');
            console.log("结果：  ————————————————————————" + result);

            ret.code = 200;
            ret.msg = null;
            ret.context = {}
            ret.context[key] = result;
            callback(ret);
        });
        // tesseract.process(imgName, options, function (err, text) {
        //     console.log("aha");
        //     if (err) {
        //         ret.code = 500;
        //         ret.msg = err
        //         ret.context = null;
        //         callback(ret);
        //     } else {
        //         ret.code = 200;
        //         ret.msg = null;
        //         ret.context = {}
        //         ret.context[key] = text;
        //         callback(ret);
        //     }
        // });
    },
    // img对像用canvas保存
    getCanvasImag: function (el, savePath, imgName, getCode, callback, key) {
        ret.action = "saveImg"
        if (typeof (imgName) == "function" || typeof imageName == "string" && imgName[0] == ".") {
            key = callback;
            callback = getCode;
            getCode = imgName;
            imgName = new Date().getTime() + ".jpg"
        }
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        function imgGo(img) {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);
            var imgData = canvas.toDataURL("image/jpeg");
            var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
            var dataBuffer = new Buffer(base64Data, 'base64');
            console.log(savePath + imgName, fs, dataBuffer)
            fs.writeFileSync(savePath + imgName, dataBuffer, { flag: 'w' });

            console.log("写入验证码图片");
            if (!key) {
                console.log("进入获取");
                getCode(savePath + imgName, callback, key);
            } else {
                ret.code = 200;
                ret.msg = null
                ret.context = null;
                callback(ret) //todo
            }


        }
        _waitCount = 0
        let ss = setInterval(() => {
            let img = common._getElment(el)
            if (!img.currentSrc) {
                clearInterval(ss);
                imgGo(img);
            }
            if (_waitCount++ >= 50) {
                clearInterval(ss);
                ret.code = 500;
                ret.msg = "无法找到元素位置"
                ret.context = null;
                callback(ret);
            }
        }, 100)

    },
    getAttributeName: function (el) {
        var tempObj = el.attributes;
        var ret = {};
        for (const item of tempObj) {
            ret[item.name] = item.value;
        }
        // var ret;
        // ret = JSON.parse(JSON.stringify(el));
        return ret;
    },
    changeAttributeName: function (el, data) {
        let attr = data.attr,
            newAttr = data.newAttr === "false" ? false : '"' + data.newAttr + '"';
        el[attr] = newAttr;
        // return ret;
    },
    classClickString: function (el, data) {
        let className = data.className,
            strObject = data.strObject;

        let itemLists = el.getElementsByClassName(className);
        for (i = 0; i < itemLists.length; i++) {
            console.log(itemLists[i].innerText);

            if (itemLists[i].innerText.indexOf(strObject) > -1) {
                itemLists[i].click();
                break;
            }
        }
        // return ret;
    },

}
var common = {
    _openIframe: function (jsonObject) {
        ret.action = "getElePosition" + getNowFormatDate();
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            util.openIframe(el, jsonObject);
            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    _canGetEle: function (jsonObject) {
        ret.action = "canGetEle" + getNowFormatDate();
        let el = common._getElment(jsonObject);
        var result = "true";
        var key = jsonObject.rename;
        ret.code = 200;
        ret.msg = null;

        if (common._jubyType(el) == null) {
            result = "false";
        };
        ret.context = {};
        ret.context[key] = result;
        common._callback(ret);
    },

    _getElePosition: function (jsonObject) {
        ret.action = "getElePosition" + getNowFormatDate();
        var jsonObjectCopy = jsonObject;
        var xpathList = jsonObject.xpath.split(",");

        var xpath = '';
        var x = 0, y = 82, width, height, result;
        for (var i = 0; i < xpathList.length; i++) {
            if (i > 0) {
                xpath += ("," + xpathList[i]);
            } else {
                xpath = xpathList[i];
            }
            jsonObjectCopy.xpath = xpath;
            var el = common._getElment(jsonObjectCopy);
            if (common._jubyType(el) == null) {
                ret.code = 500;
                ret.msg = "无法找到元素位置";
                break;
            }
            result = util.getElePosition(el, jsonObject);
            if (i == (xpathList.length - 1)) {
                x += result.left + result.width / 2;
                y += result.top + result.height / 2;
                width = result.width;
                height = result.height;
            } else {
                x += result.left;
                y += result.top;
            }

        };
        var result_new = { x: parseInt(x), y: parseInt(y), width: width, height: height };
        ret.code = 200;
        ret.msg = null;
        var key = jsonObject.rename;
        ret.context = {};
        ret.context[key] = result_new;
        common._callback(ret);
    },
    //判断变量是否定义且不为空
    _isNotEmpty: function (value) {
        return !!value;
    },
    _getFrame: function (jsonObject) {
        let el;
        if (common._isNotEmpty(jsonObject.id)) {
            el = document.getElementById(jsonObject.id);
        } else if (common._isNotEmpty(jsonObject.xpath)) {
            let xpathArray = jsonObject.xpath.split(",");
            let xpathContent = [];
            if (xpathArray.length >= 2) {
                let obj = document.evaluate(xpathArray[0], document).iterateNext().contentWindow;
                xpathContent[0] = obj;
                for (let i = 1; i < xpathArray.length; i++) {
                    xpathContent[i] = xpathContent[i - 1].document.evaluate(xpathArray[i], xpathContent[i - 1].document).iterateNext().contentWindow;
                    el = xpathContent[i - 1].document.evaluate(xpathArray[i], xpathContent[i - 1].document).iterateNext().contentWindow.document;
                }
            } else {
                let obj2 = document.evaluate(xpathArray[0], document).iterateNext().contentWindow.document;
                el = obj2;
            }
        } else {
            el = null;
        }

        return el;
    },
    //判断变量为何
    _getElment: function (jsonObject) {
        let el;
        if (common._isNotEmpty(jsonObject.id)) {
            el = document.getElementById(jsonObject.id);
        } else if (common._isNotEmpty(jsonObject.xpath)) {
            let xpathArray = jsonObject.xpath.split(",");
            let xpathContent = [];
            if (xpathArray.length >= 2) {
                let obj = document.evaluate(xpathArray[0], document).iterateNext().contentWindow;
                xpathContent[0] = obj;
                for (let i = 1; i < xpathArray.length; i++) {
                    xpathContent[i] = xpathContent[i - 1].document.evaluate(xpathArray[i], xpathContent[i - 1].document).iterateNext().contentWindow;
                    el = xpathContent[i - 1].document.evaluate(xpathArray[i], xpathContent[i - 1].document).iterateNext();
                }
                // el = obj.document.evaluate(xpathArray[1], obj.document).iterateNext();
            } else {
                if (typeof jsonObject.xpathHasId != 'undefined') {
                    el = document.evaluate(jsonObject.xpathHasId, document).iterateNext();
                } else {
                    el = document.evaluate(jsonObject.xpath, document).iterateNext();
                }
            }
        } else if (common._isNotEmpty(jsonObject.selector)) {
            el = document.querySelector(jsonObject.selector);

        } else if (common._isNotEmpty(jsonObject.xpathAlike)) {
            el = verify._unLockXPathAlike(jsonObject.xpathAlike);

        } else {
            el = null;
        }
        return el;
    },
    //判断变量类型
    _jubyType: function (value) {
        if (value == null) return null;
        return Object.prototype.toString.call(value);
    },
    //回调webview信息
    _callback: function (data) {
        ipcRenderer.sendToHost(data);
    },
    //sleep
    _sleep: function (d) {
        setTimeout(() => {
            ret.action = "sleep" + getNowFormatDate()
            ret.code = 200;
            ret.msg = null;
            common._callback(ret);
        }, d.waitTime);
    },
    //input操作
    _input: function (jsonObject) {
        //jsonObject {'id':'','xpath':'',selector:'','context':''}
        //id xpath selector 三选一填  context 必填
        ret.action = "input" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            util.input(el, jsonObject.input);
            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    //click操作
    _click: function (jsonObject) {

        ret.action = "click" + getNowFormatDate()

        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            //增加判断，mousedown，50毫秒后，mouseup
            if (jsonObject.userGesture == 'mousedown_up') {
                util.triggerEvent(el, 'mousedown');
                setTimeout(() => {
                    util.triggerEvent(el, 'mouseup')
                }, 50)
            } else {
                util.click(el);
            }
            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    //mouseDown操作
    _mouseDown: function (jsonObject) {
        ret.action = "mouseDown"

        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            util.triggerEvent(el, 'mousedown');
            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    //mouseDown或者mouseUp操作
    _mouseDownOrUp: function (jsonObject) {
        ret.action = "mouseDownOrUp"
        // debugger;
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            if (jsonObject.userGesture == "mousedown") {

                util.triggerEvent(el, 'mousedown');
            } else {
                util.triggerEvent(el, 'mouseup');
            }
            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    //获取元素html内容
    _getInnerHTML: function (jsonObject) {
        //jsonObject {'id':'','xpath':'',selector:''}
        //id xpath selector 三选一填
        ret.action = "获取元素内容" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            ret.code = 200;
            ret.msg = null;
            ret.context = {}
            if (jsonObject.getType == "xpath") {
                ret.context[jsonObject.rename] = jsonObject.xpath;
            } else {
                util.isText = jsonObject.getType;
                ret.context[jsonObject.rename] = util.getText(el);
            }
        }
        common._callback(ret);
    },
    //移动鼠标悬浮某元素之上
    _mouseover: function (jsonObject) {
        ret.action = "移动鼠标悬浮某元素之上" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            util.triggerEvent(util.hover(el), "mouseenter");
            util.triggerEvent(el, "mouseover");

            if (el.tagName == "A") {
                util.triggerEvent(util.hover(el.parentNode), "mouseenter");
            }
            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    //选择下拉框内容
    _selectOption: function (jsonObject) {
        ret.action = "选择下拉框内容" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            util.optionClick(el, jsonObject.matchType, jsonObject.matchText);
            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    //获取列表内容
    _selectList: function (jsonObject) {
        ret.action = "获取列表内容" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            ret.code = 200;
            ret.msg = null;
            ret.context = {}
            if (jsonObject.getType == "xpath") {
                ret.context[jsonObject.rename] = jsonObject.xpath;
            } else {
                util.isText = jsonObject.getType;
                ret.context[jsonObject.rename] = util.getList(el);
            }
        }
        common._callback(ret);
    },
    //获取表格内容
    _selectTable: function (jsonObject) {
        ret.action = "获取表格内容" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            el = verify._getTable(el)
            if (common._jubyType(el) == null) {
                ret.code = 500;
                ret.msg = "无法找到表格元素位置"
            } else {
                ret.code = 200;
                ret.msg = null;
                ret.context = {}
                if (jsonObject.getType == "xpath") {
                    ret.context[jsonObject.rename] = jsonObject.xpath;
                } else {
                    util.isText = jsonObject.getType;
                    ret.context[jsonObject.rename] = util.getTable(el);
                }
            }
        }
        common._callback(ret);
    },
    //获取相似元素
    _resemblance: function (jsonObject) {
        ret.action = "获取相似元素" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        ret.code = 200;
        ret.msg = null;
        ret.context = {}
        if (jsonObject.getType == "xpath") {
            ret.context[jsonObject.rename] = el.xpaths;
        } else {
            util.isText = jsonObject.getType;
            ret.context[jsonObject.rename] = util.resemblance(el.el)
        }
        common._callback(ret);
    },
    //获取Verificationcode
    _getVCode: function (jsonObject) {
        ret.action = "获取验证码" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置";
            common._callback(ret);
        } else {
            console.log(jsonObject.rename)
            util.getCanvasImag(jsonObject, "", "verificationCode.jpg", util.getVerificationCode, common._callback, jsonObject.rename);
        }
    },
    //获取Verificationcode
    _saveVCode: function (jsonObject) {
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置";
            common._callback(ret);
        } else {
            util.getCanvasImag(jsonObject, jsonObject.savePath, jsonObject.fileName + ".jpg", util.getVerificationCode, common._callback);
        }
    },
    //获取网页元素属性
    _getAttributeName: function (jsonObject) {
        ret.action = "获取网页元素属性" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        ret.code = 200;
        ret.msg = null;
        ret.context = {}
        ret.context[jsonObject.rename] = util.getAttributeName(el);
        common._callback(ret);
    },
    _changeAttributeName: function (jsonObject) {
        ret.action = "更改网页元素属性" + getNowFormatDate()
        let el = common._getElment(jsonObject);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            util.changeAttributeName(el, jsonObject);

            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    _classClickString: function (jsonObject) {
        ret.action = "更改网页元素属性" + getNowFormatDate()
        let el = common._getFrame(jsonObject);
        console.log(el);
        if (common._jubyType(el) == null) {
            ret.code = 500;
            ret.msg = "无法找到元素位置"
        } else {
            util.classClickString(el, jsonObject);

            ret.code = 200;
            ret.msg = null;
        }
        common._callback(ret);
    },
    //等待某个元素加载出来,最多等待5s，每检测一次等待100ms
    _wait: function (jsonObject, triggerEv) {
        let _waitCount = 0;
        let self = this;
        let ss = setInterval(() => {
            let el = self._getElment(jsonObject);
            if (el != null || el && el.length > 0) {
                triggerEv(jsonObject);
                return clearInterval(ss);
            }
            if (_waitCount++ >= 50) {
                triggerEv(jsonObject);
                clearInterval(ss);
            }
        }, 100)
    },
    //等待某个元素加载出来,最多等待5s，每检测一次等待100ms
    _waitForCallBack: function (jsonObject) {
        let _waitCount = 0;
        let self = this;
        let ss = setInterval(() => {
            let el = self._getElment(jsonObject);
            if (el != null || el && el.length > 0) {
                ret.code = 200;
                ret.msg = null;
                ret.context = {}
                common._callback(ret);
                return clearInterval(ss);
            }
            if (_waitCount++ >= 50) {
                ret.code = 500;
                ret.msg = "无法找到元素位置";
                common._callback(ret);
                clearInterval(ss);
            }
        }, 100)
    },
    _waitFindELe:function (jsonObject) {
        let waitTime=jsonObject.waitTime.length==0?20000:parseInt(jsonObject.waitTime);

        let timeWait=parseInt(waitTime/100);
        let _waitCount = 0;
        let self = this;
        let ss = setInterval(() => {
            let el = self._getElment(jsonObject);
            if (el != null || el && el.length > 0) {
                ret.code = 200;
                ret.msg = null;
                ret.context = {}
                common._callback(ret);
                clearInterval(ss);
            }
            if (_waitCount++ >= timeWait) {
                ret.code = 500;
                ret.msg = "无法找到元素位置";
                common._callback(ret);
                clearInterval(ss);
            }
        }, 100)
    },
}

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var strHour = date.getHours();
    var strMin = date.getMinutes();
    var strSec = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (strHour >= 0 && strHour <= 9) {
        strHour = "0" + strHour;
    }
    if (strMin >= 0 && strMin <= 9) {
        strMin = "0" + strMin;
    }
    if (strSec >= 0 && strSec <= 9) {
        strSec = "0" + strSec;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
        " " + strHour + seperator2 + strMin +
        seperator2 + strSec;
    return currentdate;
}


function action(step) {
    switch (step.type) {
        case 'historyBack':
            window.history.back();
            ret.action = "后退" + getNowFormatDate()
            ret.code = 200;
            ret.msg = null;
            ret.context = null;
            common._callback(ret);
            break;
        case 'pageFresh':
            location.reload();
            ret.action = "刷新" + getNowFormatDate()
            ret.code = 200;
            ret.msg = null;
            ret.context = null;
            common._callback(ret);
            break;
        case 'open':
            window.location.href = step.parameters.url;
            ret.action = "打开网页" + getNowFormatDate()
            ret.code = 200;
            ret.msg = null;
            ret.context = null;
            common._callback(ret);
            break;
        case 'getPageURL':
            let tmp = {
                url: window.location.href,
                uri: window.location.pathname,
                origin: window.location.origin
            }
            ret.action = "获取URL、URI" + getNowFormatDate()
            ret.code = 200;
            ret.msg = null;
            ret.context = {}
            ret.context[step.parameters.rename] = tmp;
            common._callback(ret);
            break;
        case "click":
            // console.log("clcik" + getNowFormatDate())
            // common._wait(step.parameters, common._click)
            common._waitForCallBack(step.parameters);
            break;
        case "mouseDownOrUp":
            console.log("mouseDownOrUp" + getNowFormatDate())
            common._wait(step.parameters, common._mouseDownOrUp)
            break;
        case "inputInfo":
            console.log("inputInfo" + getNowFormatDate())
            common._wait(step.parameters, common._input)
            break;
        case "waitTime":
            common._sleep(step.parameters)
            break;
        case "InnerHTML":
            console.log("InnerHTML" + getNowFormatDate())
            common._wait(step.parameters, common._getInnerHTML)
            break;
        case "mouseover":
            console.log("mouseover" + getNowFormatDate())
            common._wait(step.parameters, common._mouseover)
            break;
        case "selectOption":
            console.log("selectOption" + getNowFormatDate())
            common._wait(step.parameters, common._selectOption)
            break;
        case "getList":
            console.log("getList" + getNowFormatDate())
            common._wait(step.parameters, common._selectList)
            break;
        case "getTable":
            console.log("getTable" + getNowFormatDate())
            common._wait(step.parameters, common._selectTable)
            break;
        case "resemblance":
            console.log("resemblance" + getNowFormatDate())
            common._wait(step.parameters, common._resemblance)
            break;
        case "getVCode":
            console.log("getVCode" + getNowFormatDate())
            common._wait(step.parameters, common._getVCode)
            break;
        case "saveVCode":
            console.log("saveVCode" + getNowFormatDate())
            common._wait(step.parameters, common._saveVCode)
            break;
        case "getAttributeName":
            console.log("getAttributeName" + getNowFormatDate())
            common._wait(step.parameters, common._getAttributeName)
            break;
        case "getElePosition":
            console.log("getElePosition" + getNowFormatDate())
            common._wait(step.parameters, common._getElePosition)
            break;
        case "canGetEle":
            console.log("canGetEle" + getNowFormatDate())
            common._wait(step.parameters, common._canGetEle)
            break;
        case "openIframe":
            console.log("canGetEle" + getNowFormatDate())
            common._wait(step.parameters, common._openIframe)
            break;
        case "changeAttributeName":
            console.log("changeAttributeName" + getNowFormatDate())
            common._wait(step.parameters, common._changeAttributeName)
            break;
        case "classClickString":
            console.log("classClickString" + getNowFormatDate())
            common._classClickString(step.parameters)
            break;
        case "waitFindELe":
            console.log("waitFindELe" + getNowFormatDate())
            common._waitFindELe(step.parameters)
            break;
        default:
            common._callback(step)
            break;
    }
}
ipcRenderer.on('action', function (event, step) {
    console.log(step)
    action(step);
    // let error={}

    // try{
    //   let retCode=action(step);
    //   error.code=retCode==1?200:500;
    //   error.msg=retCode==1?"操作成功":"无法获取元素";
    //   error.action=step.type;
    // }catch(e){
    //   console.log(e)
    //   error.code=500;
    //   error.msg="无法获取元素";
    //   error.action=step.type;
    // }
    // common._callback(error);

});
ipcRenderer.on('callbackFlag', function (event, flag) {
    let error = {}
    error.code = flag ? 200 : 500;
    error.msg = flag ? "操作成功" : "操作失败";
    error.action = "回调标记";
    common._callback(error);
});
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
    require.onError = function (a) { console.log(a) };
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
        window.alert1=window.alert;
        window.alert = function (data) {
            console.log(data)
        }
        window.confirm = function(data){
            return true;
        }
    `)
}


