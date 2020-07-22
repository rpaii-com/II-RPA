const errorStack = require("../important/errorStack");

const fs=require('fs');
const path=require('path');
const iconv = require('iconv-lite');
//解析docx
const officegen = require('officegen');


let docOfficeUtil={
    docReadTxt:function (data,callback) {
        let filePath=data.filePath;

        fs.readFile(filePath, 'utf-8', (err, dataFile) => {
            if (err) {
                callback(errorStack("FileNotFoundException", err), null);
                return;
            } else {
                if (dataFile.includes("�")) {
                    fs.readFile(filePath, (err, buffer) => {
                        let gbkdata = iconv.decode(buffer, 'gbk');
                        callback(null, gbkdata);
                    })
                } else {
                    callback(null, dataFile);
                }
            }
        });
    },
    docWriteTxt:function (data,callback) {
        let filePath=data.targetPath+"/"+data.filename+".txt",
            valueParam=data.valueParam,
            writeType=data.writeType;

        valueParam= valueParam.toString().replace(/\n/g, "\r\n");
        let string_data = valueParam + "\r\n";

        fs.writeFile(filePath, string_data, { flag: writeType }, (err) => {
            if (err) {
                callback(errorStack("FileNotCreateException", err));
            } else {
                console.log('The file has been saved!');
                callback(null, filePath);
            };
        });
    },
    readWordx: function (filePath, callback) {
        const AdmZip = require('adm-zip'); //引入查看zip文件的包
        const zip = new AdmZip(filePath); //filePath为文件路径
        let contentXml = zip.readAsText("word/document.xml");//将document.xml读取为text内容；
        let str = "";
        contentXml.match(/<w:t>[\s\S]*?<\/w:t>/ig).forEach((item) => {
            str += item.slice(5, -6)
        });
        callback(null, str);
    },
    readWord: function (filePath, CShandle, callback) {
        exec(CShandle + '/uispy.exe -m w2t -p ' + filePath, { encoding: 'binary' }, function (err, stdout, stderr) {
            if (err) {
                let error = iconv.decode(new Buffer(err, 'binary'), 'GBK');
                callback(errorStack("ElementNotFoundException", error));
                return;
            }
            let data={filePath:CShandle + '/w2t.txt'};
            docOfficeUtil.docReadTxt(data, callback)
        })
    },
    docReadWord:function (data,callback) {
        let filePath = data.filePath;
        let fileType=path.parse(filePath).ext;

        switch (fileType){
            case '.docx':
                docOfficeUtil.readWordx(filePath,callback);
                break;
            case '.doc':
                docOfficeUtil.readWord(filePath,data.CShandle,callback);
                break;
            default:
                callback(errorStack("ElementNotFoundException", "写入word类型出错"));
        }
    },
    docWriteWord:function (data,callback) {
        let filePath=data.targetPath+"/"+data.filename+".doc",
            valueParam=data.valueParam;
        try{
            //每次运行，重新引用；因为数据保存在docx里面，不然每次运行的写入会重复（不关调试器）
            const docx = officegen('docx');
            let string_data=valueParam.toString();
            let pObj = docx.createP();
            pObj.addText(string_data, { font_face: 'Arial', font_size: 10 }); // 添加文字 设置字体样式 加粗 大小
            if (filePath) {
                let out = fs.createWriteStream(filePath); // 文件写入
                let result = docx.generate(out); // 服务端生成word
                callback(null, filePath);
            }
        } catch (err){
            callback(errorStack("FileNotCreateException", "该数据不能到导出为word!"));
        }
    },
};

module.exports = docOfficeUtil;