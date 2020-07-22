const net = require('net');
const io = require("socket.io-client");
const url = require('url');
const URL = url.URL;

const errorStack = require("../important/errorStack");

const request=require('request');
const axios = require('axios');
// //此处需要更改适配器，不然默认使用xhr
// axios.defaults.adapter = require('axios/lib/adapters/http');

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const mime = require('mime-types');

const iconv = require('iconv-lite');
const Telnet = require('telnet-client')

//最近还在更新 所以选择了这个库 https://github.com/sergi/jsftp
const jsftp = require("jsftp");

let httpInterface = {
    httpApi: function (data, callback) {
        let method = data.method,
            host = data.host,
            port = data.port,
            path = data.path,
            returnType = data.returnType;
        //将header参数键值对，跟请求参数键值对，对应分开
        //现在主循环一遍
        let headers = {}, paramers = {};

        let headerTemp3 = {};
        let paramTemp3 = {};
        for (let item in data) {
            if (item.indexOf("header") > -1) {
                if (item.indexOf("Key") > -1) {
                    let index = item.substring(9);
                    if (typeof headerTemp3[index] != "undefined") {
                        headers[data[item]] = headerTemp3[index]["headerValue" + index]
                    } else {
                        headerTemp3[index] = {};
                        headerTemp3[index][item] = data[item]
                    }
                } else if (item.indexOf("Value") > -1) {
                    let index = item.substring(11);
                    if (typeof headerTemp3[index] != "undefined") {
                        headers[headerTemp3[index]["headerKey" + index]] = data[item]
                    } else {
                        headerTemp3[index] = {};
                        headerTemp3[index][item] = data[item]
                    }
                } else { }

            } else if (item.indexOf("params") > -1) {
                if (item.indexOf("Key") > -1) {
                    let index = item.substring(9);
                    if (typeof paramTemp3[index] != "undefined") {
                        paramers[data[item]] = paramTemp3[index]["paramsValue" + index]
                    } else {
                        paramTemp3[index] = {};
                        paramTemp3[index][item] = data[item]
                    }
                } else if (item.indexOf("Value") > -1) {
                    let index = item.substring(11);
                    if (typeof paramTemp3[index] != "undefined") {
                        paramers[paramTemp3[index]["paramsKey" + index]] = data[item]
                    } else {
                        paramTemp3[index] = {};
                        paramTemp3[index][item] = data[item]
                    }
                } else { }
            } else { }
        }

        console.log(headers);
        console.log(paramers);

        axios({
            method: method,
            url: path,
            baseURL: host + ":" + port,
            params: paramers,
            headers: headers,
            timeout: 15000
        }).then(function (response) {
            if (returnType === "response") {
                callback(null, response.data);
            } else {
                callback(null, response.headers);
            }
        }).catch(err => {
            callback(err);
        })

    },
    download:function (data,callback) {
        // 采用axios，不更改适配器，不能使用文件流传输
        //更改适配器，本地代理，无法连接
        let url_download=data.url_download,
            directory=data.directory;

        let url_pa=url.parse(url_download)

        let opts = {
            method: "GET",
            uri:encodeURI(url_download),
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36"
            }
        };
        let fileName;
        request(opts)
            .on('response', function(res) {
                let head_con=res.headers['content-disposition'].split("filename=");
                fileName=decodeURI(head_con[head_con.length-1]);
                res.pipe(fs.createWriteStream(directory+"/"+fileName))
                callback(null,directory+"/"+fileName)
            })
            .on('error',function (err) {
                callback(err)
            })
    },
    upload: function (data, callback) {
        let file_path_zong = data.file;

        let headers = {};

        let headerTemp3 = {};

        for (let item in data) {
            if (item.indexOf("header") > -1) {
                if (item.indexOf("Key") > -1) {
                    let index = item.substring(9);
                    if (typeof headerTemp3[index] != "undefined") {
                        headers[data[item]] = headerTemp3[index]["headerValue" + index]
                    } else {
                        headerTemp3[index] = {};
                        headerTemp3[index][item] = data[item]
                    }
                } else if (item.indexOf("Value") > -1) {
                    let index = item.substring(11);
                    if (typeof headerTemp3[index] != "undefined") {
                        headers[headerTemp3[index]["headerKey" + index]] = data[item]
                    } else {
                        headerTemp3[index] = {};
                        headerTemp3[index][item] = data[item]
                    }
                } else { }
            } else { }
        }
        console.log(headers);

        let filename_list = file_path_zong.split(',');
        let url_upload = data.url_upload;
        let data_form = new FormData();

        for (let item in headers) {
            data_form.append(item, headers[item]);
        }
        filename_list.forEach((item, index) => {
            let filename = path.parse(item).base;
            let file_data = fs.createReadStream(item);
            let file_stat = {
                filename: filename.basename,
                contentType: mime.lookup(item)
            }
            let formDataFileName="File"+(index+1);
            data_form.append(formDataFileName, file_data, file_stat);
        });

        // data_form.append('type',mime.lookup(file_path));

        //此处需要更改适配器，不然默认使用xhr
        axios.defaults.adapter = require('axios/lib/adapters/http');
        let getHeaders = (form => {
            return new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err)
                    let headersAxios= Object.assign({ 'Content-Length': length }, form.getHeaders())
                    resolve(headersAxios)
                })
            })
        })

        getHeaders(data_form)
            .then(headersAxios => {
                return axios.post(url_upload, data_form, { headers: headersAxios })
                    .then(function (res) {
                        console.log(res);
                        callback(null,res.data);
                    })
                    .catch(function (err) {
                        callback(errorStack("WEBException", err.toLocaleString()));
                    });
            })
    }
}

