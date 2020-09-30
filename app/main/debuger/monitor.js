const DevicePixelRatio = window.devicePixelRatio;

var isFrist_python=true;
//启动python服务，
function pythonStart(){
    if (isFrist_python){
        const { PythonShell } = require('python-shell');
        const iconv = require('iconv-lite');
        const path = require('path')
        console.log(process.execPath)
        console.log(__dirname)
        console.log(process.cwd())
        const python_filePath = path.join(process.cwd(),"./extend/python/python_service.py")
        const python_execPath = path.join(process.cwd(),"./extend/python/python37/python.exe")
        let filePath =  python_filePath;//需要执行的python文件路径
        let port=18081;
        let options = {
            mode: 'binary',
            pythonPath: python_execPath,//具体python.exe位置
            args: [port],//设置端口
            pythonOptions: ['-u'],
            parser: (data) => iconv.decode(data, 'GBK'),
            stderrParser: (data) => iconv.decode(data, 'GBK'),
        };
        let shell = new PythonShell(filePath, options);
        shell.on('message', function (message) {
            console.log(filePath, `\npython服务已启动，请打开下面链接访问:\nhttp://127.0.0.1:${port}`)
            console.log(`[python server]`, message)
        });
        shell.on('error', function (message) {
            console.error(`[python server]`, message)
        });
        shell.on('close', function (message) {
            console.info("[python server] python server is closed !");
        });
        isFrist_python = false;
    }else{
        console.log("python服务已启动，");
    }
    //关闭
    // shell && shell.terminate()
    //console.log(`[python server] python server is closed`)
    //node axios,httpclient,	
}

//执行python，
function python_exec(pythonfilePath,functionName,parameters){
    let axios_flag = true;
    const axios = require('axios');
    const data = {
                    "pythonfilePath": pythonfilePath,
                    "functionName": functionName,
                    "parameters": parameters,
                    "timestamp": Date.now()
    }

    const headers = { 
    ContentType: "application/json; charset=utf-8"
    };
    //var rename_python = "";
    if(axios_flag){
        axios_flag = false;
        return axios({
            method: 'post',
            url: 'http://localhost:18081',
            data: data,
            headers: headers
        })
            .then(function(response) {
                console.log("response.status:------------");
                console.log(response.status);
                axios_flag = true;
                return response.data.content;
            })
            .catch(function (error) {
                console.log(error);
                axios_flag = true;
            });
    }else{
        return
    }
    //return rename_python
}

//添加once方法
function once(dom, event, callback) {
    var handle = function (e) {
        e.stopPropagation();
        callback(e);
        dom.removeEventListener(event, handle);
        handle = null;
    }
    dom.addEventListener(event, handle)
    return handle;
}

function saveHistory(data, ctx, file_path, callback) {
    if (data.rename.length != 0) {
        ctx.set(data.rename, file_path);
    }
    if (typeof (data.isSaveHistory) != "undefined") {
        if (data.isSaveHistory.length == 0) {
            var newFileName = path.basename(file_path);
        } else {
            var newFileName = data.newFileName;
        }
        var directory = incident.getDirectory() + "/savehistory";
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        fileOperateNew.copy_rename_file(file_path, directory, newFileName, callback);
    } else {
        callback();
    }
}
//邮件正文处理，替换@系统变量
function parserHtml(html, ctx, callback) {
    if (html.indexOf("@") != (-1)) {
        let regx_at = /@\S+/g;
        var results = html.match(regx_at);
        var map_at = new Set();
        results.forEach(function (value) {
            var result = value.replace("@", '');
            map_at.add(result)
        })
        map_at.forEach(function (value) {
            var param_ctx = ctx.get(value);
            if (typeof (param_ctx) != "undefined") {
                if (Object.prototype.toString.call(param_ctx) == '[object Array]') {
                    param_ctx = JSON.stringify(param_ctx).replace("[", '').replace("]", "");
                }
                if (typeof param_ctx == "number") {
                    param_ctx = JSON.stringify(param_ctx);
                }
                param_ctx = param_ctx.replace(/,/g, "，");
                var new_regx = new RegExp("@" + value + "\\s", "g");
                html = html.replace(new_regx, param_ctx);
            }
        })
    }
    callback(null, html.replace(/ /g, ' ').trim());
}

function TypeOf(ctx, test) {
    if (ctx.isPrimitive(test)) {
        return typeof test;
    } else {
        return ctx.signature(test);

    }
}

function arrayInt(array) {
    let intArray = []
    intArray = array.map(element => {
        return parseInt(element);
    });
    return intArray;
}
//cs
function csoperate(step, callback) {

    const exec = require('child_process').exec;
    let cmdStr = sysPath.CShandle + '/uispy.exe -m foucs -v "' + JSON.stringify(step.parameters).replace(/"/g, "'") + '"'
    exec(cmdStr, {
        encoding: 'binary'
    }, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            // err = iconv.decode(new Buffer(err, 'binary'), 'GBK');
            err = iconv.decode(err, 'GBK');

            callback(errorStack("ElementNotFoundException", err));
            return;
        }
        if (typeof stdout === 'undefined') {
            stdout = '';
            console.warn('cs参数stdout为undefined');
        }
        if (typeof stderr === 'undefined') {
            stderr = '';
            console.warn('cs参数stderr为undefined');
        }
        // var str = iconv.decode(new Buffer(stdout, 'binary'), 'GBK');
        // var str2 = iconv.decode(new Buffer(stderr, 'binary'), 'GBK');
        var str = iconv.decode(stdout, 'GBK');
        var str2 = iconv.decode(stderr, 'GBK');
        callback(null, str);
    })

}

$("#main-body").on("click", ".webview-pages i", function () {
    if (typeof $(this).parents("li").attr("index") == "undefined") {
        return;
    }
    let index = $(this).parents("li").attr("index");
    $("#foo" + index).remove();
    $(this).parents("li").remove();
    setTimeout(() => {
        $(".webview-pages li").last().click();
        webview = $("webview").last()[0]
    }, 0);

});
$("#main-body").on("click", ".webview-pages li", function () {
    let index = $(this).attr("index");
    $(".webview-pages").find("li").removeClass("page-selected");
    $(this).addClass("page-selected");
    //$("body webview").hide();
    $("body webview").addClass("webview-hide");
    if (typeof index == "undefined") {
        webview = $("#foo")[0]
        try {
            webview.focus();
        } catch (err) {
            console.log(err);
        }
        //$("#foo").show();
        $("#foo").removeClass("webview-hide");
    } else {
        webview = $("#foo" + index)[0]
        try {
            webview.focus();
        } catch (err) {
            console.log(err);
        }
        // $("#foo" + index).show();
        $("#foo" + index).removeClass("webview-hide");
    }
});

