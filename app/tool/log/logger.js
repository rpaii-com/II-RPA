/** 
 *  
 * ......................我佛慈悲...................... 
 *                       _oo0oo_ 
 *                      o8888888o 
 *                      88" . "88 
 *                      (| -_- |) 
 *                      0\  =  /0 
 *                    ___/`---'\___ 
 *                  .' \\|     |// '. 
 *                 / \\|||  :  |||// \ 
 *                / _||||| -卍-|||||- \ 
 *               |   | \\\  -  /// |   | 
 *               | \_|  ''\---/''  |_/ | 
 *               \  .-\__  '-'  ___/-. / 
 *             ___'. .'  /--.--\  `. .'___ 
 *          ."" '<  `.___\_<|>_/___.' >' "". 
 *         | | :  `- \`.;`\ _ /`;.`/ - ` : | | 
 *         \  \ `_.   \_ __\ /__ _/   .-` /  / 
 *     =====`-.____`.___ \_____/___.-`___.-'===== 
 *                       `=---=' 
 *                        
 *..................佛祖开光 ,永无BUG................... 
 *  
 */

let logger = {}
const log = require('./log');
const sqliteUtil = require('./sqliteUtil');
const path = require('path')

const sequelize=require('./newSqliteUtil').sequelize;
const ParameterInfo=require('./newSqliteUtil').ParameterInfo;
const StepInfo=require('./newSqliteUtil').StepInfo;
const ForInfo=require('./newSqliteUtil').ForInfo;
const JobHtml=require('./newSqliteUtil').JobHtml;
var limitableArr=function (limit){
    thislimit=limit || 10;
    this.arr=[];
    this.timeOut=2000;
    this.timeOutObject;
}

limitableArr.prototype.set=function(value){
    var arr=this.arr;
    var that=this;
    arr.push(value);
    clearTimeout(this.timeOutObject)
    if(this.arr.length==thislimit){
        sequelize.transaction(function (t2) {
            return Promise.all(arr);
            
        });
        this.arr=[];
        
    }else{
        this.timeOutObject=setTimeout(() => {
            sequelize.transaction(function (t2) {
                    return Promise.all(arr);
               
            });
            that.arr=[];
        }, this.timeOut);
    }
}
const limiArr=new limitableArr(1);
let timeout = setInterval(() => {
    reload()
}, 1000)
function reload() {
    sqliteUtil.connect(path.join(__dirname, './../../../config/rpa_logs.db'), function (err) {
        if (err) {
            console.log("无法连接到数据库", err)
        } else {
            clearInterval(timeout)
        }
    })
}
reload();
logger.logJobHtml=function (data) {
    JobHtml.create(data);
};
//添加保存日志到数据库

function subLogData(logData) {
    let res='';
    if(typeof logData==="undefined"){
        return res;
    }else{
        if(JSON.stringify(logData).length>1024){
            res={
                omit:JSON.stringify(logData).substring(0,1024)
            };
            return JSON.stringify(res)
        }else {
            return JSON.stringify(logData)
        }
    }
}

logger.logfor=function (forinfo) {
    // console.log("fornfo");
    // console.log(forinfo);
    let for_info={
        job_id: forinfo.task_id,
        step_id: forinfo.step_id,
        run_times:forinfo.i+1,
    }
    if(forinfo.i==0){
        ForInfo.create(for_info);
    }else{
        ForInfo.update(for_info,{
            where:{
                job_id: forinfo.task_id,
                step_id: forinfo.step_id
            }
        })
    }
    //此处与执行器不同
    let newparameter=forinfo.step.parameters;

    let step_info={
        job_id: forinfo.task_id,
        parameter: subLogData(newparameter),
        running_time: forinfo.date,
        step_id: forinfo.step_id,
        error_step: null,
        step_info: subLogData(newparameter),
        error_info: null,
        step_status:1
    }
    StepInfo.create(step_info);
    //todo  获得变量
    let parameter_name=forinfo.step.outParameterName;
    let parameter=forinfo.parameter;
    let parameter_info={
        history:forinfo.date,
        is_global:0,
        job_id:forinfo.task_id,
        parameter:subLogData(parameter),
        parameter_name:parameter_name,
        step_id:forinfo.step_id
    }
    ParameterInfo.create(parameter_info);
}
//sequsize
logger.log = function (step, error) {
    let isError = error ? true : false;
    let msg = {
        name: step.name,
        desc: step.desc
    }
    //
    // console.log(step);
    // console.log("步骤详情");
    let step_info={
        job_id: step.task_id,
        parameter:subLogData(step.parameters),
        running_time: step.date,
        step_id: step.step_id,
        error_step: step.error_step,
        step_info: logger.logInfo(msg),
        error_info: isError ? logger.logError(error) : null,
        step_status: isError ? 0 : 1
    }
    // console.log("开始写入数据库+stepinfo");
    // console.log(step_info);
    StepInfo.create(step_info);
    if(step.partParameter.hasParameter){
        let is_global=step.partParameter.isGlobal?1:0;
        let parameter_info={
            history:step.date,
            is_global:is_global,
            job_id:step.task_id,
            parameter:subLogData(step.partParameter.parameter),
            parameter_name:step.partParameter.parameter_name,
            step_id:step.step_id
        }
        ParameterInfo.create(parameter_info);
    }
}

//封装日志
logger.logInfo = function (msg) {
    let ret;
    if (judgeType(msg) == 'string') {
        ret = msg;
    } else {
        ret = formatInfo(msg);
    }
    // log.info(ret);
    return ret
}
//封装错误日志
logger.logError = function (error) {
    let ret;
    if (judgeType(error) == 'string') {
        ret = error;
    } else {
        ret = formatError(error)
    }
    log.error(ret);
    return ret;
};

function save(info) {
    if (sqliteUtil.today == sqliteUtil.getNowFormatDate()) {
        sqliteUtil.insert(sqliteUtil.todayTableName, info, function (err) {
            if (err) {
                throw err;
            }
        })
    } else {
        sqliteUtil.createByday("logs", function (err) {
            if (err) {
                throw err;
            } else {
                sqliteUtil.today = sqliteUtil.getNowFormatDate();
                sqliteUtil.todayTableName = "logs" + sqliteUtil.today;
                sqliteUtil.insert(sqliteUtil.todayTableName, info, function (err) {
                    if (err) {
                        throw err;
                    }
                })
            }
        })
    }
}
var judgeType = function (obj) {
    let type = Object.prototype.toString.call(obj).toLowerCase().split(" ")[1];
    return type.substring(0, type.length - 1);
}

//格式化日志
var formatInfo = function (msg) {

    let logText={
        name:msg.name,
        desc:msg.desc
        // parameters:JSON.stringify(msg.parameters)
    }

    return JSON.stringify(logText);
}

//格式化错误日志
var formatError = function (err) {
    // console.log("格式化错误日志");
    // console.log(err);
    let logText={
        name:err.name || "异常捕获",
        message:err.message,
        stack:err.stack || err.type,
        doErrType:err.doErrType || "未做异常处理"
    }

    return JSON.stringify(logText);
};

module.exports = logger;