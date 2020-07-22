'use strict';

const http = require('http');
const URL = require('url');
const errorStack = require("../important/errorStack");
const queryString = require('querystring');
const path = require("path");
const mime = require('mime-types');
const fs = require('fs')
const rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/;
var pUrl = {
    hostname: "",
    port: "",
    path: "",
};
function config(config) {
    pUrl.hostname = config.host;
    pUrl.port = config.port;
}
function goUpload(req, option) {
    var boundaryKey = "WebKitFormBoundary" + (new Date().getTime()).toString(16);
    var length = 0;
    var indexLength = 0;
    var enddata = '\r\n------' + boundaryKey + '--';
    var isFinish = false;
    var files = new Array();
    var data = "";
    option.data.forEach((obj) => {
        let value = obj.value;
        let key = obj.name;
        if (typeof option.formFileName[key] !== "undefined") {
            let payload = '\r\n------' + boundaryKey + '\r\n'
                + 'Content-Disposition: form-data; name="' + key + (option.formFileName[key]++ === 0 ? "" : option.formFileName[key]) + '"; filename="'
                + value.substring(value.lastIndexOf("/") + 1, value.length) + '"\r\n'
                + 'Content-Type: ' + mime.lookup(value) + '\r\n'
                + 'Content-Transfer-Encoding: binary\r\n\r\n';
            let contentBinary = new Buffer(payload, 'utf-8');
            files.push({
                contentBinary: contentBinary,
                filePath: value
            });
        } else {
            let payload = '\r\n------' + boundaryKey + '\r\n'
                + 'Content-Disposition: form-data; name="' + key + '"\r\n\r\n'
            payload += value
            let dataBinary = new Buffer(payload, "utf-8");
            indexLength += dataBinary.length;
            data += payload
        }
    });
    for (var i = 0; i < files.length; i++) {
        var filePath = files[i].filePath;
        if (fs.existsSync(filePath)) {
            var stat = fs.statSync(filePath);
            indexLength += stat.size;
            indexLength += files[i].contentBinary.length;
        } else {
            req.emit("error", filePath + "文件不存在")
            return;
        }

    }
    req.setHeader('Content-Type', 'multipart/form-data; boundary=----' + boundaryKey);
    req.setHeader('Content-Length', indexLength + Buffer.byteLength(enddata));

    var fileindex = 0;
    var doOneFile = function () {
        var currentFilePath = files[fileindex].filePath;

        var fileStream = fs.createReadStream(currentFilePath, { bufferSize: 4 * 1024 });
        req.write(files[fileindex].contentBinary);
        //data += files[fileindex].contentBinary
        fileStream.pipe(req, { end: false });
        fileStream.on('end', function () {
            fileindex++;
            //console.log(fileindex, files.length)
            if (fileindex == files.length) {
                //console.log("the END", data + enddata)
                //console.log(data + enddata)
                req.end(data + enddata);
            } else {
                doOneFile();
            }
        });
    };
    if (fileindex == files.length) {
        //console.log("the END", data + enddata)
        req.end(data + enddata);
    } else {
        doOneFile();
    }

}
var post = function (userOption, callback) {
    let option = {
        processData: typeof userOption.processData == "undefined" ? true : userOption.processData,
        ContentType: userOption.ContentType || "application/json; charset=utf-8",
        data: userOption.data || "",
        type: userOption.type || "POST",
        url: userOption.url,
        dataType: userOption.dataType || "text",
        formFileName: typeof userOption.formFileName != "undefined" ? userOption.formFileName.split(",") : []
    }
    let temp = {};
    option.formFileName.forEach(value => {
        temp[value] = 0;
    })
    option.formFileName = temp;
    temp = null;
    var opts = {
        host: pUrl.hostname,
        port: pUrl.port,
        path: pUrl.path,
        method: option.type,

    };
    if (option.processData) {
        if (option.data !== "") {
            if ("application/json; charset=utf-8" == option.ContentType) {
                option.data = JSON.stringify(option.data);
            } else {
                option.data = queryString.stringify(option.data);
            }
        }
        opts.headers = {
            "Content-Type": option.ContentType,
        }
    }
    if (rurl.exec(option.url)) { //含有具体http路径
        let newUrl = URL.parse(option.url);
        opts.host = newUrl.hostname;
        opts.port = newUrl.port;
        opts.path = newUrl.path;
    } else {
        opts.path = option.url;
    }
    var str = '';
    var req = http.request(opts, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            str += data;
        });
        res.on("end", function () {
            if (res.statusCode == 200) {
                let callbackParam = str;
                try {
                    callbackParam = JSON.parse(str);
                } catch (e) {
                }
                callback(null, callbackParam);//暂行text
            } else {
                callback({ status: res.statusCode, msg: res.statusMessage }, null)
            }
        });
        res.on("error", function (err) {
            console.log(err)
            callback({ status: res.statusCode, msg: err }, null)
        });
    });
    req.on('error', function (err) {
        callback(errorStack("WEBException", err));
    });
    if (!option.processData) {
        // console.log(opts)
        goUpload(req, option);
    } else {
        if (option.data !== "") req.write(option.data);
        req.end();
    }

}
module.exports = {
    config: config,
    ajax: post
}