// chorme do
incident.addEVent("click", function (step, callback, ctx) {
    once(webview, "ipc-message", function (event) {
        event.stopPropagation();
        if (event.channel.code == 200) {
            fs.readFile(sysConfig.rootPath + '/app/main/debuger/Scalable/actuator.js', function (err, data) {
                if (err) {
                    throw err;
                    console.error(err);
                    callback(err);
                    return;
                }
                data += ';action(' + JSON.stringify(step) + ');'
                webview.executeJavaScript(data, true, function (data) {
                    callback();
                })
            });
        } else {
            incident.webAction(event.channel)
        }
    })

    let isload = setInterval(() => {
        if (webview != null && !webview.isLoading()) {
            clearInterval(isload);
            webview.send('action', step);
        }
    }, 500)
    if (webview != null && !webview.isLoading()) {
        clearInterval(isload);
        webview.send('action', step);
    }

})
incident.addEVent("chromeOp", function (step, callback, ctx) {
    once(webview, "ipc-message", function (event) {
        event.stopPropagation();
        incident.webAction(event.channel)
    })
    if (step.parameters.userGesture == "hand") {
        fs.readFile(sysConfig.rootPath + '/app/main/debuger/Scalable/actuator.js', function (err, data) {
            if (err) {
                throw err;
                console.error(err);
                callback(err);
                return;
            }
            data += ';action(' + JSON.stringify(step) + ');'
            webview.executeJavaScript(data, true, function (data) {
                callback();
            })
        });
    } else {
        let isload = setInterval(() => {
            if (webview != null && !webview.isLoading()) {
                clearInterval(isload);
                webview.send('action', step);
            }
        }, 500)
        if (webview != null && !webview.isLoading()) {
            clearInterval(isload);
            webview.send('action', step);
        }
    }
})

//剪贴板等待时间
incident.addEVent("clipboardWaitTime", function (step, callback, ctx) {

    worker.incident.setGlobalContext("clipboardWaitTime", step.parameters.sleep);
    callback();
})

//全局等待时间
incident.addEVent("globalWaitTime", function (step, callback, ctx) {

    worker.globalWaitTime = step.parameters.WaitTime;
    worker.globalFloatWaitTime = step.parameters.floatWaitTime
    callback()
})

//等待时间
incident.addEVent("waitTime", function (step, callback, ctx) {
    setTimeout(() => {
        callback()
    }, step.parameters.sleep);
})

//关闭页面
incident.addEVent("closePage", function (step, callback, ctx) {

    let index = $(".page-selected").attr("index");
    if (typeof index == "undefined") {
        callback();
        return;
    }
    $(".page-selected").remove();
    $("#foo" + index).remove();
    $(".webview-pages li").each((i, e) => {
        if (index - 1 == 1) {
            $(e).click();
            webview = $("#foo")[0];
            webview.focus();
            callback();
        } else if ($(e).attr('index') == index - 1) {
            $(e).click();
            webview = $("#foo" + (index - 1))[0];
            webview.focus();
            callback();
        }
    })
})
// // 断言框
// incident.addEVent("assert", function (step, callback, ctx) {
//     return;
//     let param = step.parameters
//     let val;
//     console.log(param);
//     switch (param.type) {
//         case "assert_type":
//             val = param.paramName
//             let typeName = param.typeName;
//             // 检查类型断言
//             if (TypeOf(ctx, val) == typeName) {
//                 callback();
//             } else {
//                 // 抛出 断言异常
//                 console.log("TypeException");
//                 callback({ msg: "TypeException", code: 500 })

//             }
//             break;

//         case "assert_value":
//             val = param.paramName;
//             let op = param.op;
//             let test_val = param.assertValue;
//             // 检查数值断言
//             if (operate(val, op, test_val)) {
//                 callback();
//             } else {
//                 // 抛出 断言异常
//                 callback({ msg: "TypeException", code: 500 })
//             }
//             break;
//     }


// })
incident.addEVent("importFile", function (step, callback, ctx) {
        step.parameters.CShandle = sysPath.CShandle;
        officeUtil.readTableData(step.parameters, function (err, data) {
            if (err) {
                callback(err);
                return;
            }
            ctx.set(step.parameters.rename, data);
            callback()
        })

})
incident.addEVent("importFile_normal", function (step, callback, ctx) {
    step.parameters.CShandle = sysPath.CShandle;
    officeUtil.readTableData(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback()
    })

})
incident.addEVent("importTextFile", function (step, callback, ctx) { //读取文本文件
        step.parameters.CShandle = sysPath.CShandle;
        officeUtil.readTableData(step.parameters, function (err, data) {
            if (err) {
                callback(err);
                return;
            }
            ctx.set(step.parameters.rename, data);
            callback()
        })
})
incident.addEVent("importTextFile_normal", function (step, callback, ctx) { //读取文本文件
    step.parameters.CShandle = sysPath.CShandle;
    officeUtil.readTableData(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback()
    })
})

