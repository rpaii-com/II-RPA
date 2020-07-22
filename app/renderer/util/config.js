Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
//扩展array 插入索引位置
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
//扩展去重
Array.prototype.unique = function () {
    var res = [];
    var json = {};
    for (var i = 0; i < this.length; i++) {
        if (!json[this[i]]) {
            res.push(this[i]);
            json[this[i]] = 1;
        }
    }
    return res;
}
String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
}
String.prototype.replaceAll.enumerable = false;
Date.prototype.format.enumerable = false;
Array.prototype.unique.enumerable = false;
Array.prototype.insert.enumerable = false;



//全局监听layer
$(document).on("click", function () {
    var flage = false;
    let that = this
    $("body >div").each(function () {
        if ($(this).hasClass("layui-layer")) {
            flage = true;
            return false;
        }
    })
    if (flage) {
        $(document).off('keydown', that.enterEsc);
        that.enterEsc = function (event) {
            if (event.keyCode === 13) {
                $(".layui-layer-btn0").click()
                $(document).off('keydown', that.enterEsc)//取消监听
                return false; //阻止系统默认回车事件
            }
        };
        $(document).on('keydown', that.enterEsc);	//监听键盘事件，关闭层
    }
})


var loadingBox = {}
loadingBox.time = 60 * 60 * 60 * 1000; //默认自动消失时间
loadingBox.start = function () {
    layer.msg('正在读取数据', {
        icon: 16,
        shade: [0.8, '#393D49'],
        time: loadingBox.time,
    });
}
loadingBox.setMsg = function (obj) {

    $(".layui-layer-content").html('<i class="layui-layer-ico layui-layer-ico16"></i>' + obj);
}

loadingBox.end = function () {
    layer.closeAll();
}
function initViewForCallFunction() {
    $(".cover-box").on('click', ".robot-list", function () {
        if ($(this).attr('data') == 'functionList') {
            if ($(this).next().is("ul")) {
                $(this).next().remove();
            } else {
                let ulHtml = '<ul class="common-list" style="display: block;">';
                param_fun_array.forEach((e, index) => {
                    ulHtml += '<li class="" ads="' + e.ads + '"' + 'type_fun="' + e.name + '" fun_param_num=' + e.paramNum + ' fun_index="' + index + '" >' + e.name + ':   ' + e.ads_fun + '</li>';
                });
                ulHtml += '</ul>';
                $(this).after(ulHtml);
            }
        }
    });
    $("body").on('click', '.cover-box [fun_index]', function () {
        var val_text = $(this).attr("type_fun");
        var ads = $(this).attr("ads");
        $(this).parent().parent().find("input").val(val_text);
        $(".input-box input[name=\"paramName\"]").attr("placeholder", ads);
        $(this).parent().hide();
    });
}
onload = function () {
    setTimeout(() => {
        ipc.send("mainReady");
    }, 500);
}
// import {MateWorkFlow} from './../base/class/parameters.js';
const remote = require('electron').remote;
const util = remote.getGlobal('util');
const net = remote.getGlobal('net');
const important = remote.getGlobal('important');
const sysConfig = remote.getGlobal('sysConfig');
const iconv = require('iconv-lite');
iconv.skipDecodeWarning = true;
const ctx = remote.getGlobal('context');
const path = require("path")
const ctt = important.context.context;
const dialog = remote.dialog;
const fs = require('fs');
const httpAjax = net.http;
const nodemailer = require('nodemailer');
const sysPath = remote.getGlobal('path');
let mysqlTemp;
// const MateWorkFlow = require('./../base/class/parameters')
//保存 当前 的数据内容
var nowData = {
    id: "",
    title: "",
    desc: ""
};
ctx.set("sysConfig", sysConfig);
var isLocalSQL = sysConfig.isLocalSQL;
var cn=require(path.join(sysConfig.rootPath, sysConfig.isPackage?"../":"./","config/i18n/cn/translation.json"));
var en=require(path.join(sysConfig.rootPath,sysConfig.isPackage?"../":"./", "config/i18n/en/translation.json"));
let i18nMap={}
Object.entries(cn).forEach(([key,vlaue])=>{
    Object.entries(vlaue).forEach(([key2,vlaue2])=>{
        i18nMap[vlaue2]=en[key][key2]
    })
})
document.addEventListener("DOMContentLoaded",()=>{
    if(sysConfig.i18n==='en'){
        void function traversalUsingTreeWalker(node){
            var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT,function(node){
                if(/[\u4e00-\u9fa5]/gi.test(node.nodeValue)){
                    if(i18nMap[node.nodeValue]){
                        node.nodeValue=i18nMap[node.nodeValue]
                    }
                }
                return NodeFilter.FILTER_ACCEPT;
            },false);
            while(treeWalker.nextNode()!=null);
        }(document.body)
    }
})