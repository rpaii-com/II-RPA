const errorStack = require("../important/errorStack");
let paramUtil = {
    dateFormatSpe: function (data, callback) {
        try {
            let target = data.paramValue;

            let reg_year = /(\d{1,2})年/;
            let reg_month = /(\d{1,2})个?月/;
            let reg_day = /(\d{1,2})天/;

            let year = reg_year.test(target) ? target.match(reg_year)[1] : 0;
            let month = reg_month.test(target) ? target.match(reg_month)[1] : 0;
            let day = reg_day.test(target) ? target.match(reg_day)[1] : 0;

            year = year < 10 ? "0" + String(year) : String(year);
            month = month < 10 ? "0" + String(month) : String(month);
            day = day < 10 ? "0" + String(day) : String(day);

            let res = year + "__" + month + "__" + day;
            callback(null, res);
        } catch (err) {
            callback(errorStack("UndefinedException", "日期处理失败"));
        }
    },
    numTrans: function (data, callback) {
        const Nzh = require("nzh");
        const nzhcn = Nzh.cn;

        let type_trans = data.type;

        switch (type_trans) {
            case 'numTozh':
                let nums = data.paramValue;
                let res = nzhcn.encodeS(nums);
                callback(null, res);
                break;
            case 'zhTonum':
                let zh_nums = data.paramValue;
                let res_zh = nzhcn.decodeS(zh_nums);
                callback(null, res_zh);
                break;
            default:
        }
    },
    strSplit: function (data, callback) {
        let strObject = data.strObject,
            separator = data.separator;
        try {
            let result = strObject.split(separator);
            callback(null, result);
        } catch (err) {
            callback(errorStack("UndefinedException", "输入变量不是字符串！"));
        };
    },
    conArrayRowCol: function (data, callback) {
        var array_con = data.paramValue;
        var array_res = [];
        for (var k = 0; k < array_con[0].length; k++) {
            array_res[k] = [];
        };
        if (Object.prototype.toString.call(array_con) == '[object Array]' &&
            Object.prototype.toString.call(array_con[0]) == '[object Array]') {
            for (var i = 0; i < array_con.length; i++) {
                var array_item = array_con[i];
                for (var j = 0; j < array_item.length; j++) {
                    array_res[j][i] = array_con[i][j];
                }
            }
            callback(null, array_res);
        } else {
            callback(errorStack("UndefinedException", "输入变量不是数组！"));
        }
    },
    //变量-------------------------
    /**
     * 节点执行 -> 设置新变量
     */
    doSaveNewParam: function (paramValue, callback) {
        if (paramValue.trim()[0] == "[" && paramValue.trim()[1] == "]") {
            callback(null, []);
        } else if (paramValue.trim()[0] == "{" && paramValue.trim()[1] == "}") {
            callback(null, {});
        } else {
            try {
                console.log(JSON.parse(paramValue))
                callback(null, JSON.parse(paramValue));
            } catch (e) {
                callback(null, paramValue);
            }
        }
    },
    /**
     * 节点执行 -> 数学运算
     */
    doCalculateParam: function (parameters, callback) {
        let param1 = parameters.param1,
            param2 = parameters.param2,
            operator = parameters.operator
        let calculateResult = '';
        switch (operator) {
            case "+":
                calculateResult = parseFloat(param1) + parseFloat(param2) + '';
                break;
            case "-":
                calculateResult = parseFloat(param1) - parseFloat(param2) + '';
                break;
            case "mult":
                calculateResult = parseFloat(param1) * parseFloat(param2) + '';
                break;
            case "÷":
                calculateResult = parseFloat(param1) / parseFloat(param2) + '';
                break;
            case "mo":
                calculateResult = parseFloat(param1) % parseFloat(param2) + '';
                break;
            default:
                callabck(errorStack("UndefinedException", "暂不支持！"));
                return;
        }
        callback(null, calculateResult);
    },

    /**
     * 节点执行 -> 语法转换 正则匹配
     */
    doConvertParam: function (parameters, callback) {
        //变量取出
        try{
            let paramName = parameters.paramName+'';
            let regexValue = parameters.regexValue;
            let regexResult = paramName.match(regexValue);
            if (regexResult != null && regexResult.length > 0) {
                callback(null, regexResult[0]);
            } else {
                callback(null,'')
                // callback(errorStack("UndefinedException", "正则匹配失败!"));
            }
        }catch(err){
            console.log("正则功能错误");
            console.log(err.toLocaleString());
            callback(null,'')
        }
    },

    /**
     * 节点执行 -> 变量提取
     */
    doExtractParam: function (parameters, callback) {
        //变量取出
        let paramName = parameters.paramName;
        let value = parameters.regexValue;
        callback(null, paramName[value]);
    },

    doCallFunction: function (parameters, callback) {
        //变量取出
        let paramNames = parameters.paramName;
        let func = parameters.functionName;
        let result = '';
        let params = [];
        for (let key in parameters) {
            params.push(parameters[key]);
        }
        param_fun_array.forEach(e => {
            if (func.indexOf(e.f.name) != -1) {
                result = e.f(params);
                return;
            }
        });
        console.log('变量转换:' + params, result);
        callback(null, result);
    },
    simpleFormula: function (data, callback) {
        var formula = data.formula;
        var reg = /[a-zA-Z]+/g;
        if (formula.indexOf(";") != -1 || reg.test(formula)) {
            callback(errorStack("UndefinedException", "变量输入有误!"));
            return;
        }
        var result = new Function("return " + formula)();

        callback(null, result);
    }
}
module.exports = paramUtil