incident.addEVent("exportFile", function (step, callback, ctx) {
    console.log(step.parameters.valueParam)
    officeUtil.writeFile(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        saveHistory(step.parameters, ctx, data, callback);
    })
})
incident.addEVent("saveNewParam", function (step, callback, ctx) {

    paramUtil.doSaveNewParam(step.parameters.paramValue, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
})
incident.addEVent("saveAccount", function (step, callback, ctx) { //设置新帐号 // JJW-TODO
    ctx.set(step.parameters.rename + "账号", step.parameters.usernameValue);
    ctx.set(step.parameters.rename + "密码", step.parameters.pwdValue);
    callback();
})
incident.addEVent("calculateParam", function (step, callback, ctx) { //数学运算
    paramUtil.doCalculateParam(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
});
incident.addEVent("simpleFormula", function (step, callback, ctx) { //简单四则运算
    paramUtil.simpleFormula(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
});
incident.addEVent("convertParam", function (step, callback, ctx) { //语法转化
    paramUtil.doConvertParam(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
})
incident.addEVent("extractParam", function (step, callback, ctx) { //提取变量
    paramUtil.doExtractParam(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
})
incident.addEVent("callFunction", function (step, callback, ctx) { //变量转换
    paramSwitchUtil.doParamSwitch(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        console.log(step.parameters.rename, data)
        ctx.set(step.parameters.rename, data);
        callback();
    });
});

incident.addEVent("confirmSend", function (step, callback, ctx) { //发送邮件
    parserHtml(step.parameters.html, ctx, function (err, data) {
        step.parameters.html = data
        systemParamUtil.doSendEmail(step.parameters, function (err, data, ctx) {
            if (err) {
                callback(err);
                return;
            }
            callback();
        });
    })
});
incident.addEVent("confirmReceive", function (step, callback, ctx) { //接收新邮件
    step.parameters.rootdirectory = incident.getDirectory();
    systemParamUtil.doReceiveEmail(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
});
incident.addEVent("getSystemParameter", function (step, callback, ctx) { //获取系统变量
    systemParamUtil.getSystemParame(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
})
incident.addEVent("CSMoveForChildName", function (step, callback, ctx) { //桌面zi级寻名
    let cmdStr = sysPath.CShandle + '/uispy.exe -m findChildByName -v "' + JSON.stringify(step.parameters).replace(/"/g, "'").replace("childname", "name") + '"'
    exec(cmdStr, {
        encoding: 'binary'
    }, function (err, stdout, stderr) {
        if (err) {
            // err = iconv.decode(new Buffer(err, 'binary'), 'GBK');
            err = iconv.decode(err, 'GBK');
            callback(errorStack("ElementNotFoundException", err));
            return;
        }
        try {
            json = JSON.parse(stdout);
            if (json.code == 200) {
                CSRobotUtil.cs.click();
                callback();
            } else {
                callback(errorStack("ElementNotFoundException", json));
            }
        } catch (e) {
            callback(errorStack("ClassCastException", e))
        }
    });

})
incident.addEVent("CSMoveForName", function (step, callback, ctx) { //桌面同级寻名
    let cmdStr = sysPath.CShandle + '/uispy.exe -m findByName -v "' + JSON.stringify(step.parameters).replace(/"/g, "'") + '"'
    exec(cmdStr, {
        encoding: 'binary'
    }, function (err, stdout, stderr) {
        if (err) {
            // err = iconv.decode(new Buffer(err, 'binary'), 'GBK');
            err = iconv.decode(err, 'GBK');
            callback(errorStack("ElementNotFoundException", err));
            return;
        }
        try {
            json = JSON.parse(stdout);
            if (json.code == 200) {
                CSRobotUtil.cs.click();
                callback();
            } else {
                callback(errorStack("ElementNotFoundException", json));
            }
        } catch (e) {
            callback(errorStack("ClassCastException", e))
        }
    });

})
incident.addEVent("CSMoveForVerify", function (step, callback, ctx) { //桌面鼠标移动验证
    let cmdStr = sysPath.CShandle + '/uispy.exe -m verifyFocus -v "' + JSON.stringify(step.parameters).replace(/"/g, "'") + '"'
    exec(cmdStr, {
        encoding: 'binary'
    }, function (err, stdout, stderr) {
        if (err) {
            // err = iconv.decode(new Buffer(err, 'binary'), 'GBK');
            err = iconv.decode(err, 'GBK');
            callback(errorStack("ElementNotFoundException", err));
            return;
        }
        try {
            console.log(stdout);
            stdout = stdout.replace(/\r\n/g, "")
            let tempStr = JSON.parse(stdout);
            ctx.set(step.parameters.rename, tempStr.code == 200 ? true : false)
            callback();
        } catch (e) {
            callback(errorStack("ClassCastException", e))
        }
    });

})
incident.addEVent("ActuatorForVerify", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m verifyFocus -v "' + JSON.stringify(step.parameters).replace(/"/g, "'") + '"'
    exec(cmdStr, {
        encoding: 'binary'
    }, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            err = iconv.decode(err, 'GBK');
            console.log("发送自定义事件");
            ipc.send("fuzhu_actutor_alert", "haha");
            // callback(errorStack("ElementNotFoundException", err));
            return;
        }
        try {
            console.log(stdout);
            stdout = stdout.replace(/\r\n/g, "")
            let tempStr = JSON.parse(stdout);
            if (tempStr.code == 200) {
                callback();
            } else {
                console.log("发送自定义事件");
                ipc.send("fuzhu_actutor_alert", "haha");
                ipc.on("continue_do_fuzhu_pre", function (event, data) {
                    if (data == "yes") {
                        console.log(data);
                        callback();
                    } else {
                        console.log(data);
                        callback(errorStack("ClassCastException"));
                    }
                })
            }
            // ctx.set(step.parameters.rename, tempStr.code == 200 ? true : false)
        } catch (e) {
            callback(errorStack("ClassCastException", e))
        }
    });

})
incident.addEVent("CSMoveForRelative", function (step, callback, ctx) {
    temp = step.parameters.relative.split(",");
    x = parseInt(temp[0]);
    y = parseInt(temp[1]);
    csoperate(step, function (error, data) {
        if (error) {
            callback(error)
            return
        }
        let json;
        try {
            json = JSON.parse(data);
            if (typeof json.code === "undefined" || json.code == 200) {
                typeof json.code === "undefined" ? "" : json = json.msg;
                console.log(json, json.X + json.Width / 2, x)
                CSRobotUtil.cs.moveMouse(json.X + json.Width / 2 + x, json.Y + json.Height / 2 + y);
                CSRobotUtil.cs.click();
                callback();
            } else {
                callback(errorStack("ElementNotFoundException", json));
            }
        } catch (e) {
            callback(errorStack("ElementNotFoundException", "无法获取句柄"));
        }

    })

})
incident.addEVent("CSmove", function (step, callback, ctx) { //桌面鼠标移动
    temp = step.parameters.rectangle.split(",");
    x = temp[0];
    y = temp[1];
    if (step.parameters.path.trim() != "") {
        csoperate(step, function (error, data) {
            if (error) {
                callback(error)
                return
            }
            let json;
            try {
                json = JSON.parse(data);
                if (typeof json.code === "undefined" || json.code == 200) {
                    typeof json.code === "undefined" ? "" : json = json.msg;
                    console.log(json, json.X + json.Width / 2, x)
                    CSRobotUtil.cs.moveMouse(json.X + json.Width / 2, json.Y + json.Height / 2);
                    CSRobotUtil.cs.click();
                    callback();
                } else {
                    if (step.parameters.mouseMove) {
                        throw data;
                    } else {
                        console.error("无法获取句柄" + data)
                        callback(errorStack("ElementNotFoundException", json));
                    }
                }
            } catch (e) {
                if (step.parameters.mouseMove) {
                    CSRobotUtil.cs.moveMouse(x, y);
                }
                if (step.parameters.mouseClick) {
                    CSRobotUtil.cs.click();
                }
                callback();
            }

        })
    } else {
        if (step.parameters.mouseMove) {
            CSRobotUtil.cs.moveMouse(x, y);
        }
        if (step.parameters.mouseClick) {
            CSRobotUtil.cs.click();
        }
        callback();
    }
})
/*元素定位*/
incident.addEVent("CSMove_element", function (step, callback, ctx) {
    if (typeof step.parameters.rename != "undefined") {
        ctx.set(step.parameters.rename, step.parameters.winTitle);
    }
    temp = step.parameters.rectangle.split(",");
    x = temp[0];
    y = temp[1];
    csoperate(step, function (error, data) {
        if (error) {
            callback(error)
            return
        }
        let json;
        try {
            json = JSON.parse(data);
            if (typeof json.code === "undefined" || json.code == 200) {
                typeof json.code === "undefined" ? "" : json = json.msg;
                console.log(json, json.X + json.Width / 2, x)
                CSRobotUtil.cs.moveMouse(json.X + json.Width / 2, json.Y + json.Height / 2);
                CSRobotUtil.cs.click();
                callback();
            } else {
                if (step.parameters.mouseMove) {
                    throw data;
                } else {
                    console.error("无法获取句柄" + data)
                    callback(errorStack("ElementNotFoundException", json));
                }
            }
        } catch (e) {

            if (step.parameters.mouseMove) {
                CSRobotUtil.cs.moveMouse(x, y);
            }
            if (step.parameters.mouseClick) {
                CSRobotUtil.cs.click();
            }
            callback();
        }

    })
});
/*坐标定位*/
incident.addEVent("CSmove_position", function (step, callback, ctx) {
    temp = step.parameters.rectangle.split(",");
    x = temp[0];
    y = temp[1];
    if (step.parameters.mouseMove) {
        CSRobotUtil.cs.moveMouse(x, y);
    }
    if (step.parameters.mouseClick) {
        CSRobotUtil.cs.click();
    }
    callback();
})

incident.addEVent("mouseRoll", function (step, callback, ctx) { //鼠标滚动
    temp = step.parameters.rectangle.split(",");
    x = temp[0];
    y = temp[1];
    //句柄事件
    if (step.parameters.path.trim() != "") {
        csoperate(step, function (error) {
            if (error) {
                callback(error)
                return
            }
            CSRobotUtil.cs.scroll(step.parameters.mouseRollUpOrDown, step.parameters.mouseRollLeftOrRight)
            callback();
        })
    } else {
        CSRobotUtil.cs.scroll(step.parameters.mouseRollUpOrDown, step.parameters.mouseRollLeftOrRight)
        callback();
    }
})
incident.addEVent("openApplication", function (step, callback, ctx) { //打开应用
    let timeout = setTimeout(() => {
        callback()
    }, 1000);

    let file_path = path.parse(step.parameters.openPath);
    console.log('cd /d "' + file_path.dir + '" && "' + file_path.base + '"')
    exec('cd /d ' + file_path.dir + ' && ' + file_path.base, {
        encoding: 'binary'
    }, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            let err = iconv.decode(error, 'GBK');
            clearTimeout(timeout);
            callback(errorStack("IllegalAccessException", err));
            // throw err;
            return;
        }
    })
})
incident.addEVent("CMDcommand", function (step, callback, ctx) { //打开应用

    let command = step.parameters.command;
    exec(command, {
        encoding: 'binary'
    }, (error, stdout, stderr) => {
        if (error) {
            // let err = iconv.decode(new Buffer(error, 'binary'), 'GBK');
            let err = iconv.decode(error, 'GBK');
            clearTimeout(timeout);
            callback(errorStack("IllegalAccessException", err));
            // throw err;
            return;
        } else {
            if (typeof stdout === 'undefined') {
                stdout = '';
                console.warn('CMDcommand参数stdout为undefined');
            }
            // let str_out = iconv.decode(new Buffer(stdout, 'binary'), 'GBK');
            let str_out = iconv.decode(stdout, 'GBK');
            ctx.set(step.parameters.rename, str_out);
            callback();
        }
    })
})
incident.addEVent("closeApplication", function (step, callback, ctx) { //关闭应用
    exec('tasklist | find "' + step.parameters.closePath + '"', {
        encoding: 'binary'
    }, function (error, stdout, stderr) {
        if (error) {
            // let err = iconv.decode(new Buffer(error, 'binary'), 'GBK');
            let err = iconv.decode(error, 'GBK');
            callback(errorStack("IllegalAccessException", err));
            return;
        }
        if (stdout != "") {
            exec('taskkill /f /t /im "' + step.parameters.closePath + '"', {
                encoding: 'binary'
            }, function (err, stdout, stderr) {
                if (err) {
                    clearTimeout(timeout);
                    // callback(errorStack("IllegalAccessException", iconv.decode(new Buffer(err, 'binary'), 'GBK')));
                    callback(errorStack("IllegalAccessException", iconv.decode(err, 'GBK')));
                    return;
                }
                callback()
            });
        }
    });
})
incident.addEVent("mouseClick", function (step, callback, ctx) { //鼠标点击
    switch (step.parameters.mouseClickType) {
        case "leftClick":
            CSRobotUtil.cs.click()
            break;
        case "midClick":
            CSRobotUtil.cs.click("middle")
            break;
        case "rightClick":
            CSRobotUtil.cs.click("right")
            break;
        case "leftDbclick":
            CSRobotUtil.cs.dbclick()
            break;
    }
    setTimeout(() => {
        callback();
    });
})
incident.addEVent("shortCut", function (step, callback, ctx) { //键盘组合键
    let hotKey = step.parameters.hotKey.split("+")

    for (let i in hotKey) {
        hotKey[i] = hotKey[i].trim();
    }
    let interval = step.parameters.interval || 100;
    let hotKeyGroup = hotKey.splice(0, hotKey.length - 1)
    if (step.parameters.count == 1) {
        CSRobotUtil.cs.comKey(hotKey[hotKey.length - 1], hotKeyGroup)
        callback();
    } else {
        for (let i = 0; i < step.parameters.count; i++) {
            setTimeout(() => {
                CSRobotUtil.cs.comKey(hotKey[hotKey.length - 1], hotKeyGroup)
                if (step.parameters.count - 1 == i) {
                    callback();
                }
            }, interval * i);
        }
    }
})
incident.addEVent("copyOrpasteDo", function (step, callback, ctx) { //复制黏贴操作
    if (step.parameters.ctrlCOrV == "ctrlC") {

        CSRobotUtil.cs.CtrlC();
    } else {
        CSRobotUtil.cs.CtrlV();

    }
    callback();
})
incident.addEVent("paramsCopy", function (step, callback, ctx) { //变量复制
    CSRobotUtil.cs.CtrlC(step.parameters.paramName);
    setTimeout(() => {
        callback();
    }, ctx.get("clipboardWaitTime") || 300);
})
incident.addEVent("paramsPaste", function (step, callback, ctx) { //变量黏贴
    testStr = systemParamUtil.getClipboard()
    if (typeof step.parameters.isFormat === "undefined" || step.parameters.isFormat !== "on") {
        testStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
    }
    setTimeout(() => {
        ctx.set(step.parameters.rename, testStr)
        callback();
    }, 500);
})

incident.addEVent("httpApi", function (step, callback, ctx) { //http接口
    let parameters = step.parameters;
    let postParam = {};
    let postParamString;
    let hasParam = false;
    let pUrl = URL.parse(parameters.httpUrl);
    if (pUrl.protocol !== "https:" && pUrl.protocol !== "http:") {
        pUrl = URL.parse("http://" + parameters.url);
    }
    for (let key in parameters) {
        if (key.includes("key")) {
            let num = key.replace(/[^0-9]/ig, "");
            if (parameters[key] == "") continue;
            postParam[parameters[key]] = parameters['value' + num];
            hasParam = true;
        }
    }
    let http
    if (pUrl.protocol == "https:") {
        http = require('https');
    } else {
        http = require('http');
    }
    if ("application/json; charset=utf-8" == parameters.ContentType) {
        postParamString = JSON.stringify(postParam);

    } else {
        postParamString = require('querystring').stringify(postParam);

    }
    var opts = {
        host: pUrl.hostname,
        port: pUrl.port,
        path: pUrl.path,
        method: parameters.httpType || "POST",
        headers: {
            "Content-Type": parameters.ContentType,
        }
    };
    var str = '';
    var req = http.request(opts, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            str += data;
        });
        res.on("end", function () {
            if (res.statusCode == 200) {
                if (parameters.paramType == "json") {
                    ctx.set(parameters.rename, JSON.parse(str));
                } else {
                    ctx.set(parameters.rename, str);
                }
                callback()
            } else {
                callback(errorStack("WEBException", {
                    status: res.statusCode,
                    msg: res.statusMessage
                }))
            }
        });
        res.on("error", function (err) {
            callback(errorStack("WEBException", err));
        });
    });
    req.on('error', function (err) {
        callback(errorStack("WEBException", err));
    });
    if (hasParam) req.write(postParamString);
    req.end();
})

