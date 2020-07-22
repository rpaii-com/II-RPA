const http = require('http');
const errorStack = require("../important/errorStack");
var httpPost = {
    config: {
        host: "",
        port: ""
    },
    setConfig: function (confi) {
        this.config = confi
    },
    post: function (path, postData, callback) {
        if (typeof postData == "function") {
            callback = postData;
            postData = null;
        }
        var opts = {
            host: this.config.host,
            port: this.config.port,
            path: path,
            method: "POST"
        };

        opts.headers = {
            'Content-Type': "application/json; charset=UTF-8"
        }
        var str = '';
        var req = http.request(opts, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {
                str += data;
            });
            res.on("end", function () {
                if (res.statusCode == 200) {
                    callback(null, str)
                } else {
                    callback({ code: res.statusCode, msg: res.statusMessage }, str)
                }
            });
            res.on("error", function (e) {
                callback(errorStack("WEBException", e))
            });
        });
        req.on('error', function (e) {
            callback(errorStack("WEBException", e))
        });
        if (postData != null) {
            postData = JSON.stringify(postData);
            req.write(postData);
        }
        req.end();
    }

}

module.exports = httpPost;