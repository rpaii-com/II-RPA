const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const util = require("../main/util")
const net = remote.getGlobal('net');

const log = require("../tool/log/logger");

ipc.on("updateVersion", function (event, data) {
    net.updateVersion.verifyVersion(data, function (err, data) {
        ipc.send("startUpdate", err || data)
    })
})
ipc.on("readExcel", function (event, data) {
    preview(data);
})
function preview(obj) {
    // console.log(util, util.officeUtil.readTableData);
    util.officeUtil.readTableData(obj, function (err, data) {
        ipc.send("eventInterchange", { to: obj.from, action: obj.callbackAction, code: err ? 500 : 200, msg: err, content: data })
    })
}
ipc.on("log", function (event, data) {
    if (data.code == 200) {
        if (data.msg instanceof Object) {
            log.log(data.msg.step, data.msg.error)
        } else {
            log.logInfo(data.msg)
        }
    } else {
        if (data.msg instanceof Object) {
            data.msg = JSON.stringify(data.msg);
        }
        log.logError(data.msg);
    }
})
ipc.on("forInfo", function (event, forinfo) {
    log.logfor(forinfo);
})
ipc.on("logJobHtmlBack", function (event, data) {
    log.logJobHtml(data);
});
