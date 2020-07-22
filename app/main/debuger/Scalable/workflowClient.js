/**
 * 事件发生器
 */
function EventEmitter() {
    this.events = {}
}
EventEmitter.prototype.once = function (eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push({
        callback: callback,
        count: 1
    });
}
//监听事件
EventEmitter.prototype.on = function (eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push({
        callback: callback,
        count: -1
    });
};
//监听事件
EventEmitter.prototype.onnow = function (eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName][0] = {
        callback: callback,
        count: -1
    };
};
//触发事件函数
EventEmitter.prototype.emit = function (eventName, _) {
    var events = this.events[eventName],
        args = Array.prototype.slice.call(arguments, 1),//类似splice 将emit除开第一个的参数提取出来变成数组
        i, m;

    if (!events) {
        return;
    }
    for (i = 0, m = events.length; i < m; i++) {
        if (events[i].count > -1) {
            events[i].count--;
            events[i].callback.apply(null, args);
            if (events[i].count === 0) {
                events.splice(i, 1);
            }
        } else {
            events[i].callback.apply(null, args); //触发监听事件的callback
        }
    }
};
var event = new EventEmitter();
const compareUtil = require("../../util/compareUtil")
process.on('uncaughtException', (err) => {
    event.emit("error", err)
});
/**
 * 格式化信息
 */
function workflow() {
    this.id = "";//taskid
    this.backupFolderPath = "";//留存数据位置
    this.type = "";//执行器还是设计器
    this.workflow = [];
    this.otherFlow = [];
    this.outTime = 100000;
    this.incident = null;
    this.isDebug = false;
    this.isStop = false;
    this.isEnd = false;
    this.getGlobalContext = 1000;
    this.globalFloatWaitTime = 0;
    this.globalParameter = {};
    this.partParameterList = [];
    this.partParameterMap = {};
    this.scriptInfo = {};
}

workflow.prototype = event;
workflow.prototype.init = function (workflow, type, rootDirectory, outTime = 100000, id = new Date().getTime(), globalWaitTime = 1000, scriptInfo) { //初始化流程
    if (!fs.existsSync(path.join(rootDirectory, "" + id))) {
        fs.mkdirSync(path.join(rootDirectory, "" + id));
    }
    this.outTime = outTime;
    this.workflow = workflow
    deepClone(this.otherFlow, workflow)
    this.id = id;
    this.globalWaitTime = globalWaitTime;
    this.retArray = []
    this.scriptInfo = scriptInfo;
}
workflow.prototype.module = function (incident) {
    this.incident = incident
}
workflow.prototype.Start = function () {
    this.incident.setAllList(this.otherFlow)
    this.incident.setJobId(this.id);
    let ctx = new Context();
    this.incident.addGlobalContext(ctx)
    evaluate(ctx, this.workflow, {})
}

var worker = new workflow();