let websocketInterface = {
    /*
    * websocket目前仅限：
    * websocket服务器端，连接成功，触发事件，客户端接受该事件信息*/
    start: function (data, callback) {
        var host = data.host;
        var port = data.port;
        var signal = data.signal;
        var data_type = data.data_type;

        var conncect_uri = host.indexOf("http://") ? ("http://" + host) : host;

        var url_new = new URL(conncect_uri);
        url_new.port = port;

        var new_conncect_uri = url_new.toString();

        var socket = io.connect(new_conncect_uri);
        socket.on(signal, function (data) {
            switch (data_type) {
                case "json":
                    var json_data = data;
                    console.log(json_data);
                    callback(null, json_data);
                    break;
                case "text":
                    console.log(data.toString());
                    callback(null, data.toString());
                    break;
                default:
                    callback(errorStack("ElementNotFoundException", "没有此选项！"));
            }
        });
    }
};

let socketInterface = {
    start: function (data, callback) {
        var host = data.host;
        var port = data.port;
        var signal = data.signal;
        var data_type = data.data_type;

        var client = new net.Socket();
        client.connect(port, host, function () {
            client.write(signal);
        });

        client.on('data', function (data) {
            switch (data_type) {
                case "json":
                    var json_data = JSON.parse(data.toString());
                    console.log(json_data);
                    callback(null, json_data);
                    break;
                case "text":
                    console.log(data.toString());
                    callback(null, data.toString());
                    break;
                default:
                    callback(errorStack("ElementNotFoundException", "没有此选项！"));
            }
            client.destroy();
        });
        client.on('error', function (err) {
            console.log(err.stack);
            callback(error, null);
            callback(errorStack("SQLException", "socket接口出错！"));
        });

        // 为客户端添加“close”事件处理函数
        client.on('close', function () {
            console.log('Connection closed');
        });
    }
};


/***************ftp***************/
let ftpInterface = {
    close: function (ftp) {
        ftp.raw("QUIT");
        ftp.destroy();
    },
    downLoad: function (conifg, remotePath, localPath, fileNmae, callback) {
        const ftp = new jsftp(conifg);
        ftp.get(((remotePath == "" ? "" : remotePath + "/") + fileNmae), localPath + "/" + fileNmae, err => {
            ftpInterface.close(ftp);
            if (err) {
                return callback(errorStack("FtpException", err));
            }
            callback();
        });

    },
    uploadFile: function (conifg, remotePath, localPath, fileNmae, callback) {
        const ftp = new jsftp(conifg);
        fs.readFile(localPath, (err, buffer) => {
            if (err) {
                ftpInterface.close(ftp);
                return callback(errorStack("FileNotFoundException", err));
            }
            ftp.put(buffer, ((remotePath == "" ? "" : remotePath + "/") + fileNmae), err => {
                ftpInterface.close(ftp);
                if (err) {
                    return callback(errorStack("FtpException", err));
                }
                callback();
            });
        })
    }
}
let telnetInterface = function () {
    const connection = new Telnet()
    const reconnectionNum = 10;
    let reconnectNum = 0;
    let quitFlag = false;
    function connectd(host, port = 23, username, password, callback) {
        let reconnect = function (data) {
            if (reconnectionNum > reconnectNum++ && !quitFlag) {
                connection.connect(data)
            } else {
                callback ? callback(errorStack("TelnetException", "超出重连次数")) : console.log('err occured : "超出重连次数"');
                callback = null;
                connection.end()
            }
        }
        const params = {
            host: host,
            port: port,
            timeout: 5000,
            username: username,
            password: password,
            debug: true,
            shellPrompt: /[:][~][$ ]*$/i,

        }
        connection.connect(params)
        connection.on('ready', function (prompt) {
            callback ? callback(null) : "";
            callback = null;
        })
        connection.on('error', function (err) {
            reconnect(params)
        });
        connection.on('timeout', function () {
            reconnect(params)
        })
        connection.on('failedlogin', function (err) {
            callback ? callback(errorStack("TelnetException", err)) : console.log('err occured :' + err);
            callback = null
        });
        connection.on('close', function (err) {
            if (quitFlag) {
                console.log('see you next');
            } else {
                reconnect(params)
            }
        })
    }
    function write(cmdStr, callback) {
        if (cmdStr.toString().trim().toLowerCase().includes('quit')) {
            callback(errorStack("TelnetException", "无效命令！不能使用quit关闭，请用关闭telnet功能"))
        } else {
            connection.send(cmdStr, (err, data) => {
                if (err) {
                    return callback(errorStack("TelnetException", err))
                }
                data = data.split("\n")
                data.splice(0, 1)
                data.splice(data.length - 1, 1)
                data = data.join("\n");
                callback(null, data)
            })
        }
    }
    function disConnect() {
        quitFlag = true;
        connection.end();
    }
    return {
        connect: connectd,
        write: write,
        disConnect: disConnect,
    }

}
/***************ftp***************/

module.exports = {
    websocketInterface: websocketInterface,
    socketInterface: socketInterface,
    httpInterface: httpInterface,
    ftpInterface: ftpInterface,
    telnetInterface: new telnetInterface()
}