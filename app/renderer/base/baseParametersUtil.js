// let parametersDersignUtils = {};
// parametersDersignUtils.getGlobalParameters = function () {
//     let array = ctx.get("detailPretreatmentList");
//     return array;
// };
// parametersDersignUtils.createGlobalParametersList = function () {
//     let array = this.getGlobalParameters;
//     let li = '';
//     if (typeof array != 'undefined') {
//         array.forEach((item, index) => {
//             li += '<li>' + item.name + '</li>';
//         });
//     }
//     return li;
// }
// //根据变量id取变量名
// function getParamtersName(id) {
//     let name;
//     parameters.forEach(function (e) {
//         if (e.id == id) {
//             name = e.name;
//         }
//     });
//     return name;
// }

// //根据变量id取变量类型
// function getParamtersType(id) {
//     let obj = ctx.get(id);
//     let type = ctx.signature(obj);
//     let lastType;
//     switch (type) {
//         case "p":
//             lastType = "string";
//             break;
//         case "[p":
//             lastType = "array";
//             break;
//         case "[[p":
//             lastType = "array[array]";
//             break;
//         default:
//             lastType = "string";
//             break;
//     }
//     return lastType;
// }

// //根据变量name取变量类型--块级新增
// function getParamtersTypeByName(name) {
//     let targetUlId = $(".liucheng-list.current-show-list").eq(0).attr("id");
//     let isGlobal = $(".liucheng-list.current-show-list").hasClass("detail-liucheng-pretreatment") ? true : false;
//     let parameters = typeof ctx.get(targetUlId) != "undefined" ? ctx.get(targetUlId) : [];
//     let globalParams = ctx.get("detailPretreatmentList");
//     let type;

//     if (!isGlobal) {

//         parameters.forEach((item, index) => {
//             if (item.name == name) {

//                 type = ctx.get(item.fromId).dataType;
//             }
//         })
//     }
//     if (typeof type == "undefined") {

//         globalParams.forEach((item, index) => {
//             if (item.name == name) {

//                 type = ctx.get(item.fromId).dataType;
//             }
//         });
//     }
//     return type;
// }




// //设置数据类型
// function setDataType(node, nodeType) {
//     switch (nodeType) {
//         case "getSystemParameter": //获取系统变量
//             node.dataType = "string";
//             break;
//         case "getPageURL": //获取当前页面的URL URI
//             node.dataType = "string";
//             break;
//         case "getVCode": //获取验证码
//             node.dataType = "string";
//             break;
//         case "getList": //获取列表内容
//             node.dataType = "array"
//             break;
//         case "getTable": //获取表格内容
//             node.dataType = "array[array]";
//             break;
//         case "resemblance": //获取相似元素内容
//             node.dataType = "array";
//             break;
//         case "InnerHTML": //获取页面元素内容
//             node.dataType = "string";
//             break;
//         case "for": //for循环
//             node.dataType = "string";
//             break;
//         case "hashfor": //迭代循环
//             node.dataType = "string";
//             break;
//         case "importFile": //读取数据表格
//             node.dataType = "array[array]";
//             break;
//         case "extractParam": //提取变量
//             node.dataType = "array";
//             break;
//         case "saveAccount": //设置账号
//             node.dataType = "string";
//             break;
//         case "saveNewParam": //设置新变量
//             node.dataType = "array";
//             break;
//         case "saveAccount": // JJW-TODO
//             node.dataType = "string";
//             break;
//         case "calculateParam": //数学运算
//             node.dataType = "array";
//             break;
//         case "convertParam": //语法转化
//             node.dataType = "array";
//             break;
//         case "callFunction": //变量转换
//             node.dataType = "string";
//             break;
//         case "paramsPaste": //变量黏贴
//             node.dataType = "string";
//             break;
//         case "httpApi": //HTTP接口
//             node.dataType = "array";
//             break;
//         case "socketApi": //socket接口
//             node.dataType = "array";
//             break;
//         case "websocketApi": //websocket接口
//             node.dataType = "array";
//             break;
//         case "backGlobalParam": //返回全局变量
//             node.dataType = "string";
//             break;
//         case "dbConfig"://返回数据库配置
//             node.dataType = "string";
//             break;
//         case "dbSelect"://返回数据库查询数据
//             node.dataType = "string";
//             break;
//         case "dbOthers"://
//             node.dataType = "string";
//             break;
//         case "semantic"://读取语义文件
//             node.dataType = "array";
//             break;
//         case "koulingxuanze"://口令选择
//             node.dataType = "string";
//             break;
//         case "groupPassword"://口令组
//             node.dataType = "array";
//             break;
//         case "fs_exists"://文件是否存在
//             node.dataType = "string";
//             break;
//         case "getPixelColor"://文件是否存在
//             node.dataType = "array";
//             break;
//         case "PreciseReadFile"://精确读取文件
//             node.dataType = "string";
//             break;
//         case "fs_get_all_file"://精确读取文件
//             node.dataType = "array";
//             break;
//         case "importTextFile"://文本文件
//             node.dataType = "array";
//             break;
//         case "callback_pixel_position"://文本文件
//             node.dataType = "array";
//             break;
//         case "string_generacte":
//             node.dataType = "string";
//             break;
//         case "confirmReceive":
//             node.dataType = "array";
//             break;
//         case "simpleFormula":
//             node.dataType = "string";
//             break;
//         case "slidingVerificationCode":
//             node.dataType = "string";
//             break;
//         case "exportFile":
//             node.dataType = "string";
//             break;
//         case "capScreenPart":
//             node.dataType = "string";
//             break;
//         case "getAttributeName":
//             node.dataType = "string";
//         case "getElePosition":
//             node.dataType = "array";
//         case "canGetEle":
//             node.dataType = "string";
//         case "conArrayRowCol":
//             node.dataType = "string";
//         case "IDAccountPassword":
//             node.dataType = "Array";
//         case "CSMove_element":
//             node.dataType = "string";
//         case "arrayConcat":
//             node.dataType = "array";
//         case "CSMoveForVerify":
//             node.dataType = "string";
//         case "archiverFile":
//             node.dataType = "array";
//         case "dbInsert":
//             node.dataType = "string";
//         default:
//             // node.dataType = 'string';
//             break;
//     }
// }
// //对象深拷贝
// function extendCopy(p) {
//     var c = {};
//     for (var i in p) {
//         c[i] = p[i];
//     }
//     return c;
// }