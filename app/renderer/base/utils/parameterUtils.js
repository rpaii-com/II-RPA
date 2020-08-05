let parameterUtils = {
    /**
     * @param sourceId 目标元流程节点ID
     * @param sourceParentId 目标元流程ID
     * @returns {}聚合信息对象
     */
    copyMateNodeInfo: function (sourceId, sourceParentId, newDate, callback) {
        let copyNodeInfo = {};
        // console.log("copyNodeInfo start");
        commonUtils.deepClone(copyNodeInfo, ctx.get(sourceId));
        // console.log("copyNodeInfo end");
        let sourceParentParameInfo = typeof ctx.get(sourceParentId) != 'undefined' ? ctx.get(sourceParentId) : [];
        //用于保存元流程中相关的信息
        let inParentList = [];
        //用于保存全局中的相关信息
        let copyCorrelationGlobal = [];
        let globalInfo;
        //用于存放返回信息
        let returnInfo = {};
        sourceParentParameInfo.forEach((item, index) => {
            if (item.fromId == sourceId) {
                let tempObj = {};
                commonUtils.deepClone(tempObj, item)
                inParentList.push(tempObj);
            }
        });
        switch (copyNodeInfo.type) {
            case "backGlobalParam":
                globalInfo = ctx.get("detailPretreatmentList");
                globalInfo.forEach((item, index) => {
                    if (item.fromIndex == sourceId) {
                        let tempObj = {};
                        commonUtils.deepClone(tempObj, item)
                        copyCorrelationGlobal.push(tempObj);
                    }
                });
                returnInfo.globalInfo = copyCorrelationGlobal;
                break;
            default:
                break;
        }
        returnInfo.nodeInfo = copyNodeInfo;
        returnInfo.parameterInfo = inParentList;
        returnInfo.globalInfo = copyCorrelationGlobal;
        if (typeof callback == "function") {
            callback(returnInfo, newDate);
        }
        // console.log("util end");
        return returnInfo;
    },
    /**
     * 获取目标元流程的所属主流程的for循环及包含的for循环节点
     * @param targetMateId 目标元流程的id，不传为当前显示的元流程id 
     * @returns [String] 目标元流程所属的主流程for循环及该元流程所包含的for循环节点的id
     */
    getForNodeInfoArray: function (targetMateId) {
        if (typeof targetMateId == "undefined") {
            targetMateId = commonUtils.getCurrentMateId();
        }
        let tempArray = [];
        let thisParentClass = $("#" + targetMateId).parent("ul").hasClass("main-liucheng-list");
        let targetParentLi;
        let mainPrevItem;
        let targetLi = $("#" + targetMateId);
        while (!thisParentClass) {
            let tempObj = {};
            tempParent = targetLi.parents(".this_for").eq(0);
            if (tempParent.length > 0) {
                tempObj = ctx.get(tempParent.attr("id"));
                tempObj.id = tempParent.attr("id");
                tempObj.isGlobal = true;
                tempArray.push(tempObj);
                targetLi = tempParent;
                thisParentClass = targetLi.hasClass("main-liucheng-list");
            } else {
                thisParentClass = true;
            };
        };
        $("#secondList" + targetMateId).find(">li.separate-icon").each((index, item) => {
            if ($(item).find(">.node-main-box").find(">span.title").text() == "迭代循环" || $(item).find(">.node-main-box").find(">span.title").text() == "列表循环") {

                let tempObj = {};
                // let targetParentLi = $(item).parents("li").eq(0);
                tempObj.id = $(item).attr("id");
                tempObj.isGlobal = false;
                tempArray.push(tempObj);
            }
        });
        return tempArray;
    },
    /**
     * 获取当前元流程的所属的主流程for循环及所属主流程节点前面的for循环
     * @param targetMateId 目标元流程id
     * @returns [id] id数组
     */
    getFirstForNodeInfoArray: function (targetMateId) {
        if (typeof targetMateId == "undefined") {
            targetMateId = commonUtils.getCurrentMateId();
        }
        let tempArray = [];
        let thisParentClass = $("#" + targetMateId).parent("ul").hasClass("main-liucheng-list");
        let thisPrev = $("#" + targetMateId).prevAll("li.this_for").eq(0);
        let targetParentLi;
        let targetLi = $("#" + targetMateId);
        while (!thisParentClass) {
            let tempObj = {};
            tempParent = targetLi.parents(".this_for").eq(0);
            if (tempParent.length > 0) {
                targetLi = tempParent;
                thisParentClass = targetLi.hasClass("main-liucheng-list");
                if (!thisParentClass) {
                    tempObj = ctx.get(tempParent.attr("id"));
                    tempObj.id = tempParent.attr("id");
                    tempObj.isGlobal = true;
                    tempArray.push(tempObj);
                }
            } else {
                thisParentClass = true;
            };
        };
        thisPrev = targetLi.prevAll("li.this_for").eq(0);
        while (thisPrev.length > 0) {
            let tempObj = {};
            tempObj = ctx.get(thisPrev.attr("id"));
            tempObj.id = thisPrev.attr("id");
            tempObj.isGlobal = true;
            tempArray.push(tempObj);
            thisPrev = thisPrev.prevAll("li.this_for").eq(0);
        };
        return tempArray;
    },
    /**
     * 获取当前元流程所属主流程节点的前面的主流程节点
     * @param targetMateId 目标元流程id
     * @returns [] 当前主流程节点的聚合对象
     */
    getPrevMainList: function (targetMateId) {
        if (typeof targetMateId == "undefined") {
            targetMateId = commonUtils.getCurrentMateId();
        }

        let tempArray = [];
        let targetLi = $("#" + targetMateId);
        let thisParentClass = targetLi.parent("ul").hasClass("main-liucheng-list");
        let thisPrev = targetLi.prevAll("li").eq(0);
        let targetParentLi;
        if (thisPrev.length === 0) {
            if (targetLi.parents('li[itemtype]').length > 0) {
                thisPrev = targetLi.parents('li[itemtype]').eq(0)
            }
        }
        while (thisPrev.length > 0) {
            let tempObj = {};
            tempObj = typeof ctx.get(thisPrev.attr("id")) != "undefined" ? ctx.get(thisPrev.attr("id")) : {};
            tempObj.id = thisPrev.attr("id");
            tempObj.isGlobal = true;
            tempObj.type = thisPrev.attr("itemtype");
            tempArray.push(tempObj);
            if (thisPrev.prevAll("li").eq(0).length > 0) {
                thisPrev = thisPrev.prevAll("li").eq(0);
            } else {
                if (thisPrev.parents('li[itemtype]').length > 0) {
                    thisPrev = thisPrev.parents('li[itemtype]').eq(0)
                } else {
                    thisPrev = thisPrev.prevAll("li").eq(0);
                }
            }
        };

        return tempArray;
    },
    /**
     * 获取目标元流程id，如果该流程为for循环内则获取父级for循环的id
     */
    getTargetNeedMainId: function (targetMateId) {
        if (typeof targetMateId == "undefined") {
            targetMateId = commonUtils.getCurrentMateId();
        }
        let targetId;
        let title;
        let isFor = false;
        if ($("#" + targetMateId).parents(".this_for").length > 0) {
            targetId = $("#" + targetMateId).parents(".this_for").attr("id");
            isFor = true;
        } else {
            targetId = targetMateId;
        }
        if (ctx.get(targetId).type == "this_for") {
            ctx.get(targetId).parameters.forEach((item, index) => {
                if (item.name == "for_professional_dec") {
                    title = item.value
                }
            });
        } else {
            ctx.get(targetId).parameters.forEach((item, index) => {
                if (item.name == "professional_dec") {
                    title = item.value
                }
            });
        }
        return {
            id: targetId,
            name: title,
            isMainFor: isFor
        }
    },
    /**
     * 刷新全局参数列表
     * @returns void
     */
    refreshGlobalParamList: function () {
        let tempArray = ctx.get("detailPretreatmentList");
        if (typeof tempArray == "undefined") {
            $(".description-left .this_tree >ul").html("");
            return;
        }
        let correspondArray = [];
        let newArray = [];
        let tempHtml = "";
        tempArray.forEach((item, index) => {
            let tempInedx = correspondArray.indexOf(item.name);
            if (tempInedx > -1) {
                if ($("#" + newArray[tempInedx].parentMateFlowId).hasClass("detail-liucheng-pretreatment")) {
                    newArray[tempInedx] = item;
                } else {
                    if ($("#" + item.parentMateFlowId).hasClass("detail-liucheng-pretreatment")) {

                    } else {
                        newArray[tempInedx] = item;
                    }
                }
            } else {
                correspondArray.push(item.name);
                newArray.push(item);
            }
        });
        newArray.forEach((item, index) => {
            if (typeof item.parentMateFlowId == "undefined") {
                return;
            }
            let mainItemId = item.parentMateFlowId.replace("secondList", "");
            let fromEara;
            let nameText
            if ($("#" + mainItemId).hasClass("main-liucheng-pretreatment")) {
                fromEara = "全局声明";
                nameText = '<em class="come-global">' + item.name + '</em>';
            } else {
                fromEara = "元流程-" + $("#" + mainItemId).find(">span.title").text() + "创建";
                nameText = '<em class="come-part">' + item.name + '</em>';
            }
            let type = item.type;
            if (typeof type == "undefined") {
                return;
            }
            type = type.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
            tempHtml += '<li><span>' + nameText + '</span><ul>';
            tempHtml += '<li><span>' + type + '</span>';
            tempHtml += '<li><span>' + fromEara + '</span>';
            tempHtml += '</ul></li>';
        });
        $(".description-left .this_tree >ul").html(tempHtml);
    },
    /**
     * 刷新局部参数列表
     * @param targetMateFlowId 目标元流程id
     * @returns void
     */
    refreshPartParamList: function (targetMateFlowId) {
        let tempArray = ctx.get(targetMateFlowId);
        if (typeof tempArray == "undefined") {
            $(".description-right .this_tree >ul").html("");
            return;
        };
        let correspondArray = [];
        let newArray = [];
        let tempHtml = "";
        tempArray.forEach((item, index) => {
            let tempInedx = correspondArray.indexOf(item.name);
            if (tempInedx > -1) {
                newArray[tempInedx] = item;
            } else {
                correspondArray.push(item.name);
                newArray.push(item);
            }
        });
        newArray.forEach((item, index) => {
            let type = typeof item.type == "undefined" ? 'string' : item.type;
            type = type.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
            tempHtml += '<li><span><em class="part-param">' + item.name + '</em></span><ul>';
            tempHtml += '<li><span>' + type + '</span>';
            tempHtml += '</ul></li>';
        });
        $(".description-right .this_tree >ul").html(tempHtml);
    },
    /**
     * 刷新主流程块出参信息
     * @param id 目标主流程id
     */
    refreshMainFlowOutParam: function (id) {
        let array = ctx.get("detailPretreatmentList");
        let correspondArray = [];
        let newArray = [];
        let pretreatmentSecondId = $(".liucheng-list.detail-liucheng-pretreatment").eq(0).attr("id");
        if (typeof array == "undefined") {

            array = [];
        };
        array.forEach((item, index) => {
            let tempInedx = correspondArray.indexOf(item.name);
            let p = pretreatmentSecondId == item.parentMateFlowId ? true : false;
            let tempObjIndex;
            newArray.forEach((ele, index) => {
                let t = pretreatmentSecondId == ele.parentMateFlowId ? true : false;;
                if (ele.name == item.name) {
                    if (p) {
                        if (t) {
                            tempObjIndex = index;
                        }
                    } else {
                        if (!t && ele.parentMateFlowId == item.parentMateFlowId) {
                            tempObjIndex = index;
                        }
                    }
                }
            });
            if (typeof tempObjIndex != "undefined") {
                newArray[tempObjIndex] = item;
            } else {
                newArray.push(item);
            }
        });
        if (typeof id == "undefined") {
            $(".main-liucheng-item").each(() => {
                $(this).find(">.parameter-botton").find("label").nextAll().remove();
            })
            newArray.forEach((item, index) => {
                let mId = item.parentMateFlowId.replace('secondList', '');
                let html = '<i>' + item.name + '</i>';
                $('#' + mId).find('>.parameter-botton').append(html);
            });
        } else {
            refreshDom(id, newArray);
        };

        function refreshDom(mainId, tempArray) {
            let html = '';
            let array = [];
            $('#' + mainId).find(">.parameter-botton").find("label").nextAll().remove();
            tempArray.forEach((item, index) => {

                let id = item.parentMateFlowId.replace('secondList', '');
                if (mainId == id) {
                    array.push(item);
                }
            });
            array.forEach((item, index) => {

                html += '<i>' + item.name + '</i>'
            });
            if ($('#' + mainId).find(">.parameter-botton").length > 0) {

                $('#' + mainId).find(">.parameter-botton").append(html);
            }
        };
    },
    /**
     * 覆盖数组重复变量
     * @param array 目标数组
     * @param name 同名name
     */
    getUpdateSameNameParam: function (array, name, item) {
        let hasSameName = false;
        array.forEach((ele, index) => {
            if (ele.name == name) {
                array[index] = item;
                hasSameName = true;
            }
        });
        if (!hasSameName) {
            array.push(item);
        }
        return array;
    },
    /**
     * 根据name获取参数类型
     * @param name 参数名
     * @returns string:type 
     */
    getParamtersTypeByName: function (name) {
        let targetUlId = $(".liucheng-list.current-show-list").eq(0).attr("id");
        let isGlobal = $(".liucheng-list.current-show-list").hasClass("detail-liucheng-pretreatment") ? true : false;
        let parameters = typeof ctx.get(targetUlId) != "undefined" ? ctx.get(targetUlId) : [];
        let globalParams = ctx.get("detailPretreatmentList");
        let type;

        if (!isGlobal) {

            parameters.forEach((item, index) => {
                if (item.name == name) {

                    type = ctx.get(item.fromId).dataType;
                }
            })
        }
        if (typeof type == "undefined") {

            globalParams.forEach((item, index) => {
                if (item.name == name) {

                    type = ctx.get(item.fromId).dataType;
                }
            });
        }
        return type;
    },
    /**
     * 元流程id转为主流程id
     * @param mateId 元流程id
     */
    transitionMateIdToMainId: function (mateId) {
        let mainId = mateId.replace('secondList', '');
        return mainId;
    },
    /**
     * 获取全局参数
     */
    getGlobalParameters: function () {
        let that = this;
        let mainArray = commonUtils.getGlobalInfo();
        let array = [];
        mainArray.forEach((el) => {
            let tObj = {};
            let tempText;
            if ($("#" + el.parentMateFlowId).hasClass("detail-liucheng-pretreatment")) {
                tempText = "---来自全局变量";
            } else {
                let targetMainItemId = that.transitionMateIdToMainId(el.parentMateFlowId);
                tempText = "---来自元流程" + $("#" + targetMainItemId).find(">span.title").text();
            }
            tObj.id = el.fromId;
            tObj.name = el.name;
            tObj.come = 'global';
            tObj.moreName = el.name + tempText;
            array.push(tObj)
        })
        return array;
    },
    /**
     * 获取主流程出参
     * @param mateId 元流程id
     */
    getMainNodeOutParameters: function (mateId) {
        let that = this;
        let mainId = that.transitionMateIdToMainId(mateId).replace('try','');
        let array = [];
        let mainNode = $("#" + mainId);
        if (mainNode.parents("li.this_for").length > 0) {
            let forOut = {};
            forOut.come = "part";
            forOut.id = mainNode.parents("li.this_for").attr("id");
            let htmlParametersArray = ctx.get(forOut.id).parameters;
            htmlParametersArray.forEach((item) => {
                if (item.name.indexOf("rename")>-1) {
                    forOut.name = item.value;
                }
            });
            array.push(forOut);
        }
        return array;
    },
    /**
     * 设置元流程节点的出参预计类型
     * @param node 出参对象
     * @param nodeType 出参类型
     * @returns void
     */
    setDataType: function (node, nodeType) {
        switch (nodeType) {
            case "open_browser": //获取浏览器变量，
                node.dataType = "string";
                break;
            case "existence_browser": 
                node.dataType = "string";
                break;
            case "alert_click_browser": 
                node.dataType = "string";
                break;    
            case "batchGrab_browser": 
                node.dataType = "array";
                break;      
            case "grab_browser": 
                node.dataType = "string";
                break;     
            case "wait_browser": 
                node.dataType = "string";
                break;   
            case "url_browser": 
                node.dataType = "string";
                break;   
            case "grab_alert_browser": 
                node.dataType = "string";
                break;   
            case "attribute_browser":
                node.dataType = "string";
                break;   

            case "getSystemParameter": //获取系统变量
                node.dataType = "string";
                break;
            case "getPageURL": //获取当前页面的URL URI
                node.dataType = "string";
                break;
            case "getVCode": //获取验证码
                node.dataType = "string";
                break;
            case "getList": //获取列表内容
                node.dataType = "array"
                break;
            case "getTable": //获取表格内容
                node.dataType = "array[array]";
                break;
            case "resemblance": //获取相似元素内容
                node.dataType = "array";
                break;
            case "InnerHTML": //获取页面元素内容
                node.dataType = "string";
                break;
            case "for": //for循环
                node.dataType = "string";
                break;
            case "hashfor": //迭代循环
                node.dataType = "string";
                break;
            case "importFile": //读取数据表格
                node.dataType = "array[array]";
                break;
            case "extractParam": //提取变量
                node.dataType = "array";
                break;
            case "saveAccount": //设置账号
                node.dataType = "string";
                break;
            case "saveNewParam": //设置新变量
                node.dataType = "array";
                break;
            case "saveAccount": // JJW-TODO
                node.dataType = "string";
                break;
            case "calculateParam": //数学运算
                node.dataType = "array";
                break;
            case "convertParam": //语法转化
                node.dataType = "array";
                break;
            case "callFunction": //变量转换
                node.dataType = "string";
                break;
            case "paramsPaste": //变量黏贴
                node.dataType = "string";
                break;
            case "httpApi": //HTTP接口
                node.dataType = "array";
                break;
            case "socketApi": //socket接口
                node.dataType = "array";
                break;
            case "websocketApi": //websocket接口
                node.dataType = "array";
                break;
            case "backGlobalParam": //返回全局变量
                node.dataType = "string";
                break;
            case "dbConfig": //返回数据库配置
                node.dataType = "string";
                break;
            case "dbInsert": //批量导入数据库
                node.dataType = "string";
                break;
            case "dbSelect": //返回数据库查询数据
                node.dataType = "string";
                break;
            case "dbOthers": //
                node.dataType = "string";
                break;
            case "semantic": //读取语义文件
                node.dataType = "array";
                break;
            case "koulingxuanze": //口令选择
                node.dataType = "string";
                break;
            case "groupPassword": //口令组
                node.dataType = "array";
                break;
            case "fs_exists": //文件是否存在
                node.dataType = "string";
                break;
            case "getPixelColor": //文件是否存在
                node.dataType = "array";
                break;
            case "PreciseReadFile": //精确读取文件
                node.dataType = "string";
                break;
            case "fs_get_all_file": //精确读取文件
                node.dataType = "array";
                break;
            case "importTextFile": //文本文件
                node.dataType = "array";
                break;
            case "importFile_normal": //读取数据表格
                node.dataType = "array";
                break;
            case "importTextFile_normal":
                node.dataType = "array";
                break;
            case "callback_pixel_position": //文本文件
                node.dataType = "array";
                break;
            case "string_generacte":
                node.dataType = "string";
                break;
            case "confirmReceive":
                node.dataType = "array";
                break;
            case "simpleFormula":
                node.dataType = "string";
                break;
            case "slidingVerificationCode":
                node.dataType = "string";
                break;
            case "exportFile":
                node.dataType = "string";
                break;
            case "capScreenPart":
                node.dataType = "string";
                break;
            case "getAttributeName":
                node.dataType = "string";
                break;
            case "getElePosition":
                node.dataType = "array";
                break;
            case "canGetEle":
                node.dataType = "string";
                break;
            case "conArrayRowCol":
                node.dataType = "string";
                break;
            case "IDAccountPassword":
                node.dataType = "Array";
                break;
            case "CSMove_element":
                node.dataType = "string";
                break;
            case "arrayConcat":
                node.dataType = "array";
                break;
            case "CSMoveForVerify":
                node.dataType = "string";
                break;
            case "archiverFile":
                node.dataType = "array";
                break;
            case "strSplit":
                node.dataType = "string";
                break;
            case "ie8_getPageURL":
                node.dataType = "string";
                break;
            case "ie8_getPageCookies":
                node.dataType = "string";
                break;
            case "ie8_InnerHTML":
                node.dataType = "string";
                break;
            case "ie8_canGetEle":
                node.dataType = "string";
                break;
            case "ie8_getAttributeName":
                node.dataType = "array";
                break;
            case "ie8_getVCode":
                node.dataType = "array";
                break;
            case "ie8_getList":
                node.dataType = "array";
                break;
            case "ie8_getTable":
                node.dataType = "array";
                break;
            case "ie8_resemblance":
                node.dataType = "array";
                break;
            case "readPDF":
                node.dataType = "string";
                break;
            case "CMDcommand":
                node.dataType = "string";
                break;
            case "getCSElement": //捕获桌面元素
                node.dataType = "string";
                break;
            case "getCSParentElementByName": //根据元素名获取父级元素
                node.dataType = "string";
                break;
            case "getCSBrotherElementByName": //根据元素名获取同级元素
                node.dataType = "string";
                break;
            case "getCSChildrenElementByName": //根据元素名获取自己元素
                node.dataType = "string";
                break;
            case "getCSParentElement": //获取父级元素
                node.dataType = "string";
                break;
            case "getCSBrotherElement": //获取同级元素树
                node.dataType = "string";
                break;
            case "getCSChildrenElement": //获取子集元素树
                node.dataType = "string";
                break;
            case "shangdongMenu": //获取子集元素树
                node.dataType = "string";
                break;
            case "getElementItems": //获取元素下全部items元素树
                node.dataType = "string";
                break;
            case "numTrans": //中文数字，阿拉伯数字互转
                node.dataType = "string";
                break;
            case "dateFormatSpe": //中文数字，阿拉伯数字互转
                node.dataType = "string";
                break;
            case "getIp":
                node.dataType = "string";
                break;
            case "excelToObject":
                node.dataType = "string";
                break;
            case "readCsvFile":
                node.dataType = "array";
                break;
            case "writeCsvFile":
                node.dataType = "string";
                break;
            case "similarSelector":
                node.dataType = "string";
                break;
            case "excelReadCell":
                node.dataType = "string";
                break;
            case "excelReadSheet":
                node.dataType = "string";
                break;
            case "excelReadRange":
                node.dataType = "array";
                break;
            case "docReadTxt":
                node.dataType = "string";
                break;
            case "docWriteTxt":
                node.dataType = "string";
                break;
            case "docReadWord":
                node.dataType = "string";
            case "docWriteWord":
                node.dataType = "string";
            case "newHttpApi":
                node.dataType = "string";
                break;
            case "shangdongMenu":
                node.dataType = "string";
                break;
            case "ie8_getAlertText":
                node.dataType = "string";
                break;
            case "ie8_classReturnXpath":
                node.dataType = "string";
                break;
            case "ocr_TencentCloud_getString":
            case "telnetConnect":
                node.dataType = "string";
                break;
                node.dataType = "string";
                break;
            case "ocr_TencentCloud_getPosition":
            case "telnetWrite":
                node.dataType = "string";
                node.dataType = "string";
                break;
                break;
            default:
                // try {
                //     throw "改节点存在出参，请设置出参的数据类型（" + nodeType + ")";
                // } catch (error) {
                //     if (error) {
                //         console.error(error);
                //     }
                // }
                console.log("该节点不存在出参（" + nodeType + "）");
                break;
        }
    }
};