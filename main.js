const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;
const path = require('path');
const url = require('url');
const fs = require("fs");
const spawn = require("child_process").spawn;
const regedit = require('regedit'); //引入regedit
const iconv = require('iconv-lite');
const _ = require('lodash')
var mainWindow;
var presWindow;
var calcWindow;
var logWindow;
var debugeData;
var runFilePath = null;
global.rootPath = __dirname;
global.important = require('./app/main/important')
global.net = require('./app/main/net')
global.context = new global.important.context.Context();
global.isPackager;
var log;
var isUpdate = false;

function readText(pathname) {
    var bin = fs.readFileSync(pathname);
    if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
        bin = bin.slice(3);
    }
    return bin.toString('utf-8');
}

function exportExist(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

//配置信息读取
let properties = JSON.parse(readText(path.join(__dirname, './interiorConfig/properties.json'), 'utf8'));

function propertiesInit() {
    let menu = JSON.parse(readText(path.join(__dirname, './interiorConfig/menu.json'), 'utf8'));
    properties.sysConfig.rootPath = path.join(__dirname, "./").replace(/\\/g, "/");
    //打包后 某些配置更改
    properties.sysConfig.isPackager = __dirname.indexOf(".asar") > -1;
    global.isPackager = properties.sysConfig.isPackager;
    if (properties.sysConfig.isPackager) {
        setProperFile(properties.sysConfig.rootPath, path.join(properties.sysConfig.rootPath, "../config"), path.join(properties.sysConfig.rootPath, "./config"));
        setProperFile(properties.sysConfig.rootPath, path.join(properties.sysConfig.rootPath, "../extend"), path.join(properties.sysConfig.rootPath, "./extend"));
        setProperFile(properties.sysConfig.rootPath, path.join(properties.sysConfig.rootPath, "../CShandle"), path.join(properties.sysConfig.rootPath, "./app/tool/CShandle"));
        let otherProperties = JSON.parse(readText(path.join(__dirname, '../config/properties.json'), 'utf8'));
        for (let key in otherProperties.sysConfig) {
            properties.sysConfig[key] = otherProperties.sysConfig[key]
        }
    }
    global.context.set("menu", menu)
}
//设置一些场景下的路径
function setPath() {
    global.path = {};
    //打包后 路径需要更改
    if (properties.sysConfig.isPackager) {
        global.path.log = path.join(properties.sysConfig.rootPath, "../logs")
        global.path.CShandle = path.join(properties.sysConfig.rootPath, "../CShandle")
    } else {
        global.path.log = path.join(properties.sysConfig.rootPath, "./app/tool/log/logs")
        global.path.CShandle = path.join(properties.sysConfig.rootPath, "./app/tool/CShandle");
    }
    log = require("./app/tool/log/log")
}
//设置打包后的工具转移
function setProperFile(rootPath, stempDst, stempSrc, isAlawys = false) {
    // let stempDst = path.join(rootPath, "../config");
    // let stempSrc = path.join(rootPath, "./config");
    let isExistSysFile = false;
    isExistSysFile = fs.existsSync(stempDst);
    if (isExistSysFile && !isAlawys) {

    } else {
        let sysFiles;
        if (!isExistSysFile) {

            fs.mkdirSync(stempDst);
        }
        sysFiles = fs.readdirSync(stempSrc);
        fn(sysFiles);

        function fn(files) {
            // if (err) {
            //     return;
            // }
            files.forEach((item, index) => {
                let src = stempSrc + "\\" + item;
                let dst = stempDst + "\\" + item;
                let tempStats;
                tempStats = fs.statSync(src);
                writeFn(tempStats);

                function writeFn(stats) {
                    // if (err) {
                    //     return;
                    // }
                    if (stats.isFile()) {
                        fs.writeFileSync(dst, fs.readFileSync(src))
                    } else if (stats.isDirectory()) {
                        exists(src, dst, copy);
                    }
                }
            });
        }
    }
    return true;
}

//将指定目录的文件写入到指定目录中去 path.join(sysConfig.rootPath, "./app/tool/update")
function writeFilesToTarget(stempDst, stempSrc) {
    fs.stat(stempDst, function (err, stats) {
        if (err) {
            console.log(err)
        } else {
            if (!stats.isDirectory()) {
                fs.mkdirSync(stempDst);
            }
        }
    })

    // if(stempSrc){

    // }

    fs.readdirSync(stempSrc).forEach((item) => {
        if (!fs.existsSync(path.join(stempDst, "/" + item)) || true) {

            fs.writeFileSync(path.join(stempDst, "/" + item), fs.readFileSync(path.join(stempSrc, "/" + item)), 'utf8', function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }
    })
}

function copyFolder(srcDir, tarDir, cb) {
    let files = fs.readdirSync(srcDir);
    folderCreate(tarDir);
    files.forEach((file, index) => {
        let fileType = fs.lstatSync(srcDir + "\\" + file).isDirectory();
        let src = srcDir + "\\" + file;
        let tar = tarDir + "\\" + file;
        if (fileType) {
            copyFolder(src, tar)
        } else {
            // fs.copyFileSync(src, tar);
            fs.writeFileSync(tar, fs.readFileSync(src))
        }
    });

    function folderCreate(dir) {
        let isTarDirExist = fs.existsSync(dir);
        if (!isTarDirExist) {
            fs.mkdirSync(dir)
        }
    }
}

function prevLoad(callback) {
    propertiesInit(); //读取配置信息
    setPath();
    if (typeof properties.sysConfig.rootDirectory == "undefined") {
        exportExist(path.join(__dirname, "./rpa_file"))
    } else {
        exportExist(properties.sysConfig.rootDirectory)
    }
    global.context.set("sysConfig", properties.sysConfig)
    global.sysConfig = properties.sysConfig;
    callback()
}
function initPresWindow() {
    presWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
                 nodeIntegration: true,
                 webviewTag: true
            },
        show: false,
        frame: false,
    })
    presWindow.setMenu(null)
    presWindow.loadURL('file://' + __dirname + "/app/pages/debugger.html") //新窗口
    presWindow.webContents.on('did-finish-load', function () {
        if (debugeData) {
            presWindow.webContents.send('step', debugeData);
        }
    });
    presWindow.webContents.on('crashed', function () {
        const options = {
            type: 'info',
            title: 'pres',
            message: "崩溃了！",
            buttons: ['重载', '关闭']
        }

        dialog.showMessageBox(options, function (index) {
            if (index === 0) presWindow.reload();
            else presWindow.close();
        })
    });
    presWindow.on("closed", function () {
        presWindow = null;
        debugeData = null;
        if (properties.sysConfig.isDev) {
            process.nextTick(initPresWindow);
        }
        if (typeof mainWindow !== "undefined" && mainWindow != null) {
            mainWindow.webContents.send('changeParameters_end', '');
        }
    });
}
// 初始化并准备创建主窗口 
function createWindow() {
    // 创建一个宽1370px 高730px的窗口  
    mainWindow = new BrowserWindow({
        width: 1370,
        minWidth: 1370,
        minHeight: 750,
        height: 750,
        webPreferences: {
                 nodeIntegration: true,
                 webviewTag: true
            },
        frame: false,
        show: true
    })
    //初始化第debug窗口
    initPresWindow();
    globalShortcut.register(properties.sysConfig.stopTask, () => {
        presWindow.webContents.send('stopJob');
    })
    globalShortcut.register(properties.sysConfig.goonTask, () => {
        presWindow.webContents.send('goonJob');
    })
    let fileUrl = url.format({
        pathname: path.join(__dirname, './app/pages/index.html'),
        protocol: 'file:',
        slashes: true
    })
    // 载入应用的inde.html  
    mainWindow.loadURL(fileUrl);

    // 窗口关闭时触发  
    mainWindow.on('closed', function () {
        mainWindow = null;
        // 想要取消窗口对象的引用， 如果你的应用支持多窗口，你需要将所有的窗口对象存储到一个数组中，然后在这里删除想对应的元素  
        try {
            presWindow.destroy();
        } catch (e) {

        }
        try {
            calcWindow.destroy();
        } catch (e) {

        }
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus()
        if (properties.sysConfig.isDev) {
            mainWindow.webContents.openDevTools();
        }
    })

    mainWindow.webContents.on('crashed', function (e) {
        const options = {
            type: 'info',
            title: 'main',
            message: "崩溃了！",
            buttons: ['重载', '关闭']
        }
        log.error("主进程崩溃")
        dialog.showMessageBox(options, function (index) {
            if (index === 0) mainWindow.reload();
            else mainWindow.close();
        })
    });
    ipc.on('crashed', function (event, data) {
        const options = {
            type: 'info',
            title: data.title,
            message: "崩溃了！" + data.msg,
            buttons: ['重载', '关闭']
        }
        log.error(data.title + "进程崩溃" + +data.msg)
        dialog.showMessageBox(options, function (index) {
            if (index === 0) mainWindow.reload();
            else mainWindow.close();
        })
    })

    //开启debugger窗口
    ipc.on('debugger_init', function (event, data) {
        if (properties.sysConfig.isDev) {
            presWindow.webContents.openDevTools();
            presWindow == null ? initPresWindow() : "";
        }
        presWindow.show();
        presWindow.maximize();
        presWindow.focus();
        presWindow.webContents.send('step', data);
        debugeData = data;
        mainWindow.webContents.send('debugger_show', data);
    });
    //动作中转
    ipc.on('actionInterchange', function (event, data) {
        presWindow.webContents.send(data.type, data.context);
    });
    //debugger 变量中转
    ipc.on('actionInterchangeParameters', function (event, data) {
        mainWindow.webContents.send('changeParameters', data);
    })
    ipc.on('doTargetItem', function (event, data) {
        mainWindow.webContents.send('doItem', data);
    })
    ipc.on('rpa_action_alert', function (event, data) {
        mainWindow.webContents.send('rpa_action_alert', data);
    });
    ipc.on('fuzhu_actutor_alert', function (event, data) {
        console.log("中转1");
        mainWindow.webContents.send('fuzhu_actutor_alert_open', data);
    });
    ipc.on("continue_do_fuzhu", function (event, data) {
        console.log("name_mian", data);
        presWindow.webContents.send("continue_do_fuzhu_pre", data);
    })
    ipc.on("logJobHtml", function (event, data) {
        mainWindow.webContents.send('logJobHtml', data);
    })
    ipc.on("logJobHtmlBack", function (event, data) {
        calcWindow.webContents.send("logJobHtmlBack", data);
    })
    ipc.on("logInfo", function (event, data) {
        calcWindow.webContents.send("log", data);
    })
    ipc.on("forInfo", function (event, data) {
        calcWindow.webContents.send("forInfo", data);
    })
    //动作中转
    ipc.on('eventInterchange', function (event, data) {
        switch (data.to) {
            case "main":
                mainWindow.webContents.send(data.action, data);
                break;
            case "calc":
                calcWindow.webContents.send(data.action, data);
                break;
            case "pres":
                presWindow.webContents.send(data.action, data);
                break
        }

    })
    ipc.on('reset', function (event, data) {
        prevLoad(function () {
            presWindow.reload();
        })
    });

}
app.on('gpu-process-crashed', function (e) {
    const options = {
        type: 'info',
        title: 'app',
        message: "崩溃了！",
        buttons: ['等待', '关闭']
    }
    log.error("主进程gpu崩溃")
    dialog.showMessageBox(options, function (index) {
        if (index === 0);
        else app.quit();
    })
})
app.on('ready', function () {
    process.argv.forEach((e, i) => {
        if (e.includes("-run")) {
            runFilePath = process.argv[i + 1]
        }
    })
    calcWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
                 nodeIntegration: true,
                 webviewTag: true
            },
        frame: false
    })
    calcWindow.setMenu(null)
    calcWindow.loadURL('file://' + __dirname + "/app/pages/calc.html")
    if (runFilePath === null) {
        prevLoad(function () {
            createWindow();
            if (properties.sysConfig.isPackager) {
                let subprocess = spawn(path.join(__dirname, '../../update.exe'), ['-m', 're'], {
                    detached: true,
                    stdio: 'inherit' // ['ignore', process.stdout, process.stderr]
                })
                subprocess.unref()
            }
        });
        if (properties.sysConfig.isDev) {
            // mainWindow.webContents.openDevTools();
            calcWindow.openDevTools();
        }
    } else {
        function readTextJson(pathname) {
            var bin = fs.readFileSync(pathname);

            if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
                bin = bin.slice(3);
            }
            let data = bin.toString('utf-8');
            if (data.includes("�")) {
                return JSON.parse(iconv.decode(bin, 'gbk'));
            } else {
                return JSON.parse(data);
            }
        }
        propertiesInit(); //读取配置信息
        setPath();
        global.sysConfig = properties.sysConfig;
        try {
            let data = readTextJson(runFilePath);
            debugeData = JSON.parse(iconv.decode(new Buffer(data.json), 'utf-8'));
        } catch (e) {
            const options2 = {
                type: 'info',
                title: runFilePath,
                message: e.message.toString(),
                buttons: ['等待', '关闭']
            }
            dialog.showMessageBox(options2, function (index) {
                if (index === 0);
                else app.quit();
            })
        }
        presWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                     nodeIntegration: true,
                     webviewTag: true
                },
            show: true,
            frame: false,
        })
        presWindow.maximize();
        presWindow.setMenu(null)
        presWindow.loadURL('file://' + __dirname + "/app/pages/debugger.html") //新窗口
        presWindow.webContents.on('did-finish-load', function () {
            if (debugeData) {
                presWindow.webContents.send('step', { json: debugeData });
                presWindow.openDevTools();
            }
        });
        presWindow.on("closed", function () {
            presWindow = null;
            debugeData = null;
            app.quit();
        });
    }


});

app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})