incident.addEVent("setColParam", function (step, callback, ctx) { //设置集合元素
    let collection_type = ctx.signature(step.parameters.paramName);
    let items = [];

    for (let key in step.parameters) {
        if (key.includes("key")) {
            let num = key.replace(/[^0-9]/ig, "");
            items.push({
                key: step.parameters[key],
                value: step.parameters['value' + num]
            })
        }
    }
    var arr = [];
    var obj = {};
    if (collection_type[0] == "[") {
        arr = step.parameters.paramName;
        items.forEach(e => {
            // if (typeof (e.key) !== "number") {
            //     arr.push(e.value);
            // } else {
            //     arr[e.key] = e.value;
            // }
            // arr.push(e.value);
            arr[e.key] = e.value
        })
        ctx.setOwnProperty(step.parameters.rename, arr);
    } else if (collection_type[0] == "{") {
        obj = step.parameters.paramName;
        items.forEach(e => {
            obj[e.key] = e.value;

        })
        ctx.setOwnProperty(step.parameters.rename, obj);
    }
    callback();
})
incident.addEVent("arrayConcat", function (step, callback, ctx) { //数组拼接
    let leng_val = step.inputInfo.length - 1;
    let items = [];
    let result = [];
    for (let key in step.parameters) {
        if (key.includes("value")) {
            let num = key.replace(/[^0-9]/ig, "");
            items.push({
                value: step.parameters['value' + num]
            })
        }
    }

    for (var j = 0; j < items.length; j++) {
        result = result.concat(items[j].value);
    }
    ctx.set(step.parameters.rename, result);
    callback();
})

