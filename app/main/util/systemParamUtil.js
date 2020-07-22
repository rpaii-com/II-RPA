const silly_datetime = require("silly-datetime");
const fs = require('fs');
const path = require('path');
const errorStack = require("../important/errorStack");
const nodemailer = require('nodemailer');
const robot = require('robotjs');
/*接收新邮件，增加imap库，mailparser库*/
const Imap = require('imap'),
    inspect = require('util').inspect;
const simpleParser = require('mailparser').simpleParser;

// nodejieba，需要手动编译，可以cnpm安装，以免被墙
// RPA-V1-designer/RPA-beta-designer/node_modules/nodejieba下cmd
// node-gyp rebuild --target=1.8.4 --arch=x64 --target_arch=x64 --dist-url=https://atom.io/download/electron
// node-gyp rebuild --target=1.8.4 --arch=ia32 --target_arch=ia32 --dist-url=https://atom.io/download/electron

const systemParamUtil = {
    similarSelector: function(data, callback) {
        const nodejieba = require("nodejieba");
        //3种选择方式，按优先级
        //1. 完全匹配，有，退出
        //2. 词语权重计分，若所有结果权重为零，退出
        //3.包含，
        try {
            let target = data.target,
                selectors = data.selectors;

            let topN = 20;
            let hasResult = false;
            let resultValue = {};
            selectors.forEach(function(value) {
                if (value === target) {
                    resultValue = {
                        word: value,
                        similar: 1
                    };
                    hasResult = true
                }
            });

            if (!hasResult) {
                let targetWordLists = nodejieba.extract(target, topN);
                let scoreSum = 0;
                targetWordLists.forEach(function(value) {
                    scoreSum += value.weight;
                });

                resultValue.similar = 0;
                selectors.forEach(function(selector) {
                    let selectorsWordLists = nodejieba.extract(selector, topN);
                    let selectorScore = 0;

                    selectorsWordLists.forEach(function(selectorWord) {
                        targetWordLists.forEach(function(targetWord) {
                            if (selectorWord.word === targetWord.word) {
                                selectorScore += targetWord.weight
                            }
                        })
                    });
                    let similarTem = selectorScore / scoreSum;
                    if (similarTem >= resultValue.similar) {
                        resultValue.similar = similarTem;
                        resultValue.sentence = selector;
                    }
                });
                if (resultValue.similar == 0) {
                    selectors.forEach(function(value) {
                        if (value.indexOf(target) != -1) {
                            resultValue = {
                                word: value,
                                similar: 1
                            };
                            // hasResult = true
                        }
                    });
                }
            }

            callback(null, resultValue);
        } catch (err) {
            console.log(err.toLocaleString());
            return callback(errorStack("FileNotFoundException", err), null);
        }

    },
    getIp: function(data, callback) {
        let interfaces = require('os').networkInterfaces();
        let ret = [];
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (!devName.includes("VMware") && alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    ret.push(alias.address);
                }
            }
        }
        callback(null, ret);
    },
    doReceiveEmail: function(data, callback) {
        var user = data.account;
        var password = data.password;
        var host = data.host;
        var port = data.port;
        let rootdirectory = data.rootdirectory;

        var imap = new Imap({
            user: user,
            password: password,
            host: host,
            port: port,
            tls: true
        });

        function openInbox(cb) {
            imap.openBox('INBOX', true, cb);
        }
        var mail_list = [];
        var mail_length;
        /*事件驱动型，判断保存结果的数组长度，跟结果长度是否相同，决定是否返回回调*/

        imap.once('ready', function() {
            openInbox(function(err, box) {
                if (err) throw err;
                /*条件筛选，未读，10年以后的，可更改*/
                imap.search(['UNSEEN', ['SINCE', 'May 20, 2010']], function(err, results) {
                    mail_length = results.length;
                    if (err) {
                        throw err;
                        callback(err);
                    };
                    var f = imap.fetch(results, { bodies: '' });
                    f.on('message', function(msg, seqno) {
                        console.log('Message #%d', seqno);
                        var prefix = '(#' + seqno + ') ';

                        msg.on('body', function(stream, info) {
                            simpleParser(stream, (err, mail) => {
                                if (mail.attachments.length > 0) {
                                    mail.attachments.forEach(e => {
                                        fs.writeFileSync(rootdirectory + "/" + e.filename, e.content);
                                    });
                                };
                                mail_list.push(mail);
                                if (mail_length == mail_list.length) {
                                    callback(null, mail_list);
                                }
                            });
                            // console.log(prefix + 'Body');
                            // stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
                        });
                        // msg.once('attributes', function(attrs) {
                        //     console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                        // });
                        // msg.once('end', function() {
                        //     console.log(prefix + 'Finished');
                        // });
                    });
                    f.once('error', function(err) {
                        console.log('Fetch error: ' + err);
                    });
                    f.once('end', function() {
                        console.log('Done fetching all messages!');
                        imap.end();
                    });
                });
            });
        });

        imap.once('error', function(err) {
            console.log(err);
            callback(err);
        });

        imap.once('end', function() {
            console.log('Connection ended');
        });

        imap.connect();
    },
    //增加server，port数据
    doSendEmail: function(data, callback) {
        let stepParamter = {};
        stepParamter.account = data.account;
        stepParamter.pwd = data.pwd;
        stepParamter.server = data.server;
        stepParamter.port = data.port;
        stepParamter.receive = data.receive.split(",");
        stepParamter.receive_c = data.receive_c.length != 0 ? data.receive_c.split(",") : false;
        stepParamter.subject = data.subject;
        stepParamter.html = data.html;
        stepParamter.openPath = data.openPath;

        stepParamter.isTxt = typeof (data.isTxt) != "undefined" ? true : false;
        if (stepParamter.isTxt) {
            stepParamter.html = data.txt_con;
        }

        if (stepParamter.account == "" || stepParamter.pwd == "" || stepParamter.receive == "" || stepParamter.subject == "") {
            callback(errorStack("ElementNotFoundException", "邮件信息不完整"));
        } else {
            this.sendEmail(stepParamter.receive, stepParamter.receive_c, stepParamter.subject, stepParamter.html, stepParamter.account, stepParamter.pwd,
                stepParamter.server, stepParamter.port, stepParamter.openPath, stepParamter.isTxt, callback);
        }
    },
    /**
     * 节点执行 -> 发送邮件
     * @param timestamp 节点 时间戳标识
     */
    // doConfirmSend: function(step) {
    //     console.log(step);
    //     //变量取出
    //     let receive = step.parameters.receive;
    //     let subject = step.parameters.subject;
    //     let html = step.parameters.html;
    //     let account = step.parameters.account;
    //     let pwd = step.parameters.pwd;
    //     sendEmail(receive, subject, html, account　, pwd);
    // },

    /**
     * 发送邮件
     * @param receive 接收方
     * @param subject 主题
     * @param html 邮件内容   ("邮件内容：<br/>这是来自nodemailer发送的邮件")
     * @param account 发送方账号
     * @param pwd 发送方密码 (开启 smtp服务)
     */
    sendEmail: function(receive, receive_c, subject, html, account, pwd, server, port, openpath, isTxt, callback) {

        //增加设置项，secure,tls
        var smtpConfig = {
            host: server,
            port: port, //QQ:456
            secure: (port == "587" || port == "25") ? false : true,
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            },
            auth: {
                user: account,
                pass: pwd
            }
        };
        var transporter = nodemailer.createTransport(smtpConfig);

        var option = {
            from: account,
            to: receive,
            subject: subject,
            // pass: pwd
        };
        if (isTxt) {
            option.text = html;
        } else {
            option.html = html;
        };
        if (receive_c) {
            option.cc = receive_c;
        }
        if (openpath.length != 0) {
            option.attachments = [];
            var list_att = openpath.split(",");
            for (var i = 0; i < list_att.length; i++) {
                var path_file = path.parse(openpath);
                var file_name = path_file.base;
                var att_item = list_att[i];
                option.attachments.push({
                    filename: file_name,
                    content: fs.createReadStream(att_item)
                })
            }
        }
        //todo 增加回调函数
        transporter.sendMail(option, function(err, response) {
            if (err) {
                callback(errorStack("WEBException", err));
                //callback('发送失败!错误:' + err);
            } else {
                callback();
                console.log("success: " + response);
            }
        });

    },
    getSystemParame: function(data, callback) {
        let type = data.systemType;
        let setParam = data.setParam;
        let sysData;
        switch (type) {
            case "应用版本号":
                sysData = this.getRobotVersion();
                break;
            case "系统架构":
                sysData = this.getOSArchitecture();
                break;
            case "操作系统版本":
                sysData = this.getOSVersion();
                break;
            case "剪切板内容":
                sysData = this.getClipboard();
                break;
            case "当前时间":
                sysData = this.getSysTime(setParam);
                break;
            case "当前应用使用语言":
                sysData = this.getCurrentLocale();
                break;
            case "应用地址":
                sysData = this.getCurrentPath();
                break;
            case "当前分辨率":
                sysData = this.getScreenSize();
                break;
            default:
                sysData = null;
        };
        console.log(sysData)
        if (sysData == null) {
            callback(errorStack("ElementNotFoundException", "提取失败"));
        } else {
            callback(null, sysData);
        }
    },
    getScreenSize: function() {
        var screenSize = robot.getScreenSize();
        return screenSize;
    },

    getRobotVersion: function() {
        let app = remote.app;
        let version = app.getVersion();
        return version;
    },

    //获得当前系统的架构
    getOSArchitecture: function() {
        let os = require("os");
        let osArchitecture = os.arch();
        return osArchitecture;
    },

    //获得当前操作系统版本
    getOSVersion: function() {
        let os = require("os");
        let osType = os.type(); //返回"Linux"(Linux),"Darwin"(macOS ),"Windows_NT"(Windows)
        let osRelease = os.release(); //返回操作系统的发行版
        let osReleaseList = osRelease.split(".");
        let osVersion = osType + " " + osReleaseList[0];
        return osVersion;
    },

    //获得当前操作系统主版本号
    getOSVersionMajor: function() {
        let os = require("os");
        let osRelease = os.release(); //返回操作系统的发行版
        let osReleaseList = osRelease.split(".");
        console.log(osReleaseList);
        return osReleaseList[1];
    },

    //获得当前操作系统小版本号
    getOSVersionMinor: function() {
        let os = require("os");
        let osRelease = os.release(); //返回操作系统的发行版
        let osReleaseList = osRelease.split(".");
        return osReleaseList.splice(0, 2).join(".");
    },

    //获取剪切板的内容
    getClipboard: function() {
        const clipboard = require('electron').clipboard;
        return clipboard.readText();
    },

    //获得当前系统时间
    getSysTime: function(formType) {
        let time = silly_datetime.format(new Date(), formType || 'YYYY-MM-DD HH:mm:ss');
        // let timeAge = silly_datetime.fromNow(+new Date() - 2000);
        return time;
    },

    //获取当前应用程序语言
    getCurrentLocale: function() {
        return remote.app.getLocale();
    },

    //获取当前应用的地址
    getCurrentPath: function() {
        return remote.app.getAppPath();
    },

    //获取当前应用名称
    getCurrentName: function() {
        return remote.app.getName();
    }
};
module.exports = systemParamUtil