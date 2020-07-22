var event = {

}
var stepCall;
var stepCtx;
var globalCtx;
var errList;
var logFun;
var stepInfo;
var errorCount;
var forList;
var allList;
var rootDirectory;
var fs;
var mdkir;
var finallyNode;
var jobId;
var processName;
var errCall;
//js深拷贝
function getType(o) {
    let _t;
    return ((_t = typeof (o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
}

function deepClone(destination, source) {
    for (let p in source) {
        if (getType(source[p]) == "array" || getType(source[p]) == "object") {
            destination[p] = getType(source[p]) == "array" ? [] : {};
            arguments.callee(destination[p], source[p]);
        } else {
            destination[p] = source[p];
        }
    }
}
function getProcessName() {
    return processName;
}
function setProcessName(name) {
    processName = name;
}
function setJobId(jobid) {
    jobId = jobid;
}
function getJobId() {
    return jobId;
}
function getDirectory() {
    return rootDirectory;
}
function setmdkir(mdkirs) {
    mdkir = mdkirs;
}
function setDirectory(Directory) {
    mdkir(Directory);
    rootDirectory = Directory;
}
function writeError(text, call) {
    let appendText = "[" + getNowFormatDate() + "] " + text + "\r\n"
    event['writeError'](rootDirectory + '/' + jobId, 'error.txt', appendText, call);
}
function init(fss) {
    event = {
    }
    stepCall = null;
    stepCtx = {};
    globalCtx = null;
    errorCount = {};
    forList = {};
    allList = [];
    errList = [];
    finallyNode = {};
    rootDirectory = "";
    fs = fss;
}
function getContext() {
    function get(name) {
        if (stepCtx.isOwnProperty(name)) {
            return stepCtx.get(name);
        } else {
            return getUp(stepCtx.getParent(), name)
        }
    }
    function getUp(ctx, name) {
        if (null === ctx) {
            return null;
        }

        if (ctx.isOwnProperty(name)) {
            return ctx.get(name)
        } else {
            if (typeof ctx.getParent() === "undefined") {
                ctx.setParent(globalCtx)
            }
            return getUp(ctx.getParent(), name)
        }
    }
    function signature(name) {
        if (stepCtx.isOwnProperty(name)) {
            return stepCtx.signature(name);
        } else {
            return globalCtx.signature(name);
        }
    }
    function set(name, value) {
        stepCtx.set(name, value);
    }
    function setOwnProperty(name, value) {
        if (stepCtx.isOwnProperty(name)) {
            stepCtx.set(name, value);
        } else {
            globalCtx.set(name, value);
        }
    }
    function retContext(isGlobal) {
        if (isGlobal) {
            return globalCtx.allContext();
        } else {
            return stepCtx.allContext();
        }
    }
    return {
        get: get,
        set: set,
        signature: signature,
        setOwnProperty: setOwnProperty,
        retContext: retContext
    }
}

function addForList(id, list, callback) {
    forList[id] = {
        list: list,
        callback: callback
    }
}
function getForList(id) {
    return forList[id]["list"];
}
function deleteForListChild(id, childid, callback) {
    let otherList = []
    for (let i in forList[id]['list']) {
        if (forList[id]['list'][i] != childid) {
            otherList.push(forList[id]['list'][i])
        }
    }
    forList[id] = otherList;
    forList[id].stepCallBack = callback;
}
function deleteForList(id) {
    delete forList[id]
}

function getErrList() {
    return errList;
}
function setErrList(list) {
    deepClone(errList, list)
}
function getEventList() {
    return event;
}

function addGlobalContext(Context) {
    globalCtx = Context;
}
function setGlobalContext(name, value) {
    globalCtx.set(name, value);
}
function getGlobalContext() {
    return globalCtx;
}
function addAllCallBACK(callback, step) {
    stepCall = callback;
    stepInfo = step;
}
function getAllContext() {
    return stepCtx;
}
function addAllContext(Context) {
    stepCtx = Context;
}

function addEVent(name, sys, callback) {
    if (typeof sys == "function") {
        callback = sys;
        event[name] = (step) => {
            if (step) {
                callback(step, doLog, new getContext());
            } else {
                callback(doLog, new getContext());
            }
        }
    } else {
        event[name] = callback;
    }
}
function removeEvent(name) {
    event[name] = null;
}
function onceEvent(name, callback) {
    evnet[name] = () => {
        callback(call)
        event[name] = null;
    }
}
function isEvent(name) {
    if (typeof event[name] === "function") {
        return true;
    } else {
        return false;
    }
}
function doEvent(step, name) {
    event[name](step);
}
function createRec(step_id) {
    errorCount[step_id] = 0;
}
function doRec(step_id) {
    errorCount[step_id]++;
}
function isOutCount(step_id) {
    if (typeof errorCount[step_id] == "undefined") {
        createRec(step_id);
        errCall = stepCall;
    }
    if (errorCount[step_id] > 1) {
        return true;
    } else {
        return false;
    }
}
function splitArray(array, start, end, isNext) {
    let next = [];
    deepClone(next, array)
    let retList = [];
    if (typeof end === "undefined" || end === true) {
        isNext = end;
        end = start;
        start = 0;
    }
    // console.log(next, array)
    next.every((e) => {
        if (start == 0) {
        } else if (start == e.id) {
            start = 0;
        } else {
            return true;
        }

        if (end == e.id) {
            if (isNext === true) {
                retList.push(e);
            }
            return false;
        }

        retList.push(e);
        return true;

    })
    return retList;
}
function setAllList(list) {
    deepClone(allList,list);
   // allList = list;
    setFinally(allList[allList.length - 1])
}
function setFinally(node) {
    if (node.type === "finally") {
        deepClone(finallyNode, node);
    } else {
        finallyNode = {}
    }
}
function doFinally(callback) {
    //doEnd();
    let tempNode = {};
    deepClone(tempNode, finallyNode);

    callback([tempNode]);
}
function doEnd() {
    stepCall("doEnd")
}
//web回调捕获
function webAction(channel) {
    try {
        if (typeof (channel.code) != "undefined") {
            if (channel.code == "200") {
                let ctx = new getContext();
                if (channel.context != "") {
                    for (key in channel.context) {
                        ctx.set(key, channel.context[key])
                    }
                }
                doLog();
            } else if (channel.code == "500") {
                doLog({ type: "ElementNotFoundException", message: channel.msg });
            }
        }
    } catch (e) {
        doLog({ type: "SystemException", message: e })
    }
}
//处理异常
function doErr(err, stepInfo, stepCall) {
    try {
        if (typeof err === "undefined") return stepCall();
        if (typeof err == "string") {
            if ("doEnd" == err) {
                throw "doEnd"
            }
            err = {
                type: "UndefinedException",
                message: err
            }
        }
        writeError(JSON.stringify({ name: stepInfo.htmlParameters.tempaltePathName, type: err.type, message: err.message }), function (err) {

        })
        let singleNodeErr = [];
        let nodesErr = [];
        errList.forEach(element => {
            if (element.singleNodeId != -1) {
                singleNodeErr.push(element);
            } else {
                nodesErr.push(element);
            }
        });
        errList = singleNodeErr.concat(nodesErr);
        if (errList.every(element => {
            if (element.name.findIndex(function (data) {
                return data == err.type && (element.singleNodeId == -1 || element.singleNodeId == stepInfo.id);
            }) > -1) {
                console.log("doCathch")
                /*
                <ul style="display: block;">
                    <li>当前元流程节点重新执行</li>
                    <li>当前元流程节点的下一个节点执行</li>
                    <li>跳出元流程，进入下一个元流程</li>
                    <li>跳出元流程内循环</li>
                    <li>跳出主流程循环</li>
                    <li special="special">指向到当前元流程内某个节点开始</li>
                    <li>流程终止</li>
                </ul>
                 */
                err.doErrType = element.finallyType;

                let hasParameter = false;
                let isGlobal = false;
                //step_id:stepInfo.id,
                let msg = {
                    step_id: element.id,
                    parameters: "进入异常捕获",
                    name: stepInfo.htmlParameters.tempaltePathName,
                    desc: null,
                    date: new Date().getTime(),
                    processName: getProcessName(),
                    step_test: stepInfo,
                    partParameter: {
                        isGlobal: isGlobal,
                        hasParameter: hasParameter,
                        parameter: hasParameter ? stepCtx.get(stepInfo.outParameterName) : null,
                        parameter_name: hasParameter ? stepInfo.outParameterName : null
                    }
                }
                let msg_out = JSON.parse(JSON.stringify(msg));
                msg_out.parameters = "离开异常捕获";

                if (isOutCount(stepInfo.id)) {
                    err.doErrType = "同一节点出错超过3次，退出流程";
                    msg_out.date = new Date().getTime();
                    logFun(msg_out, err)
                    return true
                } else {
                    // console.log(element.finallyType, element.step.id)
                    doRec(stepInfo.id)
                    // console.log("异常捕获节点信息");
                    // console.log(element);
                    // console.log(err);
                    // console.log("进入异常捕获");
                    // console.log(msg);
                    let goNext = stepCall;
                    msg.date = new Date().getTime();
                    msg.error_step = stepInfo.id;
                    logFun(msg, err);
                    let err_log = err;
                    switch (element.finallyType) {
                        case "当前元流程节点重新执行":
                            console.log("do restart")
                            element.doCatch(function (err) {
                                if (err) {
                                    return goNext(err);
                                }
                                msg_out.date = new Date().getTime();
                                logFun(msg_out, err_log)

                                element.evaluate(stepCtx, [stepInfo], goNext);
                            });
                            break;
                        case "当前元流程节点的下一个节点执行":
                            console.log("do continue");
                            element.doCatch((err) => {
                                msg_out.date = new Date().getTime();
                                logFun(msg_out, err_log);
                                goNext(err)
                            });
                            break;

                        case "跳出指定循环":
                            element.doCatch(function (err) {
                                console.log("do jump");
                                msg_out.date = new Date().getTime();
                                logFun(msg_out, err_log);
                                if (typeof forList[element.pointTo] == "undefined") {
                                    goNext(err)
                                } else {
                                    if (err) {
                                        return goNext(err);
                                    }
                                    forList[element.pointTo].stepCallBack(element.forActive)
                                }
                            })
                            break;
                        case "指向元流程第一个节点开始":
                            element.doCatch(function (e) {
                                msg_out.date = new Date().getTime();
                                logFun(msg_out, err_log);
                                if (e) {
                                    return goNext(e);
                                }
                                console.log("do one start")
                                if (typeof forList[element.pointTo] == "undefined") {
                                    console.log(element)
                                    element.evaluate(stepCtx, splitArray(element.step.metaWork, element.pointTo, true), goNext);
                                } else {
                                    element.evaluate(stepCtx, splitArray(element.step.metaWork, element.pointTo), function (err) {
                                        if (err) {
                                            return goNext(err);
                                        }
                                        console.log("do one star2t")

                                        forList[element.pointTo].stepCallBack(element.forActive)

                                    });

                                }
                            })
                            break;
                        case "回到指定主流程节点":
                            element.doCatch(function (e) {
                                if (e) {
                                    return goNext(e);

                                }
                                msg_out.date = new Date().getTime();
                                logFun(msg_out, err_log);
                                console.log("do otherone start",allList)
                                if (typeof forList[element.pointTo] == "undefined"||element.forActive=="reload") {
                                    console.log("gogo!!!", stepCtx.getParent().allContext())
                                    element.evaluate(stepCtx, splitArray(allList, element.fromTo, element.pointTo, true), goNext);
                                } else {
                                    console.log("gogo")
                                    element.evaluate(stepCtx, splitArray(allList, element.fromTo, element.pointTo), function (err) {
                                        if (err) {
                                            return goNext(err);
                                        }
                                        console.log("gogo")
                                        // debugger
                                        forList[element.pointTo].stepCallBack(element.forActive)

                                    });

                                }
                            })
                            break;
                        case "流程终止":
                            element.doCatch(function (e) {
                                if (e) {
                                    return goNext(e)
                                }
                                msg_out.date = new Date().getTime();
                                logFun(msg_out, err_log);
                                element.evaluate(stepCtx, [finallyNode], function (err) {
                                    if (err) return goNext(err);
                                    goNext("流程终止")
                                });

                            });
                            break;
                        default:
                            element.doCatch(goNext);
                            break;
                        // case "跳出元流程，进入下一个元流程":
                        //     element.doCatch(metaWorkCallback);
                        //     break;
                        // case "跳出元流程内循环":
                        //     element.doCatch(function (err) {
                        //         if (err) {
                        //             stepCall(err);
                        //             return;
                        //         }
                        //         stepCall('break')
                        //     });
                        //     break;
                        // case "跳出主流程循环":
                        //     element.doCatch(function (err) {
                        //         if (err) {
                        //             metaWorkCallback(err);
                        //             return;
                        //         }
                        //         metaWorkCallback('break')
                        //     });
                        //     break;
                    }
                    return false;
                }
            } else {
                return true;
            }
        })) {
            throw err;
        }
    } catch (e) {
        console.log("捕获的异常");
        console.log(e);
        console.log("原本的异常");
        console.log(err)
        if (typeof errCall === "undefined") {
            stepCall(err)
        } else {
            errCall(err);
        }
    }

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
//留存记录
function doLog(err) {
    let hasParameter = (typeof (stepInfo.outParameterName) == "undefined") ? false : true;
    let isGlobal = ((getProcessName() == "预处理" && hasParameter) || stepInfo.type == "backGlobalParam") ? true : false;
    // console.log(stepInfo)
    let msg = {
        step_id: stepInfo.id,
        parameters: stepInfo.parameters,
        name: stepInfo.htmlParameters.tempaltePathName,
        desc: null,
        date: new Date().getTime(),
        processName: getProcessName(),
        step_test: stepInfo,
        partParameter: {
            isGlobal: isGlobal,
            hasParameter: hasParameter,
            parameter: hasParameter ? stepCtx.get(stepInfo.outParameterName) : null,
            parameter_name: hasParameter ? stepInfo.outParameterName : null
        }
    }
    if (err) {
        let error = {
            name: stepInfo.htmlParameters.tempaltePathName,
            message: err.message || err.msg || err,
            stack: err.type || ""
        }
        logFun(msg, error)
        doErr(err, stepInfo, stepCall)
        //stepCall(err)
    } else {
        logFun(msg)
        stepCall()
    }
}
function setLog(log) {
    logFun = log;
}
module.exports = {
    init,
    addAllCallBACK,
    addAllContext,
    addEVent,
    removeEvent,
    onceEvent,
    isEvent,
    doEvent,
    getEventList,
    addGlobalContext,
    setGlobalContext,
    getGlobalContext,
    getAllContext,
    getContext,
    setErrList,
    getErrList,
    setLog,
    addForList,
    getForList,
    deleteForListChild,
    deleteForList,
    setAllList,
    webAction,
    getDirectory,
    setDirectory,
    setmdkir,
    doFinally,
    setJobId,
    getJobId,
    setProcessName,
    getProcessName,
    doErr
}