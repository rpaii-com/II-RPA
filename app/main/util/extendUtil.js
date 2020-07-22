const _ = require('lodash')
const fs = require('fs')
const path = require('path')
var modulePath = []
/**
 * 映射 d 文件夹下的文件为模块
 */
const mapDir = d => {
    const tree = {}

    // 获得当前文件夹下的所有的文件夹和文件
    const [dirs, files] = _(fs.readdirSync(d)).partition(p => fs.statSync(path.join(d, p)).isDirectory())

    // 映射文件夹
    dirs.forEach(dir => {
        tree[dir] = mapDir(path.join(d, dir))
    })

    // 映射文件
    files.forEach(file => {
        if (path.extname(file) === '.js' && file.includes("_ex_")) {
            let fileTemp = path.basename(file, '.js');
            let power = fileTemp.substring(0, file.indexOf("_"));
            switch (power) {
                case "o":
                    fileTemp = fileTemp.substring(fileTemp.indexOf("_ex_") + 4, fileTemp.length);
                    break;
                default:
                    fileTemp = fileTemp.substring(fileTemp.indexOf("_") + 1, fileTemp.length);
                    break;
            }
            tree[fileTemp] = require(path.join(d, file))(modulePath, __dirname + "\\")
        }
    })

    return tree
}

// 默认导出当前文件夹下的映射
module.exports = (rootPath,isPackager) => {
    let atemp = __dirname.split("\\")
    let i = atemp.length;
    while (i--) {
        modulePath.push(atemp.join("\\") + "\\" + "node_modules")
        atemp.splice(i, 1);
    }
    let over = mapDir(path.join(rootPath, isPackager?"../extend":"./extend"))
    let ret = {};
    for (let i in over) {
        for (let j in over[i]) {
            ret[j] = over[i][j]
        }
    }
    return ret;
}
