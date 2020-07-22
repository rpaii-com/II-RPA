const errorStack = require("../important/errorStack");
function compare(lo, op, ro, callback) {
    let backParam = false;
    if (typeof ro === "function") {
        callback = ro;
        ro = null;
    } else if (typeof ro !== "undefined" && isRealNum(ro)) {
        ro = parseInt(ro)
    }
    if (typeof lo === "undefined") {
        return process.nextTick(function () {
            callback(errorStack("InvalidArgumentException", "参数无效，请确认参数"))
        })
    }
    if (isParamType(lo) === "boolean") {
        lo = lo + ""
    }
    if (isParamType(ro) === "boolean") {
        ro = ro + ""
    }
    if (isRealNum(lo)) {
        lo = parseInt(lo)
    }
    switch (op) {
        case "大于":
            backParam = lo > ro
            break;
        case "大于等于":
            backParam = lo >= ro
            break;
        case "等于":
            backParam = lo === ro
            break;
        case "小于":
            backParam = lo < ro
            break;
        case "小于等于":
            backParam = lo <= ro
            break;
        case "不等于":
            backParam = lo !== ro
            break;
        case "包含":
            backParam = isInclude(lo, ro)
            break;
        case "不包含":
            backParam = !isInclude(lo, ro)
            break
        default:
            return process.nextTick(function () {
                callback(errorStack("InvalidArgumentException", op + ": 操作不存在!"))

            })
    }
    process.nextTick(function () {
        callback(null, backParam)
    })
}
//判断参数类型
function isParamType(val) {
    if (typeof val === "undefined") {
        return "undefined";
    }
    if (val instanceof Array) {
        return "array";
    }
    if (typeof val === "string") {
        return "string";
    }
    if (typeof val === "boolean") {
        return "boolean";
    }
    if (typeof val === "function") {
        return "function";
    }
    if (isRealNum(val)) {
        return "number";
    }
    if (val instanceof Object) {
        return "map";
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
//判断为空
function isEmpty(val) {
    if (typeof val === "undefined" || val === "" || val === null) {
        return true;
    }
    if (JSON.stringify(val) === "{}") {
        return true;
    }
    if (JSON.stringify(val) === "[]") {
        return true;
    }
    return false;
}
//判断是否包含
function isInclude(master, slave) {
    if (master instanceof Array) {
        return master.includes(slave);
    }
    if (typeof master === "string") {
        return master.includes(slave);
    }
    if (master instanceof Object) {
        return master.hasOwnProperty(slave);
    }
    return false;

}
module.exports = {
    compare: compare,
    isRealNum: isRealNum,
    isEmpty: isEmpty,
    isInclude: isInclude,
    isParamType: isParamType
}