function ForEach() {
    function eachSeries(arr, iterator, callback, step) {
        let step_id = step.id;
        if (typeof step_id != "undefined") {
            worker.incident.addForList(step_id, this)
        }
        callback = callback || function () { };
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            worker.emit("forInfo", {
                step_id: step_id,
                task_id: worker.id,
                i: completed,
                parameter: arr[completed],
                date: new Date().getTime(),
                step: step
            })
            worker.incident.deleteForListChild(step_id, arr[completed], function (type) {
                switch (type) {
                    case "again":
                        break;
                    case "continue":
                        completed++;
                        break;
                    case "break":
                        callback();
                        return;
                    default:
                        callback(type)
                        return;
                }
                if (arr.length == completed || (type == "break" && type != "continue" && type != "again")) {
                    return;
                }
                iterate()
            })
            iterator(arr[completed], completed, function (err) {
                if (typeof err !== "undefined") {
                    switch (err) {
                        case "break":
                            callback();
                            break;
                        case "continue":
                            completed += 1;
                            next();
                            break;
                        default:
                            callback(err);
                            break;
                    }
                } else {
                    completed += 1;
                    next();
                }
                function next() {
                    if (completed >= arr.length) {
                        worker.incident.deleteForList(step_id)
                        callback();
                    } else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    var supportsSymbol = typeof Symbol === 'function';

    function isAsync(fn) {
        return supportsSymbol && fn[Symbol.toStringTag] === 'AsyncFunction';
    }

    function slice(arrayLike, start) {
        start = start | 0;
        var newLen = Math.max(arrayLike.length - start, 0);
        var newArr = Array(newLen);
        for (var idx = 0; idx < newLen; idx++) {
            newArr[idx] = arrayLike[start + idx];
        }
        return newArr;
    }

    function initialParams(fn) {
        return function () {
            var args = slice(arguments);
            var callback = args.pop();
            fn.call(this, args, callback);
        };
    }

    function ensureAsync(fn) {
        if (isAsync(fn)) return fn;
        return initialParams(function (args, callback) {
            var sync = true;
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            fn.apply(this, args);
            sync = false;
        });
    }
    return {
        eachSeries: eachSeries,
        ensureAsync: ensureAsync
    }
}
const myForEach = new ForEach();
//自定义并发实现
Object.defineProperty(Array.prototype, 'concurrence', {
    enumerable: false,
    value: function (fun, context) {
        let len = this.length;
        let array = this;
        var context = arguments[1]; //即使为undefined，call函数也正常运行。
        if (typeof fun !== "function") {
            throw "输入正确函数!";
        }
        i = 0;
        while (i < this.length) {
            fun.call(context, array[i], i, function (e) {
                len--;
                if (typeof e !== "undefined") {
                    context(e);
                    return;
                }
                if (len == 0) {
                    context();
                    return;
                }
            });
            i++;
        }
    }
});
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
//判断是数字
function isRealNum(val) {
    // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
    if (val === "" || val == null) {
        return false;
    }
    if (!isNaN(val)) {
        return true;
    } else {
        return false;
    }
}
//分割时间与事件
function splitForTimeAndAction(str) {
    let index = str.search(/\d/);
    let arr = [];
    arr.push(str.substring(0, index));
    arr.push(str.substring(index, str.length))
    return arr;
}

function judgeCtx(key, ctx) {
    if (key[0] != '@') {
        return key
    } else {
        key = key.replace(/ /g, ' ');
        if (key.split(" ").length > 1) {
            return key;
        } else {
            return ctx.get(key.substring(1, key.length));
        }
    }
}


//添加超时方式
var timeOutFail;

function startTimeOutListen(delay) {
    clearTimeout(timeOutFail);
    timeOutFail = setTimeout(() => {
        event.emit("timeOut")
        event.emit("status", {
            type: "TimeOutException",
            msg: "超时" + worker.outTime / 1000 + "s"
        })
        worker.incident.doFinally(function (dataa) {
            let inCtx = new Context();
            inCtx.setParent(worker.incident.getGlobalContext());
            evaluate(inCtx, dataa, function (err) {
                event.emit("status", {
                    type: "TimeOutFinsh",
                    msg: "成功触发finally节点"
                })
            })
        })
    }, worker.outTime);
}

function stopTimeOutListen() {
    clearTimeout(timeOutFail);
}

function evaluate(ctx, workflow, workflowBranch, call) {
    var that = this;
    if (typeof workflowBranch == "function") {
        call = workflowBranch;
        workflowBranch = null;
    } else if (typeof (workflowBranch) == "object" && Object.prototype.toString.call(workflowBranch).toLowerCase() == "[object object]") {
        debuggerInfo = workflowBranch;
        workflowBranch = null;
    }

    let setError = function (catchList, step, ctx, callback) {
        let errList = []
        catchList.forEach((e) => {

            errList.push({
                name: e.catchType,
                doCatch: function (call) {
                    let steps = []
                    deepClone(steps, e.steps)
                    evaluate(ctx, steps || [], call)
                },
                step: step,
                finallyType: e.finallyType.catchType,
                evaluate: evaluate,
                id: e.id,
                metaWorkCallback: callback,
                pointTo: e.finallyType.pointTo,
                forActive: e.forActive,
                fromTo: e.finallyType.fromTo,
                singleNodeId: e.singleNodeId || -1
            })
        })
        worker.incident.setErrList(errList)
    }
    worker.incident.setLog(function (step, error) {
        step.task_id = worker.id;
        worker.emit("logInfo", step, error)
    });

    function delay(step, callback) {
        event.emit("compeleteyDo", step)
        if (worker.isStop) {
            worker.emit("peopleStop")
            worker.onnow("goonTask", function () {
                callback();
                worker.isStop = false;
            })
        }
        if (worker.isEnd) {
            callback("doEnd");
            worker.isStop = false;
            worker.isEnd = false;
            worker.incident.doFinally(function (dataa) {
                let inCtx = new Context();
                inCtx.setParent(ctx);
                evaluate(inCtx, dataa, function (err) {
                    event.emit("status", {
                        type: "peopleClose",
                        msg: "人员关闭"
                    })
                })
            })
        }
        if (!worker.isEnd && !worker.isStop) {
            let tempTime = parseInt(worker.globalWaitTime) + (worker.globalFloatWaitTime * Math.random());
            console.log(tempTime);
            setTimeout(() => {
                callback();
            }, tempTime);
        }
    }

    function baseOperate(step, callback) {
        worker.incident.addAllCallBACK(function (err) {
            if (err) {
                return callback(err);
            }
            //console.log("go")
            if (step.debug || worker.isDebug) {
                worker.emit("debugInfo", {
                    globalParameter: worker.globalParameter.ctx.allContext(),
                    partParameter: {
                        prev: worker.partParameterMap,
                        now: worker.partParameterList.length - 1 >= 0 ? worker.partParameterList[worker.partParameterList.length - 1].ctx.allContext() : ""
                    }
                })
                worker.once("next", () => {
                    callback();
                })
            }
            else {
                callback()
            }
        }, step);
        // ipc.send("logInfo", {
        //     code: 200,
        //     msg: "ready do:" + JSON.stringify(step)
        // })
        if (worker.incident.isEvent(step['type'])) {
            worker.incident.doEvent(step, step['type']);
        } else {
            worker.incident.doEvent(step, "chromeOp");
        }
    }
    function interiorInfo(stepInfo, err, ctx) {
        let hasParameter = (typeof (stepInfo.outParameterName) == "undefined") ? false : true;
        let isGlobal = ((incident.getProcessName() == "预处理" && hasParameter) || stepInfo.type == "backGlobalParam") ? true : false;
        let msg = {
            step_id: stepInfo.id,
            parameters: stepInfo.parameters,
            name: stepInfo.htmlParameters.tempaltePathName,
            desc: null,
            date: new Date().getTime(),
            processName: incident.getProcessName(),
            step_test: stepInfo,
            partParameter: {
                isGlobal: isGlobal,
                hasParameter: hasParameter,
                parameter: hasParameter ? ctx.get(stepInfo.outParameterName) : null,
                parameter_name: hasParameter ? stepInfo.outParameterName : null
            }
        }
        let error
        if (err) {
            error = {
                name: stepInfo.htmlParameters.tempaltePathName,
                message: err.message || err.msg || err,
                stack: err.type || ""
            }
        }
        msg.task_id = worker.id;
        worker.emit("logInfo", msg, error)
    }

    function _evaluate(step, callback) {
        //   console.log(ctx.getParent() ? ctx.getParent().allContext() : ctx.getParent(), ctx.allContext())
        if (step.type == "waitTime" || step.debug || worker.isDebug || worker.isStop) {
            stopTimeOutListen();
        } else {
            startTimeOutListen();
        }
        event.onnow("timeOut", function () {
            callback({
                type: "TimeOutException",
                message: `
                流程超时：${worker.outTime / 1000}s
                    1、流程崩溃报错
                    2、无法访问某网址
            ` })
        })
        // ipc.send("logInfo", {
        //     code: 200,
        //     msg: "start do:" + step.type
        // })
        worker.incident.addAllContext(ctx);
        switch (step['type']) {
            case "pretreatment":
                worker.incident.setProcessName("预处理");
                break;
            case "finally":
                worker.incident.setProcessName("结束节点");
                break;
            case "mateTest":
                worker.incident.setProcessName("单元测试");
                break;
            default:
                if (step.parameters instanceof Array) {
                    step.parameters.forEach(e => {
                        if (e.name.includes("professional_dec")) {
                            worker.incident.setProcessName(e.value)
                        }
                    })
                } else if (typeof step.parameters !== "undefined") {
                    worker.incident.setProcessName(step.parameters["professional_dec"])
                }
                break;
        }
        let parameters = {},
            array = [];
        try {
            step.parameters.forEach(e => {
                parameters[e.name] = judgeCtx(e.value, new worker.incident.getContext());
            })
        } catch (e) {

        }
        step.parameters = parameters;
        event.emit("readyDo", step)
        switch (step['type']) {
            case 'mateTest': //单元测试
                step.params.forEach(e => {
                    ctx.set(e.name, e.value);
                })
                callback();
                break;
            case 'finally':
            case 'MetaWorkflow':
                let inCtx = new Context();
                // console.log(ctx.allContext())
                inCtx.setParent(ctx);
                // console.log(inCtx.getParent().allContext())

                if (worker.partParameterList.length > 0) {
                    worker.partParameterMap[step.id] = {
                        name: worker.partParameterList[worker.partParameterList.length - 1].name,
                        parameter: worker.partParameterList[worker.partParameterList.length - 1].ctx.allContext()
                    }
                }
                worker.partParameterList.push({
                    name: worker.incident.getProcessName(),
                    ctx: inCtx
                })
                setError(step.catch || [], step, inCtx, callback);
                evaluate(inCtx, step.metaWork, function (e) {
                    inCtx=null;
                    if (e) {
                        if (typeof call == "function") {
                            call(e);
                        } else {
                            callback(e);
                        }
                    } else {
                        callback();
                    }
                })
                break;
            case 'this_for':
                if (typeof step.parameters.objectList != "object") {
                    for (let i = 0; i < step.parameters.objectList; i++) {
                        array.push(i + "")
                    }
                } else {
                    array = step.parameters.objectList
                }
                myForEach.eachSeries(array, myForEach.ensureAsync((e, index, next) => {
                    ctx.set(step.parameters.rename, e)
                    if (typeof step.parameters.rename_i !== "undefined" && step.parameters.rename_i !== "") {
                        ctx.set(step.parameters.rename_i, index)
                    }
                    let steps = [];
                    deepClone(steps, step.steps)
                    evaluate(ctx, steps, next)
                }), callback, step)
                break;
            case 'li-branch-if':
                compareUtil.compare(step.parameters.lid, step.parameters.op, step.parameters.rid, function (err, data) {
                    if (err) {
                        return callback(err);
                    }
                    if (data) {
                        evaluate(ctx, step.switch[0], function (e) {
                            if (e) {
                                if (typeof call == "function") {
                                    return call(e);
                                }
                                callback(e);
                            } else {
                                callback();
                            }
                        })
                    } else {
                        evaluate(ctx, step.switch[1], function (e) {
                            if (e) {
                                if (typeof call == "function") {
                                    call(e);
                                }
                                callback(e);
                            } else {
                                callback();
                            }
                        })
                    }
                })
                break;
            case 'concurrence':
                step.concurrence.concurrence(function (e, i, next) {
                    evaluate(ctx, e, next)
                }, callback)
                break;
            // case 'try':
            //     evaluate(ctx, step.try, step.catch, callback)
            //     break;
            case 'pretreatment':
                worker.globalParameter = {
                    name: "预处理",
                    ctx: ctx
                }
                evaluate(ctx, step.metaWork, callback, debuggerInfo, true)
                break;
            case "excelToObject":
                let ctx_in = new Context();
                ctx_in.setParent(ctx);
                newOfficeUtil.excelToObject(step.parameters, function (err, data) {
                    //内部记录方法
                    interiorInfo(step, err, ctx_in)
                    if (err) {
                        return callback(err);
                    }
                    ctx_in.set(step.parameters.rename, data);
                    let steps = [];
                    deepClone(steps, step.steps)
                    evaluate(ctx_in, steps, function (e) {
                        if (e) {
                            if (typeof call == "function") {
                                call(e);
                            } else {
                                callback(e);
                            }
                        } else {
                            setTimeout(function(){
                                let excelObject = ctx_in.get(step.parameters.rename);
                                step.parameters.excelObject = excelObject;
                                newOfficeUtil.objectToFile(step.parameters, function (err, data) {
                                    ctx_in=null;
                                    callback();
                                });
                            },100)
                        }
                    });
                });
                break;
            case 'hashfor':
            case 'for':
                if (typeof step.parameters.circulateCount != "undefined") {
                    for (let i = 0; i < step.parameters.circulateCount; i++) {
                        array.push(i + "")
                    }
                } else {
                    array = step.parameters.objectList
                }
                myForEach.eachSeries(array, myForEach.ensureAsync((e, index, next) => {
                    ctx.set(step.parameters.rename, e)
                    if (typeof step.parameters.rename_i !== "undefined" && step.parameters.rename_i !== "") {
                        ctx.set(step.parameters.rename_i, index)
                    }
                    let steps = [];
                    deepClone(steps, step.steps)
                    evaluate(ctx, steps, next)
                }), callback, step)
                break;
            case 'if':
                compareUtil.compare(step.parameters.lid, step.parameters.op, step.parameters.rid, function (err, data) {
                    if (err) {
                        return callback(err);
                    }
                    if (data) {
                        evaluate(ctx, step.switch[0], function (e) {
                            if (e) {
                                if (typeof call == "function") {
                                    return call(e);
                                }
                                callback(e);
                            } else {
                                callback();
                            }
                        })
                    } else {
                        evaluate(ctx, step.switch[1], function (e) {
                            if (e) {
                                if (typeof call == "function") {
                                    return call(e);
                                }
                                callback(e);
                            } else {
                                callback();
                            }
                        })
                    }
                })
                break;
            case 'break':
                if (step.parameters.breakValue === "") {
                    call("break")
                } else {
                    compareUtil.compare(step.parameters.breakValue, step.parameters.op, step.parameters.breakCondition, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                        if (data) {
                            call("break")
                        } else {
                            callback();
                        }
                    })

                }
                break;
            case 'continue':
                if (step.parameters.continueValue == "") {
                    call("continue")
                } else {
                    compareUtil.compare(step.parameters.continueValue, step.parameters.op, step.parameters.continueCondition, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                        if (data) {
                            call("continue")
                        } else {
                            callback();
                        }
                    })
                }
                break;
            default:
                baseOperate(step, callback);
                break;
        }

    }
    async.eachSeries(workflow, async.applyEachSeries([_evaluate, delay]), function (err) {
        if (err) {
            if (workflowBranch != null) {
                let inCtx = new Context();
                inCtx.setParent(ctx);
                evaluate(inCtx, workflowBranch, call, debuggerInfo);
            } else {
                if (err == "流程终止") {
                    stopTimeOutListen();
                    worker.emit("debugInfo", {
                        globalParameter: worker.globalParameter.ctx.allContext(),
                        partParameter: {
                            prev: worker.partParameterMap,
                            now: worker.partParameterList.length - 1 >= 0 ? worker.partParameterList[worker.partParameterList.length - 1].ctx.allContext() : ""
                        }
                    })
                    worker.emit("workSuccess", worker.retArray)
                    return;
                }
                if (err !== "doEnd") {
                    if (typeof (call) == "function") {
                        call(err);
                    } else {
                        worker.emit("debugInfo", {
                            globalParameter: worker.globalParameter.ctx.allContext(),
                            partParameter: {
                                prev: worker.partParameterMap,
                                now: worker.partParameterList.length - 1 >= 0 ? worker.partParameterList[worker.partParameterList.length - 1].ctx.allContext() : ""
                            }
                        })
                        worker.emit("workFailed", err)
                    }
                }
            }
        } else {
            if (typeof (call) == "function") {
                call();
            } else {
                stopTimeOutListen();
                worker.emit("debugInfo", {
                    globalParameter: worker.globalParameter.ctx.allContext(),
                    partParameter: {
                        prev: worker.partParameterMap,
                        now: worker.partParameterList.length - 1 >= 0 ? worker.partParameterList[worker.partParameterList.length - 1].ctx.allContext() : ""
                    }
                })
                worker.emit("workSuccess", worker.retArray)
            }
        }
    })

}

worker.on("nextDebug", function () {
    worker.isDebug = true;
    worker.emit("next")
})
worker.on("startDebug", function () {
    worker.isDebug = true
})
worker.on("stopDebug", function () {
    worker.isDebug = false;
    worker.emit("next")
})
worker.on("taskStop", function () {
    worker.isStop = true;
})
worker.on("taskEnd", function () {
    worker.isEnd = true;
})
worker.on("taskGoon", function () {
    worker.isStop = false;
    worker.emit("goonTask")
})

module.exports = worker;