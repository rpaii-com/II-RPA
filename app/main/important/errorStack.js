const iconv = require('iconv-lite');
iconv.skipDecodeWarning = true;
function err() {
    let errorObj = {};
    function error(type, message) {
        errorObj.type = type;
        if (typeof message == "string") {
            errorObj.message = message;
        } else {
            errorObj.message = JSON.stringify(message);
        }
        errorObj.GBK = iconv.decode(errorObj.message, 'GBK');
        errorObj.UTF = iconv.decode(errorObj.message, 'UTF-8');

        // Error.prepareStackTrace = function (error, structuredStackTrace) {
        //     var trace = structuredStackTrace.map(function (callSite) {
        //         return ' at: ' + callSite.getFunctionName() + ' ('
        //             + callSite.getFileName() + ':'
        //             + callSite.getLineNumber() + ':'
        //             + callSite.getColumnNumber() + ')';
        //     });
        //     return error.toString() + "\n" + trace.join("\n")
        // };
        Error.captureStackTrace(errorObj, error);
        return errorObj;
    }
    return error;
}

module.exports = new err();
// let a = new err();
// console.log(a("InvalidArgumentException", "asd").stack)
/*
参数无效化异常：    InvalidArgumentException
元素未找到异常：	ElementNotFoundException	页面元素不存在或（CS工具无法捕获的异常？？）
系统异常：	        SystemException	后台运行过程中的意外错误
文件未找到异常：	FileNotFoundException	主要是数据表格功能类的错误，也有打开应用时的报错
文件类型异常：	    FileTypeException	主要是数据表格功能类的错误
创建文件异常：	    FileNotCreateException
类型强制转换异常：	ClassCastException	循环时参数错误的问题 或参数处理中转换时的报错
数组下标越界异常：	ArrayIndexOutOfBoundsException	array 提取时的错误
属性不存在异常：	NoSuchFieldException	map 提取时的错误
权限不足异常：	    IllegalAccessException	可能出错的地方为 打开应用 或CS捕获失败强制退出时
操作数据库异常：	SQLException	主要负责 接口数据库异常
网络访问异常:	    WEBException	http状态码 主要负责 接口访问异常
未定义异常：	    UndefinedException
*/