incident.addEVent("dbConfig", function (step, callback, ctx) { //设置数据库
    dbForMenuUtil.db_config(step.parameters, function (err, data) {
        if (err) {
            callback(err)
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
})
incident.addEVent("dbSelect", function (step, callback, ctx) { //查询数据库
    dbForMenuUtil.db_select(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback()
        }
    });
});
incident.addEVent("dbOthers", function (step, callback, ctx) { //查询数据库
    dbForMenuUtil.db_others(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback()
        }
    });
});
incident.addEVent("dbInsert", function (step, callback, ctx) { //查询数据库
    dbForMenuUtil.db_insert(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback()
        }
    });
});
incident.addEVent("socketApi", function (step, callback, ctx) { //socket接收数据
    dataInterfaceUtil.socketInterface.start(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("websocketApi", function (step, callback, ctx) { //websocket接收数据
    dataInterfaceUtil.websocketInterface.start(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("getPixelColor", function (step, callback, ctx) { //屏幕像素点识别
    step.parameters.devicePixelRatio = DevicePixelRatio;
    CSRobotUtil.getPixelColor.get_pixel_color(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("fs_cre_directory", function (step, callback) { //创建目录
    fileOperateNew.create_directory(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("fs_cre_file", function (step, callback) { //创建文件
    fileOperateNew.create_file(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("fs_move", function (step, callback) { //移动文件
    fileOperateNew.move_file(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("fs_rename", function (step, callback) { //移动文件
    fileOperateNew.rename_file(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("fs_delete", function (step, callback) { //移动文件
    fileOperateNew.delete_file(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("fs_delete_dir", function (step, callback) { //移动文件
    fileOperateNew.fs_delete_dir(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("fs_exists", function (step, callback, ctx) { //判断路径是否存在
    fileOperateNew.exists_file(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("fs_copy", function (step, callback) { //移动文件
    fileOperateNew.copy_file(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("fs_get_all_file", function (step, callback, ctx) { //获得目录下所有文件
    fileOperateNew.get_all_file(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("PreciseWriteFile", function (step, callback) { //精确写入文件
    officeUtil.PreciseWriteFile(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("PreciseReadFile", function (step, callback, ctx) { //精确读取文件
    officeUtil.PreciseReadFile(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("readPDF", function (step, callback, ctx) {
    officeUtil.readPDF(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("copyExclePart", function (step, callback, ctx) {
    officeUtil.copyExclePart(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("changeStyleExcle", function (step, callback, ctx) {
    step.parameters.CShandle = sysPath.CShandle;
    officeUtil.changeStyleExcle(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
//返回符合预期的像素屏幕坐标
incident.addEVent("callback_pixel_position", function (step, callback, ctx) {
    step.parameters.devicePixelRatio = DevicePixelRatio;
    CSRobotUtil.CallbackPixelPosition.callback_pixel_position(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("string_generacte", function (step, callback, ctx) {
    parserHtml(step.parameters.html, ctx, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("throwError", function (step, callback, ctx) {
    callback(errorStack(step.parameters.errType, step.parameters.errDesc))
});
incident.addEVent("draftingMouse", function (step, callback, ctx) {
    step.parameters.devicePixelRatio = DevicePixelRatio;
    CSRobotUtil.cs.draftingMouse(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("capScreenPart", function (step, callback, ctx) {
    step.parameters.devicePixelRatio = DevicePixelRatio;
    CSRobotUtil.cs.capScreenPart(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            let canvas = document.createElement("canvas");
            let canvasWidth = canvas.width = data.width;
            let canvasHeight = canvas.height = data.height;
            let context = canvas.getContext('2d');
            let imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
            imageData.data.set(data.image);
            context.putImageData(imageData, 0, 0);
            let imgData = canvas.toDataURL('image/png', 1);
            let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
            if (typeof base64Data === 'undefined' || base64Data == '') {
                base64Data = '';
                console.warn('capScreenPart base64Data为空或undefined')
            }
            let dataBuffer = new Buffer(base64Data, 'base64');
            fs.writeFile(incident.getDirectory() + "/" + step.parameters.fileName + ".png", dataBuffer, function (err) {
                if (err) {
                    callback(err);
                } else {
                    saveHistory(step.parameters, ctx, incident.getDirectory() + "/" + step.parameters.fileName + ".png", function (err, data) {
                        if (err) {
                            callback(err);
                        } else {
                            callback();
                        }
                    });
                }
            });

        }
    });
});
incident.addEVent("slidingVerificationCode", function (step, callback, ctx) {
    step.parameters.rootdirectory = incident.getDirectory();
    CSRobotUtil.cs.slidingVerificationCode(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    }, ctx);
});
incident.addEVent("conArrayRowCol", function (step, callback, ctx) {
    paramUtil.conArrayRowCol(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    }, ctx);
});
incident.addEVent("archiverFile", function (step, callback, ctx) {
    fileOperateNew.archiverFile(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    }, ctx);
});
incident.addEVent("unarchiverFile", function (step, callback, ctx) {
    fileOperateNew.unarchiverFile(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            callback();
        }
    });
});
incident.addEVent("strSplit", function (step, callback, ctx) {
    paramUtil.strSplit(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            console.log(data);
            ctx.set(step.parameters.rename, data);
            callback();
        }
    }, ctx);
});
incident.addEVent("openExecuteWindow", function (step, callback, ctx) {
    remote.getCurrentWindow().show();
    callback();
});
incident.addEVent("closeExecuteWindow", function (step, callback, ctx) {
    remote.getCurrentWindow().hide();
    callback();
});

incident.addEVent("newHttpApi", function (step, callback, ctx) {
    dataInterfaceUtil.httpInterface.httpApi(step.parameters, function (err, data) {
        if (err) {
            return callback(err);
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("http_uploadfile", function (step, callback, ctx) {
    dataInterfaceUtil.httpInterface.upload(step.parameters, function (err, data) {
        if (err) {
            return callback(err);
        } else {
            // console.log(data);
            // ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
incident.addEVent("backGlobalParam", function (step, callback, ctx) {
    incident.setGlobalContext(step.parameters.rename, step.parameters.paramValue);
    callback();
});

//*************微软功能开始******************/
function CSOperate(cmdStr, callback) {
    const exec = require('child_process').exec;
    exec(cmdStr, {
        encoding: 'binary'
    }, function (err, stdout, stderr) {
        if (err) {
            err = iconv.decode(err instanceof Error ? err.toString() : err, 'GBK');
            return callback(errorStack("ElementNotFoundException", err));
        }
        let str = ""
        try {
            str = iconv.decode(stdout, 'GBK');
            var JsonObject = JSON.parse(str);
            if (JsonObject.code == 500) {
                return callback(errorStack("ElementNotFoundException", JsonObject.msg));
            }
            callback(null, JsonObject.context);
        } catch (e) {
            return callback(errorStack("ElementNotFoundException", "错误的回传信息：" + str));
        }
    })
}
incident.addEVent("getCSElement", function (step, callback, ctx) {
    let param = {};
    for (var key in step.parameters) {
        if (key === "rename") continue;
        param[key] = step.parameters[key]
    }
    ctx.set(step.parameters.rename, param)
    callback();
});
incident.addEVent("getCSParentElementByName", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m getCSParentElementByName -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") +
        '" -n "' + step.parameters.elName + '" -e "' + step.parameters.eventType + '"';
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data)
        callback()
    })
});
incident.addEVent("getCSBrotherElementByName", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m getCSBrotherElementByName -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") +
        '" -n "' + step.parameters.elName + '" -i "' + step.parameters.index + '" -b "' + (step.parameters.isSameType ? step.parameters.isSameType != "false" ? true : false : false) +
        '" -e "' + step.parameters.eventType + '"';
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data)
        callback()
    })
});
incident.addEVent("getCSChildrenElementByName", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m getCSChildrenElementByName -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") +
        '" -n "' + step.parameters.elName + '" -i "' + step.parameters.index + '" -b "' + (step.parameters.isSameType ? step.parameters.isSameType != "false" ? true : false : false) +
        '" -e "' + step.parameters.eventType + '"';
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data)
        callback()
    })
});
incident.addEVent("getCSParentElement", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m getCSParentElement -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") + '"';
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data)
        callback()
    })
});
incident.addEVent("getCSBrotherElement", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m getCSBrotherElement -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") + '" -e ' + step.parameters.eventType;
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data)
        callback()
    })
});
incident.addEVent("getCSChildrenElement", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m getCSChildrenElement -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") + '" -e ' + step.parameters.eventType;
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data)
        callback()
    })
});
incident.addEVent("getElementItems", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m getComBoxList -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") + '" -e ' + step.parameters.eventType;
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data)
        callback()
    })
});
incident.addEVent("CSElemetClick", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m moveToElement -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") + '"'
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        switch (step.parameters.mouseClickType) {
            case "leftClick":
                CSRobotUtil.cs.click();
                break;
            case "midClick":
                CSRobotUtil.cs.click("middle");
                break;
            case "rightClick":
                CSRobotUtil.cs.click("right");
                break;
            case "leftDbclick":
                CSRobotUtil.cs.dbclick();
                break;
        }
        callback()
    })
});
incident.addEVent("CSElemetInput", function (step, callback, ctx) {
    if (step.parameters.inputType !== "input") {

        let cmdStr = sysPath.CShandle + '/uispy.exe -m focusInElement -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") + '"'
        CSOperate(cmdStr, function (err, data) {
            if (err) {
                return callback(err);
            }
            if (step.parameters.inputType === "keybord") {
                CSRobotUtil.cs.inputText(step.parameters.input);
            } else {
                CSRobotUtil.cs.CtrlC(step.parameters.input);
                CSRobotUtil.cs.CtrlV();
            }
            callback();
        })
    } else {
        let cmdStr = sysPath.CShandle + '/uispy.exe -m writeInElement -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") + '" -t "' + step.parameters.input + '"'
        CSOperate(cmdStr, function (err, data) {
            if (err) {
                return callback(err);
            }
            callback();
        })
    }
});
//*******山东*********/
incident.addEVent("shangdongMenu", function (step, callback, ctx) {
    let cmdStr = sysPath.CShandle + '/uispy.exe -m shangdongMenu -v "' + JSON.stringify(step.parameters.Element).replace(/"/g, "'") +
        '" -n "' + step.parameters.elName + '" -e "' + step.parameters.eventType + '"';
    CSOperate(cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data)
        callback()
    })
});

//*******结束*********/

//*************微软功能结束******************/
//中文数字阿拉伯数字互转
incident.addEVent("numTrans", function (step, callback, ctx) {
    paramUtil.numTrans(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
//日期数据格式化
incident.addEVent("dateFormatSpe", function (step, callback, ctx) {
    paramUtil.dateFormatSpe(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
//获取本机IP
incident.addEVent("getIp", function (step, callback, ctx) {
    systemParamUtil.getIp(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
//*************finnally功能开始******************/

//*************finnally功能结束******************/


//更改工作表名称
incident.addEVent("excelChangeSheet", function (step, callback, ctx) {
    newOfficeUtil.excelChangeSheet(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});
//读取csv文件
incident.addEVent("readCsvFile", function (step, callback, ctx) {
    newOfficeUtil.readCsvFile(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});
//新建工作表
incident.addEVent("excelCreateSheet", function (step, callback, ctx) {
    newOfficeUtil.excelCreateSheet(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//写入单元格
incident.addEVent("excelWriteCell", function (step, callback, ctx) {
    newOfficeUtil.excelWriteCell(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//读取单元格
incident.addEVent("excelReadCell", function (step, callback, ctx) {
    newOfficeUtil.excelReadCell(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//读取工作表
incident.addEVent("excelReadSheet", function (step, callback, ctx) {
    newOfficeUtil.excelReadSheet(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//写入工作表
incident.addEVent("excelWriteSheet", function (step, callback, ctx) {
    newOfficeUtil.excelWriteSheet(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//读取指定范围
incident.addEVent("excelReadRange", function (step, callback, ctx) {
    newOfficeUtil.excelReadRange(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});
//写入指定范围
incident.addEVent("excelwriteRange", function (step, callback, ctx) {
    newOfficeUtil.excelwriteRange(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//写入行列数据
incident.addEVent("excelWriteRowCol", function (step, callback, ctx) {
    newOfficeUtil.excelWriteRowCol(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//复制局部至另一文件
incident.addEVent("excelCopyPart", function (step, callback, ctx) {
    newOfficeUtil.excelCopyPart(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//删除或清空行列
incident.addEVent("excelDeleRowCol", function (step, callback, ctx) {
    newOfficeUtil.excelDeleRowCol(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            data.forEach(function (value, key) {
                ctx.set(key, value);
            });
            callback();
        }
    });
});

//写入csv文件
incident.addEVent("writeCsvFile", function (step, callback, ctx) {
    console.log(step.parameters.valueParam)
    newOfficeUtil.writeCsvFile(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        saveHistory(step.parameters, ctx, data, callback);
    })
});

//写入txt文件
incident.addEVent("docWriteTxt", function (step, callback, ctx) {
    docOfficeUtil.docWriteTxt(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        saveHistory(step.parameters, ctx, data, callback);
    });
});
//写入Word文件
incident.addEVent("docWriteWord", function (step, callback, ctx) {
    docOfficeUtil.docWriteWord(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        saveHistory(step.parameters, ctx, data, callback);
    });
});

//读取Word文件
incident.addEVent("docReadWord", function (step, callback, ctx) {
    step.parameters.CShandle = sysPath.CShandle;
    docOfficeUtil.docReadWord(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});

//读取txt文件
incident.addEVent("docReadTxt", function (step, callback, ctx) {
    docOfficeUtil.docReadTxt(step.parameters, function (err, data) {
        if (err) {
            callback(err);
            return;
        } else {
            ctx.set(step.parameters.rename, data);
            callback();
        }
    });
});


//返回最相似的下拉项
incident.addEVent("similarSelector", function (step, callback, ctx) {
    systemParamUtil.similarSelector(step.parameters, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
});


//获取脚本信息
incident.addEVent("getScriptInfo", function (step, callback, ctx) {
    ctx.set(step.parameters.rename, { id: worker.scriptInfo.id, name: worker.scriptInfo.title, type: worker.scriptInfo.typeName })
    callback();
});
//fTP上传
incident.addEVent("ftpUpload", function (step, callback, ctx) {
    dataInterfaceUtil.ftpInterface.uploadFile({
        host: step.parameters.host,
        port: step.parameters.port,
        user: step.parameters.user,
        pass: step.parameters.pass
    }, step.parameters.remotePath, step.parameters.localPath, step.parameters.fileNmae,
        function (err, data) {
            if (err) {
                return callback(err);
            }
            callback()
        })
});
//fTP下载
incident.addEVent("ftpDownLoad", function (step, callback, ctx) {
    dataInterfaceUtil.ftpInterface.downLoad({
        host: step.parameters.host,
        port: step.parameters.port,
        user: step.parameters.user,
        pass: step.parameters.pass
    }, step.parameters.remotePath, step.parameters.localPath, step.parameters.fileNmae,
        function (err, data) {
            if (err) {
                return callback(err);
            }
            callback()
        })
});

//ocr --腾讯云--文字识别
incident.addEVent("ocr_TencentCloud_getString", function (step, callback, ctx) {
    ocrUtil.tencentCloudApi.getString(step.parameters, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
});
//ocr --腾讯云--文字位置识别
incident.addEVent("ocr_TencentCloud_getPosition", function (step, callback, ctx) {
    ocrUtil.tencentCloudApi.getPosition(step.parameters, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
})
incident.addEVent("triggerJava", function (step, callback, ctx) { //执行java
    let timeout = setTimeout(() => {
        callback()
    }, 1000);

    let file_path = path.parse(step.parameters.openPath);
    exec('cd /d ' + file_path.dir + ' && java -jar ' + file_path.base, {
        encoding: 'binary'
    }, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            let err = iconv.decode(error, 'GBK');
            clearTimeout(timeout);
            return callback(errorStack("IllegalAccessException", err));
        }
    })
})
incident.addEVent("triggerBatVbs", function (step, callback, ctx) { //执行BatVbs
    let timeout = setTimeout(() => {
        callback()
    }, 1000);

    let file_path = path.parse(step.parameters.openPath);
    let cmdStr = file_path.ext == ".bat" ? file_path.base : 'cscript ' + file_path.base
    exec('cd /d ' + file_path.dir + ' && ' + cmdStr, {
        encoding: 'binary'
    }, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            let err = iconv.decode(error, 'GBK');
            clearTimeout(timeout);
            return callback(errorStack("IllegalAccessException", err));
        }
    })
})
/*********************telnet***************/
incident.addEVent("telnetConnect", function (step, callback, ctx) {
    let telnetClient = dataInterfaceUtil.telnetInterface;
    telnetClient.connect(step.parameters.host, step.parameters.port, step.parameters.username, step.parameters.password, function (err) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, telnetClient);
        callback()
    })
})
incident.addEVent("telnetWrite", function (step, callback, ctx) {
    step.parameters.telnetClient.write(step.parameters.cmdStr, function (err, data) {
        if (err) {
            return callback(err);
        }
        ctx.set(step.parameters.rename, data);
        callback();
    });
})
incident.addEVent("telnetClose", function (step, callback, ctx) {
    step.parameters.telnetClient.disConnect();
    callback();
})

/*********************telnet***************/

/******************python_selenium*********************/
//python打开浏览器，
incident.addEVent("open_browser", async function (step, callback, ctx) {
    pythonStart();
    try{
        const path = require('path')
        ctx.set(step.parameters.rename, await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"open_selenium",{
            url:step.parameters.url,
            browser_type:step.parameters.browser_type,
            path_selenium:step.parameters.path_selenium,
            chrome_driver:step.parameters.chrome_driver,
            open_type:step.parameters.open_type
          }));
    }catch(e){
		return callback(e);
	}
    callback();
})

//python浏览器输入，
incident.addEVent("input_browser", async function (step, callback, ctx) {
    pythonStart();
    try{
        const path = require('path')
        ctx.set(step.parameters.rename, await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"input_selenium",{
            xpath:step.parameters.xpath,
            text:step.parameters.text,
            browser_name:step.parameters.browser_name
          }));
    }catch(e){
		return callback(e);
	}
    callback();
})

//python浏览器关闭，
incident.addEVent("close_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
        const path = require('path')
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"close_selenium",{
			close_type:step.parameters.close_type,
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//python关闭当前页面，
incident.addEVent("close_browser_page", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"close_selenium_page",{
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//判断元素是否存在，
incident.addEVent("existence_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"existence_selenium",{
			xpath:step.parameters.xpath,
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//网页刷新，
incident.addEVent("refresh_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"refresh_selenium",{
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//网页前进，
incident.addEVent("forward_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"forward_selenium",{
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//网页后退，
incident.addEVent("back_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"back_selenium",{
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//操作弹出框，
incident.addEVent("alert_click_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
    if(step.parameters.time_out.length==0){
        step.parameters.time_out=20;
    }
	try{
        const path = require("path");
    	ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"alert_click_selenium",{
			browser_name:step.parameters.browser_name,
			time_out:step.parameters.time_out,
			operation_type:step.parameters.operation_type
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//批量抓取元素，
incident.addEVent("batchGrab_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"batch_grab_selenium",{
			xpath:step.parameters.xpath,
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//抓取单个元素，
incident.addEVent("grab_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"grab_selenium",{
			xpath:step.parameters.xpath,
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//点击网页元素，
incident.addEVent("click_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"click_selenium",{
			xpath:step.parameters.xpath,
			click_type:step.parameters.click_type,
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//窗口最大化，
incident.addEVent("max_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"max_selenium",{
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//等待网页元素出现继续，
incident.addEVent("wait_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
    if(step.parameters.wait_second.length==0){
        step.parameters.wait_second=20;
    }
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"selenium_driver_wait",{
			xpath:step.parameters.xpath,
			browser_name:step.parameters.browser_name,
			wait_second:step.parameters.wait_second
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//获取url，
incident.addEVent("url_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"url_selenium",{
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//获取浏览器弹出框内容，
incident.addEVent("grab_alert_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
    if(step.parameters.time_out.length==0){
        step.parameters.time_out=20;
    }
	try{
        const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"alert_grab_selenium",{
			browser_name:step.parameters.browser_name,
			time_out:step.parameters.time_out
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//获取网页元素属性,
incident.addEVent("attribute_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"attribute_selenium",{
			xpath:step.parameters.xpath,
			attribute_name:step.parameters.attribute_name,
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//选择网页下拉框选项,
incident.addEVent("select_browser", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_selenium.py"),"select_selenium",{
			xpath:step.parameters.xpath,
			text:step.parameters.text,
			match_type:step.parameters.match_type,
			browser_name:step.parameters.browser_name
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

/******************python_selenium*********************/

/******************python_outlook*********************/
//outlook发送邮件，
incident.addEVent("outlook_send", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_outlook.py"),"outlook_send",{
			send_name:step.parameters.send_name,
			accept_name:step.parameters.accept_name,
			accept_title:step.parameters.accept_title,
			accept_content:step.parameters.accept_content,
			accept_file:step.parameters.accept_file,
			secret_accept:step.parameters.secret_accept,
			minor_accept:step.parameters.minor_accept,
			agent_send_name:step.parameters.agent_send_name,
			draft_flag:step.parameters.draft_flag,
			html_flag:step.parameters.html_flag
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//outlook获取邮件消息对象，
incident.addEVent("outlook_get", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_outlook.py"),"outlook_get",{
			outlook_name:step.parameters.outlook_name,
			file_name:step.parameters.file_name,
			find_where:step.parameters.find_where,
			find_num:step.parameters.find_num,
			find_unread:step.parameters.find_unread,
			read_flag:step.parameters.read_flag
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//outlook回复邮件，
incident.addEVent("outlook_reply", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_outlook.py"),"outlook_reply",{
			reply_content:step.parameters.reply_content,
			reply_account:step.parameters.reply_account,
			accept_file:step.parameters.accept_file,
			reply_all_flag:step.parameters.reply_all_flag
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//outlook转发邮件，
incident.addEVent("outlook_relay", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_outlook.py"),"outlook_relay",{
			relay_mail:step.parameters.relay_mail,
			relay_account:step.parameters.relay_account
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//outlook移动邮件，
incident.addEVent("outlook_move", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(await python_exec(path.join(process.cwd(),"./extend/python/app_outlook.py"),"outlook_move",{
			outlook_name:step.parameters.outlook_name,
			file_name:step.parameters.file_name,
			move_mail:step.parameters.move_mail
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})
/******************python_outlook*********************/

/******************python_extend*********************/
//aes加密，
incident.addEVent("encrypt_aes", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");          
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_aes.py"),"encrypt",{
			key:step.parameters.key,
			text:step.parameters.text
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//aes解密，
incident.addEVent("decrypt_aes", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/app_aes.py"),"decrypt",{
			key:step.parameters.key,
			text:step.parameters.text
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//执行脚本，
incident.addEVent("script_call", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/script_call.py"),"script_call",{
			script_command:step.parameters.script_command,
			script_parameter:step.parameters.script_parameter
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//xmltojosn
incident.addEVent("xml2json", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/appx2j.py"),"xml_to_json",{
			text:step.parameters.text
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})

//jsontoxml
incident.addEVent("json2xml", async function (step, callback, ctx) { //ִ
    pythonStart();
	try{
		const path = require("path");
		ctx.set(step.parameters.rename,await python_exec(path.join(process.cwd(),"./extend/python/appx2j.py"),"json_to_xml",{
			text:step.parameters.text,
			isSelfClosing:step.parameters.isSelfClosing
		}))
	}catch(e){
		return callback(e);
	}
	callback();
})
/******************python_extend*********************/



/******************js_extend_录像*********************/

incident.addEVent("screencap", (step, callback, ctx) => {
    const { desktopCapturer } = require('electron')
    // const WebmFile=require("./WebmFile")
    const WebmFile=require(sysConfig.rootPath + 'app/main/debuger/WebmFile')
    const path=require("path");
    const fs=require("fs");
    function determineScreenShotSize() {
        const screenSize = window.screen
        return {
            width: screenSize.width * window.devicePixelRatio,
            height: screenSize.height * window.devicePixelRatio
        }
    }
    const thumbSize = determineScreenShotSize()

    desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 0, height: 0 } }, (error, sources) => {
        if (error) {
            return callback(error)
        }
        for (let i = 0; i < sources.length; ++i) {
            // console.log(sources[i].name)
            if (sources[i].name.toString().toLowerCase().includes("screen")) {
                navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: sources[i].id,
                            minWidth: thumbSize.width * 0.5,
                            maxWidth: thumbSize.width * step.parameters.definition,
                            minHeight: thumbSize.height * 0.5,
                            maxHeight: thumbSize.height * step.parameters.definition
                        },
                    }
                }).then((stream) => {
                    let options = {
                        //timeSlice: 1000,
                        videoBitsPerSecond: 2500000,
                        //audioBitsPerSecond: 128000,
                        mimeType: 'video/webm'
                    };
                    let mediaParts = [], startTime, endTime, stopflag;
                    let recoder = new MediaRecorder(stream, options);
                    recoder.ondataavailable = function (evt) {
                        let data = evt.data;
                        if (data && data.size > 0) {
                            mediaParts.push(data);
                        }
                    }
                    let filePath = path.join(step.parameters.directory, step.parameters.filename + ".webm")

                    recoder.onstop = async function () {
                        mediaParts = new Blob(mediaParts, { type: options.mimeType })

                        // let file = new WebmFile(new Uint8Array(await mediaParts.arrayBuffer()));
                        let mediaPartsBuffer=await new Promise(s=>{
                                                        let reader = new FileReader();
                                                        reader.onload = function() {
                                // debugger
                                                            s(reader.result) } 
                                                        reader.readAsArrayBuffer(mediaParts);
                                                    })
                                                    
                        let file = new WebmFile(new Uint8Array(mediaPartsBuffer));
                        if (file.fixDuration(endTime - startTime)) {
                            mediaParts = file.source.buffer
                        }
                        fs.writeFile(filePath, Buffer.from(mediaParts), function (err) {
                            if (err) {
                                console.error('Failed to save video ' + err);
                            } else {
                                console.log('Saved video: ' + step.parameters.filename + ".webm");
                            }

                        });
                    }
                    recoder.onerror = function (event) {
                        let error = event.error;
                        if (stopflag) {
                            clearTimeout(stopflag);
                            stopflag = null;
                        }
                        switch (error.name) {
                            case "InvalidStateError":
                                callback("试图停止或暂停或不活动的记录器，启动或恢复活动的记录器，或以其他方式操纵MediaRecorder处于错误状态的时间。当对已删除或删除的源发出请求时，也会发生此异常。");
                                break;
                            case "SecurityError":
                                callback("在MediaStream被配置为禁止记录。例如，getUserMedia()当用户拒绝使用输入设备的许可时获得的源可能是这种情况。当MediaStreamTrack流中的某个内容被标记为isolated由于peerIdentity源流上的约束时，也会发生这种情况。");
                                break;
                            case "NotSupportedError":
                                callback("尝试MediaRecorder使用用户设备不支持的MIME类型实例化; 一个或多个所请求的容器，编解码器或配置文件以及其他信息可能无效");
                                break;
                            default:
                                callback("发生了与安全无关的错误，否则无法对其进行分类。录音停止后，MediaRecorder的state变成inactive，最后一个dataavailable事件被发送到MediaRecorder与其余接收到的数据，最后一个stop被发送的事件。");
                                break;
                        }
                    };
                    recoder.start();
                    startTime = Date.now();
                    stopflag = setTimeout(() => {
                        stopflag = null;
                        endTime = Date.now();
                        recoder.stop();
                    }, step.parameters.duration);
                    //TODO:流程结束时的回调，此处需要更改
                    window.worker.once("workEnd", () => {
                        if (stopflag) {
                            clearTimeout(stopflag);
                            stopflag = null;
                            endTime = Date.now();
                            recoder.stop();
                        }
                    })
                    ctx.set(step.parameters.rename, filePath)
                    callback();

                }).catch((e) => {
                    console.log(e)
                    callback(e)
                })
            }
        }
    })
});
/******************js_extend_录像*********************/
