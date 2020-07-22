/**
 * 
 */
//引入 表单解析
const formidable = require('formidable');
//引入node-csv解析csv模块
const csvParser = require('node-csv').createParser();
const errorStack = require("../important/errorStack");
//解析docx
const officegen = require('officegen');
const docx = officegen('docx');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
iconv.skipDecodeWarning = true;
const exec = require('child_process').exec;
const csv = require('csv');
const Duplex = require('stream').Duplex;
const XLSX = require("xlsx");
//读取pdf文件,库的引用方式不能直接require，必须按下面方式

const PDFParser = require('electron').remote.require("pdf2json");


//检查是否为数字
function checkNumber(theObj) {
    var reg = /^[0-9]+.?[0-9]*$/;
    if (reg.test(theObj)) {
        return true;
    }
    return false;
}

var officeUtil = {
    convertUTF8: function (filepath, callback) {
        fs.readFile(filepath, function (err, buffer) {
            let fileContent = iconv.decode(buffer, 'gbk');
            fs.writeFile(filepath, fileContent, function () {
                csvParser.parseFile(filepath, function (err, data) {
                    callback(null, data);
                })
            });
        })
    },
    bufferToStream: function (buffer) {
        let stream = new Duplex();
        stream.push(buffer);
        stream.push(null);
        return stream;
    },
    convertUTF8Stream: function (filePath, callback) {
        var parser = csv.parse({
            relax_column_count: true,
        }, function (err, data) {
            if (err) {
                callback(errorStack("FileNotFoundException", err), null);
                return;
            }
            callback(null, data);
        });
        fs.readFile(filePath, function (err, buffer) {
            let fileContent = iconv.decode(buffer, 'gbk');
            //console.log(fileContent)
            officeUtil.bufferToStream(new Buffer(fileContent)).pipe(parser)
        })
    },
    convertUTF8Stream_2: function (filePath, x, y, callback) {
        var parser = csv.parse({
            relax_column_count: true,
        }, function (err, data) {
            if (err) {
                callback(errorStack("FileNotFoundException", err), null);
            }
            callback(null, data[x - 1][y - 1]);
        });
        fs.readFile(filePath, function (err, buffer) {
            if (err) {
                callback(errorStack("FileNotFoundException", err), null);
            }
            let fileContent = iconv.decode(buffer, 'gbk');
            //console.log(fileContent)
            officeUtil.bufferToStream(new Buffer(fileContent)).pipe(parser)
        })
    },
    readTxt: function (filePath, callback) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                callback(errorStack("FileNotFoundException", err), null);
                return;
            } else {
                if (data.includes("�")) {
                    fs.readFile(filePath, (err, buffer) => {
                        let gbkdata = iconv.decode(buffer, 'gbk');
                        callback(null, gbkdata);
                    })
                } else {
                    callback(null, data);
                }
            }
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
            officeUtil.readTxt(CShandle + '/w2t.txt', callback)
        })
    },
    readCsv: function (filePath, callback) {
        let isUTF8 = true;
        var parser = csv.parse({
            relax_column_count: true,
        }, function (err, data) {
            if (err) {
                callback(errorStack("FileNotFoundException", err), null);
                return;
            }
            for (var i in data) {
                for (var j = 0; j < data[i].length; j++) {
                    if (typeof data[i][j] === "function" || typeof data[i][j] == 'undefined') {
                        continue;
                    }
                    if (!data[i][j]) {
                        data[i][j] = '';
                    }
                    if (data[i][j].indexOf("�") != -1) { //nodejs不支持gbk,暂无更好办法
                        isUTF8 = false;
                        break;
                    }
                }
                if (!isUTF8) {
                    break;
                }
            }
            if (isUTF8) {
                callback(null, data);
            } else {
                officeUtil.convertUTF8Stream(filePath, callback);
            }

        });

        fs.createReadStream(filePath).pipe(parser);

    },
    sheetArr: function (sheet) {
        var result = [];
        var row;
        var rowNum;
        var colNum;
        if (typeof sheet['!ref'] == "undefined") {
            alert("请注意，这是个空文件！")
            return [];
        }
        var range = XLSX.utils.decode_range(sheet['!ref']);
        for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            row = [];
            for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
                var nextCell = sheet[
                    XLSX.utils.encode_cell({ r: rowNum, c: colNum })
                ];
                if (typeof nextCell === 'undefined') {
                    row.push("");
                } else row.push(nextCell.v);
            }
            result.push(row);
        }
        return result;
    },
    readXslsx: function (filePath, callback) {
        try {
            var workbook = XLSX.readFile(filePath, {
                type: 'binary'
            });
            persons = []
        } catch (err) {
            console.log(filePath + ':' + err);
            callback(errorStack("FileNotFoundException", err), null);
            return;
        }

        // 表格的表格范围，可用于判断表头是否数量是否正确
        //var fromTo = '';
        // 遍历每张表读取

        for (var sheet in workbook.Sheets) {

            if (workbook.Sheets.hasOwnProperty(sheet)) {
                //fromTo = workbook.Sheets[sheet]['!ref'];
                //     console.log(fromTo);  //xlsx表格 信息
                persons = persons.concat(officeUtil.sheetArr(workbook.Sheets[sheet]));
                //  persons = persons.concat(XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]));
                break; // 如果只取第一张表，就取消注释这行
            }
        }
        // let fileData = { type: 'xlsx', array: xls_array, jsonObj: persons, workbookObj: workbook };
        callback(null, persons);
    },
    /*XLS引用出错，此方法弃用*/
    readXls: function (filePath, callback) {
        try {
            var data = fs.readFileSync(filePath, "binary");
            //    var data = ev.target.result,
            workbook = XLS.read(data, {
                type: 'binary'
            }), // 以二进制流方式读取得到整份excel表格对象
                persons = []; // 存储获取到的数据
        } catch (err) {
            console.log(filePath + ':' + e);
            callback(errorStack("FileNotFoundException", err), null);
            return;
        }
        // 表格的表格范围，可用于判断表头是否数量是否正确
        // var fromTo = '';
        // 遍历每张表读取
        for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
                //fromTo = workbook.Sheets[sheet]['!ref'];
                //     console.log(fromTo);  //xls表格 信息
                persons = persons.concat(officeUtil.sheetArr(workbook.Sheets[sheet]));

                // persons = persons.concat(XLS.utils.sheet_to_json(workbook.Sheets[sheet]));
                break; // 如果只取第一张表，就取消注释这行
            }
        }
        callback(null, persons);

    },
    writeCsvXlsx: function (targetPath, ctx_data, callback) {
        try {
            var wb = XLSX.utils.book_new();
            var ws = XLSX.utils.aoa_to_sheet(ctx_data);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            var name = XLSX.utils.sheet_to_csv(wb);
            XLSX.writeFile(wb, targetPath);
            callback(null, targetPath);
        } catch (error) {
            console.log(error);
            callback(errorStack("FileNotCreateException", error));
        }
    },
    writeCsv_new: function (targetPath, data, writeType, callback) {
        let ctx_data = data;
        if (ctx_data) {
            if (typeof (ctx_data) == "string" || typeof (ctx_data) == "number") {
                ctx_data = [[ctx_data]];
            }
            if (typeof (ctx_data[0]) != "Array" && typeof (ctx_data[0]) != "object") {
                ctx_data = [ctx_data];
            }
            if (writeType == "a+") {
                if (!fs.existsSync(targetPath)) {
                    fs.openSync(targetPath, "w");
                }
                officeUtil.readCsv(targetPath, function (err, data_origin) {
                    if (err) {
                        callback(errorStack("FileNotCreateException", err));
                    } else {
                        ctx_data = data_origin.concat(ctx_data);
                        officeUtil.writeCsvXlsx(targetPath, ctx_data, callback);
                    }
                });
            } else {
                officeUtil.writeCsvXlsx(targetPath, ctx_data, callback);
            }
        } else {
            callback(nerrorStack("FileNotCreateException", "数据有误!"));
        }

    },
    writeCsv: function (targetPath, data, callback) {
        let ctx_data = data;
        var content = '';
        if (ctx_data) {
            for (var i = 0; i < ctx_data.length; i++) {
                if (Object.prototype.toString.call(ctx_data[i]).toLowerCase() == "[object string]") {
                    content += ctx_data[i];
                } else {
                    for (var j = 0; j < ctx_data[i].length; j++) {
                        content += "\"" + ctx_data[i][j] + "\",";
                    }
                    content = content.substring(0, content.length - 1);
                }
                content = content + "\n";

            }
        }

        let ctx_data_str = encodeURI(content);
        if (!content || content == '') {
            callback(errorStack("FileNotCreateException", "没有需要导出的数据!"));
            return false;
        }
        // 转换成gbk
        var encoded = iconv.encode(content, 'gbk');
        fs.writeFile(targetPath, encoded, function () {
            var buf = fs.readFileSync(targetPath);
            callback(null);
        });
    },
    writeExcel: function (targetPath, data, writeType, sheet_name, callback) {
        /*先创建空xlsx文件，然后修改Sheet1内容，数据格式[[],[]],二维数组*/
        /*特定Sheet名称，后期可加*/
        let ctx_data = data;
        console.log(data)
        if (ctx_data) {
            if (typeof (ctx_data) == "string") {
                ctx_data = [[ctx_data]];
            }
            if (Object.prototype.toString.call(ctx_data[0]).toLowerCase() != "[object array]") {
                ctx_data = [ctx_data];
            }

            try {
                // var create_file = fs.openSync(targetPath, 'w');
                // var workbook = XLSX_xu.readFile(targetPath);
                if (writeType == 'a+') {
                    var wb = XLSX.readFile(targetPath);
                    var ws = wb.Sheets[sheet_name];
                    XLSX.utils.sheet_add_aoa(ws, ctx_data, { origin: -1 });
                    XLSX.writeFile(wb, targetPath);
                } else {
                    var wb = XLSX.utils.book_new();
                    var ws = XLSX.utils.aoa_to_sheet(ctx_data, );
                    XLSX.utils.book_append_sheet(wb, ws, sheet_name);
                    // var ws2 = wb.Sheets["Sheet1"];
                    // XLSX.utils.sheet_add_aoa(ws2, ctx_data);

                    XLSX.writeFile(wb, targetPath);
                }
                callback(null, targetPath);
            } catch (error) {
                console.log(error);
                callback(errorStack("FileNotCreateException", "该数据不能到导出为excel!"));
            }
        } else {
            callback(errorStack("FileNotCreateException", "数据有误!"));
        }
    },
    writeWord: function (targetPath, data, callback, ) {
        let ctx_data = data;
        var string_data = data.toString();
        if (ctx_data) {
            var pObj = docx.createP();
            pObj.addText(string_data, { font_face: 'Arial', font_size: 10 }); // 添加文字 设置字体样式 加粗 大小
            if (targetPath) {
                var out = fs.createWriteStream(targetPath); // 文件写入
                var result = docx.generate(out); // 服务端生成word
                callback(null, targetPath);

            }
        } else {
            callback(errorStack("FileNotCreateException", "该数据不能到导出为word!"));
        }
    },
    writeTxt: function (targetPath, data, writeType, callback) {
        let ctx_data = data.toString().replace(/\n/g, "\r\n");
        var string_data = ctx_data + "\r\n";

        fs.writeFile(targetPath, string_data, { flag: writeType }, (err) => {
            if (err) {
                callback(errorStack("FileNotCreateException", err));
            } else {
                console.log('The file has been saved!');
                callback(null, targetPath);
            };
        });
    },
    readTableData: function (parameters, callback) {
        console.log(1);
        let filePath = parameters.filePath;
        let fileType = filePath.substring(filePath.lastIndexOf(".") + 1, filePath.length)
        console.log(filePath, fileType)
        switch (fileType) {
            /*
            * 原有XLs，引用出错，统一使用Xlsx库进行读取xls，xlsx格式*/
            case "csv":
                this.readCsv(filePath, callback)
                break;
            case "xls":
            case "xlsx":
                this.readXslsx(filePath, callback)
                break;
            // case "xls":
            //     this.readXls(filePath, callback)
            //     break;
            case "docx":
                this.readWordx(filePath, callback)
                break;
            case "doc":
                this.readWord(filePath, parameters.CShandle, callback)
                break;
            case "text":
            case "txt":
                this.readTxt(filePath, callback)
                break;
            default:
                callback(errorStack("FileTypeException", '暂不支持该格式文件!'));
                break;

        }
    },
    writeFile: function (data, callback) {
        var filename = data.filename;
        var fileType = data.fileType;
        var targetPath = data.targetPath + "/";
        var data_value = data.valueParam;
        var writeType = data.writeType;
        var sheet_name = data.sheet_name;
        switch (fileType) {
            case "csv":
                this.writeCsv_new(targetPath + filename + ".csv", data_value, writeType, callback);
                break;
            case "excel":
                this.writeExcel(targetPath + filename + ".xlsx", data_value, writeType, sheet_name, callback);
                break;
            case "word":
                this.writeWord(targetPath + filename + ".doc", data_value, callback);
                break;
            case "txt":
                this.writeTxt(targetPath + filename + ".txt", data_value, writeType, callback);
                break;
            default:
                alert('暂不支持该格式文件!');
                callback(errorStack("FileTypeException", new Error('暂不支持该格式文件!')));
        }
    },
    pw_write_csv: function (data, callback) {
        var data_value = data.valueParam;
        var [x, y] = data.rectangle.split(",");
        var filename = data.filename;

        this.readCsv(filename, function (err, data) {
            if (err) {
                callback(err);
            }
            if (x > data.length) {
                for (var i = data.length; i < x; i++) {
                    data[i] = [];
                    data[i][y - 1] = '';
                }
                // data[x-1]=[];
            }
            data[x - 1][y - 1] = data_value;
            officeUtil.writeCsv_new(filename, data, callback);
        })
    },
    pw_write_xlsx: function (data, callback) {
        let data_value = data.valueParam;
        let [r, c] = data.rectangle.split(",");
        r = parseInt(r);
        c = parseInt(c);
        let data_pos = XLSX.utils.encode_cell({ r: (r - 1), c: (c - 1) });
        let filename = data.filename;
        let sheet_name = data.sheet_name;

        let workbook = XLSX.readFile(filename);
        let worksheet = workbook.Sheets[sheet_name];

        worksheet["!ref"] = (typeof (worksheet["!ref"]) == "undefined") ? "A1:B2" : worksheet["!ref"];

        let [start_sheet, end_sheet] = worksheet["!ref"].split(":");
        let input_pos = XLSX.utils.decode_cell(data_pos);
        let end_pos = XLSX.utils.decode_cell(end_sheet);

        let r_cell = input_pos.r > end_pos.r ? input_pos.r : end_pos.r;
        let c_cell = input_pos.c > end_pos.c ? input_pos.c : end_pos.c;
        let ref_sheet = start_sheet + ":" + XLSX.utils.encode_cell({ r: r_cell, c: c_cell });

        worksheet["!ref"] = ref_sheet;
        let newchange = {};

        if (typeof (data_value) == "number" || checkNumber(data_value)) {
            newchange = {
                t: "n",
                h: data_value,
                v: data_value,
                m: data_value
            }
        } else if (data_value.indexOf("=") != -1) {
            newchange = {
                t: "n",
                f: data_value.replace('=', '')
            };
        } else {
            newchange = {
                t: "s",
                h: data_value,
                v: data_value,
                m: data_value
            }
        }

        worksheet[data_pos] = newchange;

        XLSX.writeFile(workbook, filename, { compression: true, bookSST: true, type: "file" });
        // setTimeout(callback(),1000
        callback();
    },
    PreciseWriteFile: function (data, callback) {
        var filename = data.filename;
        var filetype = path.parse(filename).ext;

        switch (filetype) {
            case ".csv":
                this.pw_write_csv(data, callback);
                break;
            case ".xls":
            case ".xlsx":
                this.pw_write_xlsx(data, callback);
                break;
            default:
                callback(errorStack("FileTypeException", '暂不支持该格式文件!'));
        }
    },
    pw_read_csv: function (data, callback) {
        var [x, y] = data.rectangle.split(",");
        var filename = data.filename;
        let isUTF8 = true;
        var parser = csv.parse(function (err, data) {
            if (err) {
                callback(err, null);
            }
            for (var i in data) {
                for (var j = 0; j < data[i].length; j++) {
                    if (typeof data[i][j] === "function" || typeof data[i][j] == 'undefined') {
                        continue;
                    }
                    if (!data[i][j]) {
                        data[i][j] = '';
                    }
                    if (data[i][j].indexOf("�") != -1) { //nodejs不支持gbk,暂无更好办法
                        isUTF8 = false;
                        break;
                    }
                }
                if (!isUTF8) {
                    break;
                }
            }
            var new_data = data[x - 1][y - 1];
            if (isUTF8) {
                callback(null, new_data);
            } else {
                officeUtil.convertUTF8Stream_2(filename, x, y, callback);
            }
        });
        fs.createReadStream(filename, { encoding: "utf-8" }).pipe(parser);
    },
    pw_read_xlsx: function (data, callback) {
        try {
            var [r, c] = data.rectangle.split(",");
            r = parseInt(r);
            c = parseInt(c);
            var data_pos = XLSX.utils.encode_cell({ r: (r - 1), c: (c - 1) });
            var filename = data.filename;
            var sheet_name = data.sheet_name;

            var workbook = XLSX.readFile(filename);
            var worksheet = workbook.Sheets[sheet_name];

            var new_data = worksheet[data_pos];
            if (typeof (new_data) == "undefined") {
                new_data = "null";
            };
            if (data.db_type == "text") {
                new_data = new_data.w;
            }
            callback(null, new_data);
        } catch (err) {
            callback(er, null);
        };
    },
    PreciseReadFile: function (data, callback) {
        var filename = data.filename;
        var filetype = path.parse(filename).ext;

        switch (filetype) {
            case ".csv":
                this.pw_read_csv(data, callback);
                break;
            case ".xls":
            case ".xlsx":
                this.pw_read_xlsx(data, callback);
                break;
            default:
                alert('暂不支持该格式文件!');
                callback(errorStack("FileTypeException", '暂不支持该格式文件!'));
        }
    },
    copyExclePart: function (data, callback) {
        var from_file = data.from_file;
        var rectangle_left_up = data.rectangle_left_up;
        var rectangle_right_down = data.rectangle_right_down;
        var to_file = data.to_file;
        var to_rectangle_right_up = data.to_rectangle_right_up;
        var from_sheet = data.from_sheet;
        var to_sheet = data.to_sheet;

        var workbook_from = XLSX.readFile(from_file);
        var worksheet_from = workbook_from.Sheets[from_sheet];

        var workbook_to = XLSX.readFile(to_file);
        var worksheet_to = workbook_to.Sheets[to_sheet];

        var fanwei = XLSX.utils.decode_range(rectangle_left_up + ":" + rectangle_right_down);

        var fanwei_to = XLSX.utils.decode_cell(to_rectangle_right_up);

        // worksheet_to["!ref"]=worksheet_from["!ref"];
        worksheet_to["!ref"] = "A1:CW10001";
        var merges = worksheet_from["!merges"];
        var merges_new = [];

        var fanwei_to_end_r = fanwei.e.r - fanwei.s.r + fanwei_to.r;
        var fanwei_to_end_c = fanwei.e.c - fanwei.s.c + fanwei_to.c;

        if (typeof (merges) != "undefined") {
            for (var k = 0; k < merges.length; k++) {
                if (merges[k].s.r >= fanwei.s.r && merges[k].s.c >= fanwei.s.c && merges[k].e.r <= fanwei.e.r && merges[k].e.c <= fanwei.e.c) {
                    merges[k].s.r = merges[k].s.r - fanwei.s.r + fanwei_to.r;
                    merges[k].e.r = merges[k].e.r - fanwei.s.r + fanwei_to.r;
                    merges[k].s.c = merges[k].s.c - fanwei.s.c + fanwei_to.c;
                    merges[k].e.c = merges[k].e.c - fanwei.s.c + fanwei_to.c;

                    merges_new.push(merges[k]);
                }
            }
            // worksheet_to["!merges"]=worksheet_from["!merges"];
            if (typeof (worksheet_to["!merges"]) != "undefined") {
                worksheet_to["!merges"] = worksheet_to["!merges"].concat(merges_new);
            } else {
                worksheet_to["!merges"] = merges_new;
            }
        }
        for (var i = fanwei.s.r; i <= fanwei.e.r; i++) {
            for (var j = fanwei.s.c; j <= fanwei.e.c; j++) {
                var pos_sheet_from = XLSX.utils.encode_cell({ r: i, c: j });

                var r_to = (i - fanwei.s.r) + fanwei_to.r;
                var c_to = (j - fanwei.s.c) + fanwei_to.c;

                var pos_sheet_to = XLSX.utils.encode_cell({ r: r_to, c: c_to });
                worksheet_to[pos_sheet_to] = worksheet_from[pos_sheet_from];
            }
        }
        XLSX.writeFile(workbook_to, to_file);
        callback();
    },
    changeStyleExcle: function (data, callback) {

        var filename = data.filename.replace(/\//g, '\\');
        var sheetname = data.sheet_name;
        var rectangle = data.rectangle;
        var isBlod = typeof (data.isBlod) != "undefined" ? true : false;
        var isItalic = typeof (data.isItalic) != "undefined" ? true : false;
        var isUnderline = typeof (data.isUnderline) != "undefined" ? true : false;

        var RGB = data.RGB.length != 0 ? data.RGB.split(",") : [];
        var fontSize = data.fontSize.length != 0 ? parseInt(data.fontSize) : -1;
        var fontRGB = data.fontRGB.length != 0 ? data.fontRGB.split(",") : [];
        if (RGB.length > 0) {
            RGB.forEach((e, index) => {
                RGB[index] = parseInt(RGB[index]);
            });
        }
        if (fontRGB.length > 0) {
            fontRGB.forEach((e, index) => {
                fontRGB[index] = parseInt(fontRGB[index]);
            });
        }
        var json_args = {
            isBlod: isBlod,
            isItalic: isItalic,
            isUnderline: isUnderline,
            RGB: RGB,
            fontSize: fontSize,
            fontRGB: fontRGB,
            type: "cell",
            parameter: rectangle,
            sheetName: sheetname
        };
        const exec = require('child_process').exec;
        var str_cmd = data.CShandle + "/uispy.exe " + " -m hlExcel -p " + filename + " -a " + JSON.stringify(json_args);
        str_cmd = str_cmd.replace(/"/g, "'");
        // let timeout = setTimeout(() => {
        //     callback();
        // }, 1000);
        exec(str_cmd, { encoding: 'binary' }, (error, stdout, stderr) => {
            if (error) {
                let err = iconv.decode(new Buffer(error, 'binary'), 'GBK');
                // clearTimeout(timeout);
                callback(errorStack("IllegalAccessException", err));
                return;
            };
            callback();
        });
    },
    readPDF: function (data, callback) {
        let file_path = data.openPath;

        let pdfParser = new PDFParser(null, 1);

        pdfParser.on("pdfParser_dataError", err => {
            callback(errorStack("IllegalAccessException", err));
        });
        pdfParser.on("pdfParser_dataReady", pdfData => {
            let txt_data = pdfParser.getRawTextContent();
            callback(null, txt_data);
        });

        pdfParser.loadPDF(file_path);
    }
    //   暂时不加，存在问题，中文乱码
    // {
    //     "name": "读取PDF文件",
    //     "url": "shujubiaoge/duqupdf.html",
    //     "className": "diy-icon-menu2-1"
    // },
}
module.exports = officeUtil