const XLSX = require("xlsx");
const errorStack = require("../important/errorStack");
const csv = require('csv');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');


//检查是否为数字
function checkNumber(theObj) {
    var reg = /^[0-9]+.?[0-9]*$/;
    if (reg.test(theObj)) {
        return true;
    }
    return false;
}


let newOfficeUtil={
    excelToObject:function (data,callback) {
        try {
            let filePath=data.filePath;

            let isExist=fs.existsSync(filePath);
            if(!isExist){
                let workbook = XLSX.utils.book_new();
                let create_worksheet=XLSX.utils.aoa_to_sheet([['']]);
                XLSX.utils.book_append_sheet(workbook, create_worksheet, "Sheet1");
                XLSX.utils.book_append_sheet(workbook, create_worksheet, "Sheet2");
                XLSX.utils.book_append_sheet(workbook, create_worksheet, "Sheet3");
                callback(null,workbook);
            }else{
                let workbook = XLSX.readFile(filePath, {type: 'binary'});
                console.log("conWriteCell:excelToObject",workbook);
                callback(null,workbook);
            }
        }catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    objectToFile:function (data,callback) {
        let workbook=data.excelObject,
            filePath=data.filePath;
        try{
            console.log("conWriteCell:objectToFile",workbook);
            XLSX.writeFile(workbook, filePath,{compression:true, bookSST:true,type:"file"});
            callback();
        }catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    excelChangeSheet:function (data,callback) {
        try {
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                newSheetName=data.newSheetName,
                excelKey=data.excelKey;

            let is_exist=false;
            let sheetNameTem=[];
            workbook.SheetNames.forEach(function (realname,index) {
                if(realname==sheetName){
                    sheetNameTem[index]=newSheetName;
                    is_exist=true
                }else{
                    sheetNameTem[index]=realname;
                }
            })
            workbook.SheetNames=sheetNameTem;
            if(is_exist==false){
                // workbook.SheetNames.push(newSheetName);
                let create_worksheet=XLSX.utils.aoa_to_sheet([['']]);
                XLSX.utils.book_append_sheet(workbook, create_worksheet, newSheetName);

                sheetNameTem.push(newSheetName);
                workbook.SheetNames=sheetNameTem;
            }else{
                let tem_worksheet=workbook.Sheets[sheetName];
                delete workbook.Sheets[sheetName];
                workbook.Sheets[newSheetName]=tem_worksheet;
            }

            let results=new Map();
            results.set(excelKey,workbook);
            callback(null,results)
        }catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    excelCreateSheet:function (data,callback) {
        try {
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                excelKey=data.excelKey;

            let is_exist=false;
            let sheetNameTem=[];
            workbook.SheetNames.forEach(function (realname,index) {
                if(realname==sheetName){
                    sheetNameTem[index]=sheetName;
                    is_exist=true
                }else{
                    sheetNameTem[index]=realname;
                }
            })

            if(is_exist==false){
                let create_worksheet=XLSX.utils.aoa_to_sheet([['']]);
                XLSX.utils.book_append_sheet(workbook, create_worksheet, sheetName);

                sheetNameTem.push(sheetName);
                workbook.SheetNames=sheetNameTem;
            }

            let results=new Map();
            results.set(excelKey,workbook);
            callback(null,results)
        }catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    getCellObject:function (cellData,callback) {
        let newchange = {};

        if (typeof (cellData) == "number" || checkNumber(cellData)) {
            newchange = {
                t: "n",
                v: cellData,
                w: cellData
            }
        } else if (cellData.indexOf("=") != -1) {
            newchange = {
                t: "n",
                f: cellData.replace('=', '')
            };
        } else {
            newchange = {
                t: "s",
                v: cellData,
                w: cellData,
                h:cellData,
                r:"<t>"+cellData+"</t>"

            }
        }
        callback(newchange);
    },
    excelWriteCell:function (data,callback) {
        try{
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                cellData=data.valueParam,
                [r, c] = data.rectangle.split(","),
                excelKey=data.excelKey;

            let results=new Map();

            r = parseInt(r);
            c = parseInt(c);
            let data_pos = XLSX.utils.encode_cell({ r: (r - 1), c: (c - 1) });

            let worksheet = workbook.Sheets[sheetName];

            worksheet["!ref"]=(typeof(worksheet["!ref"])=="undefined")?"A1:B2":worksheet["!ref"];

            let [start_sheet, end_sheet] = worksheet["!ref"].split(":");
            let input_pos = XLSX.utils.decode_cell(data_pos);
            let end_pos = XLSX.utils.decode_cell(end_sheet);

            let r_cell = input_pos.r > end_pos.r ? input_pos.r : end_pos.r;
            let c_cell = input_pos.c > end_pos.c ? input_pos.c : end_pos.c;
            let ref_sheet = start_sheet + ":" + XLSX.utils.encode_cell({ r: r_cell, c: c_cell });

            worksheet["!ref"] = ref_sheet;

            newOfficeUtil.getCellObject(cellData,function (cellObject) {
                // worksheet[data_pos] =cellObject;
                let newworkbook=JSON.parse(JSON.stringify(workbook));
                newworkbook.Sheets[sheetName][data_pos]=cellObject;
                let isload=setInterval(()=>{
                    console.log('等待相同');
                    if(newworkbook.Sheets[sheetName][data_pos]===cellObject);
                        console.log("已经相同",r,c);
                        clearInterval(isload);
                        results.set(excelKey,newworkbook);
                        console.log("conWriteCell:excelWriteCell",newworkbook.Sheets[sheetName][data_pos],cellObject);
                        console.log("conWriteCell:excelWriteCell",data_pos,cellObject,results);
                        callback(null,results);
                },100);
                isload;
            });
        }catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    excelReadCell:function (data,callback) {
        try{
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                resType=data.resType,
                [r, c] = data.rectangle.split(","),
                rename=data.rename,
                excelKey=data.excelKey;

            r = parseInt(r);
            c = parseInt(c);
            let worksheet = workbook.Sheets[sheetName];

            let cellPositon=XLSX.utils.encode_cell({r: (r - 1), c: (c - 1)});
            let result=worksheet[cellPositon];
            if (typeof (result) == "undefined") {
                result = {};
            };
            if (resType == "text") {
                result = result.w;
            }

            let results=new Map();
            results.set(excelKey,workbook);
            results.set(rename,result);
            callback(null,results);
        }catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
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
    excelReadSheet:function (data,callback) {
      try{
          //todo 返回的数据格式
          let workbook=data.excelObject,
              sheetName=data.sheetName,
              allSheet=typeof data.allSheet !="undefined" ? true : false,
              rename=data.rename,
              excelKey=data.excelKey;

          let result={};
          for(let sheet in workbook.Sheets){
              if (workbook.Sheets.hasOwnProperty(sheet)) {
                  result[sheet]=officeUtil.sheetArr(workbook.Sheets[sheet]);
              }
          }
          if(!allSheet){
              result=result[sheetName];
          }

          let results=new Map();
          results.set(excelKey,workbook);
          results.set(rename,result);
          callback(null,results);
      }catch (err) {
          return callback(errorStack("FileNotFoundException", err), null);
      }
    },
    excelWriteSheetW:function () {

    },
    excelWriteSheetA:function () {

    },
    transToTwoArry:function (valueParam) {
        if (typeof (valueParam) == "string" || typeof (valueParam) == "number") {
            valueParam = [[valueParam]];
        }
        if (Object.prototype.toString.call(valueParam[0]).toLowerCase() != "[object array]") {
            valueParam = [valueParam];
        }
        return valueParam
    },
    excelWriteSheet:function (data,callback) {
        try {
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                valueParam=data.valueParam,
                resType=data.resType,
                excelKey=data.excelKey;

            valueParam=newOfficeUtil.transToTwoArry(valueParam);
            let worksheet = workbook.Sheets[sheetName];

            let create_worksheet=XLSX.utils.aoa_to_sheet(valueParam);
            workbook.Sheets[sheetName]=create_worksheet;

            let results=new Map();
            results.set(excelKey,workbook);
            callback(null,results);
        }  catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    excelCopyPart:function (data,callback) {
        try{
            let workbookFrom=data.excelObject,
                workbookTo=data.excelObject2,
                fromSheetName = data.from_sheet,
                toSheetName=data.to_sheet,
                [sr,sc]=data.rectangle_left_up.split(","),
                [er,ec]=data.rectangle_right_down.split(","),
                [tr,tc]=data.to_rectangle_right_up.split(","),
                excelKey=data.excelKey,
                excelKey2=data.excelKey2;

            let worksheetFrom=workbookFrom.Sheets[fromSheetName];
            let worksheetTo=workbookTo.Sheets[toSheetName];
            sr=parseInt(sr)-1,sc=parseInt(sc)-1,er=parseInt(er)-1;
            ec=parseInt(ec)-1,tr=parseInt(tr)-1,tc=parseInt(tc)-1;
            //更改目标文件的，范围
            worksheetTo["!ref"]=(typeof(worksheetTo["!ref"])=="undefined")?"A1:B2":worksheetTo["!ref"];

            let sheetRange=XLSX.utils.decode_range(worksheetTo["!ref"]);

            let startCellRange={
                r:tr,
                c:tc
            };
            let finalCellRange={};
            finalCellRange.r=tr-sr+er;
            finalCellRange.c=tc-sc+ec;
            sheetRange=newOfficeUtil.getNewRange(startCellRange,sheetRange);
            sheetRange=newOfficeUtil.getNewRange(finalCellRange,sheetRange);
            worksheetTo["!ref"]=XLSX.utils.encode_range(sheetRange);
            //更改，合并单元格信息
            let merges=worksheetFrom["!merges"]
            let merges_new=[];
            if (typeof (merges) != "undefined"){
                merges.forEach(function (value,index) {
                    if(value.s.r>=sr && value.s.c>=sc && value.e.r<=er && value.e.c<=ec){
                        value.s.r=value.s.r-sr+tr;
                        value.s.c=value.s.c-sc+tc;
                        value.e.r=value.e.r-sr+tr;
                        value.e.c=value.e.c-sc+tc;
                        merges_new.push(value)
                    }
                });
                if (typeof (worksheetTo["!merges"]) != "undefined") {
                    worksheetTo["!merges"] = worksheetTo["!merges"].concat(merges_new);
                } else {
                    worksheetTo["!merges"] = merges_new;
                }
            }
            //复制单元格内容
            for(let i=tr,m=sr;m<er+1;i++,m++){
                for(let j=tc,n=sc;n<ec+1;j++,n++){
                    let cellFrom=XLSX.utils.encode_cell({ r: m, c: n });
                    let cellTo=XLSX.utils.encode_cell({ r: i, c: j });
                    worksheetTo[cellTo]=worksheetFrom[cellFrom];
                }
            }

            let results=new Map();
            results.set(excelKey,workbookFrom);
            results.set(excelKey2,workbookTo);
            callback(null,results);
        }catch (err) {
            throw err;
            // return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    excelReadRange:function (data,callback) {
        try{
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                [sr,sc]=data.leftUp.split(","),
                [er,ec]=data.rightDown.split(","),
                rename=data.rename,
                excelKey=data.excelKey;

            let worksheet = workbook.Sheets[sheetName];
            sr=parseInt(sr)-1,sc=parseInt(sc)-1,er=parseInt(er)-1,ec=parseInt(ec)-1;
            worksheet["!ref"]=(typeof(worksheet["!ref"])=="undefined")?"A1:B2":worksheet["!ref"];
            let sheetRange=XLSX.utils.decode_range(worksheet["!ref"]);

            if(sr>er || sc>ec){
                return callback(errorStack("FileNotFoundException", "矩形范围错误"), null);
            }
            let result=[];
            for (let i=sr,m=0;i<er+1;i++,m++){

                let resultTem=[]
                for (let j=sc,n=0;j<ec+1;j++,n++){
                    let cellPosition=XLSX.utils.encode_cell({r:i,c:j});
                    resultTem[n]=(typeof worksheet[cellPosition]=="undefined")?'':worksheet[cellPosition].v;
                }
                result[m]=resultTem;
            }

            let results=new Map();
            results.set(excelKey,workbook);
            results.set(rename,result);
            callback(null,results);

        } catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    getNewRange:function (finalCellRange,sheetRange) {
        let sheetRangeTem={s:{},e:{}};
        sheetRangeTem.s.r=finalCellRange.r<sheetRange.s.r?finalCellRange.r:sheetRange.s.r;
        sheetRangeTem.e.r=finalCellRange.r>sheetRange.e.r?finalCellRange.r:sheetRange.e.r;
        sheetRangeTem.s.c=finalCellRange.c<sheetRange.s.c?finalCellRange.c:sheetRange.s.c;
        sheetRangeTem.e.c=finalCellRange.c>sheetRange.e.c?finalCellRange.c:sheetRange.e.c;

        return sheetRangeTem
    },
    excelwriteRange:function (data,callback) {
        try{
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                [sr,sc]=data.leftUp.split(","),
                valueParam=data.valueParam,
                excelKey=data.excelKey;

            let worksheet = workbook.Sheets[sheetName];
            sr=parseInt(sr)-1,sc=parseInt(sc)-1;

            worksheet["!ref"]=(typeof(worksheet["!ref"])=="undefined")?"A1:B2":worksheet["!ref"];

            let sheetRange=XLSX.utils.decode_range(worksheet["!ref"]);

            let startCellRange={
                r:sr,
                c:sc
            };
            let finalCellRange={};
            finalCellRange.r=sr+valueParam.length;
            finalCellRange.c=sc+valueParam[0].length;
            sheetRange=newOfficeUtil.getNewRange(startCellRange,sheetRange);
            sheetRange=newOfficeUtil.getNewRange(finalCellRange,sheetRange);
            worksheet["!ref"]=XLSX.utils.encode_range(sheetRange);

            valueParam.forEach(function(valueRow,row){
                valueRow.forEach(function (valueCol,col) {
                      let cellPosition=XLSX.utils.encode_cell({r: sr+row, c: sc+col}) ;
                      newOfficeUtil.getCellObject(valueCol,function (cellObject) {
                          worksheet[cellPosition]=cellObject;
                      })
                });
            });

            workbook.Sheets[sheetName]=worksheet;
            let results=new Map();
            results.set(excelKey,workbook);
            callback(null,results);
        } catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    excelWriteRowCol:function (data,callback) {
        try{
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                rowColData=data.valueParam,
                rowOrCol=parseInt(data.rectangle)-1,
                isRowOrCol=data.rowCol,
                excelKey=data.excelKey;

            let worksheet = workbook.Sheets[sheetName];

            worksheet["!ref"]=(typeof(worksheet["!ref"])=="undefined")?"A1:B2":worksheet["!ref"];

            let sheetRange=XLSX.utils.decode_range(worksheet["!ref"]);

            let finalCellRange={};
            if(isRowOrCol=="row"){
                finalCellRange.r=rowOrCol;
                finalCellRange.c=rowColData.length;
            }else{
                finalCellRange.r=rowColData.length;
                finalCellRange.c=rowOrCol;
            }

            sheetRange.s.r=finalCellRange.r<sheetRange.s.r?finalCellRange.r:sheetRange.s.r;
            sheetRange.e.r=finalCellRange.r>sheetRange.e.r?finalCellRange.r:sheetRange.e.r;
            sheetRange.s.c=finalCellRange.c<sheetRange.s.c?finalCellRange.c:sheetRange.s.c;
            sheetRange.e.c=finalCellRange.c>sheetRange.e.c?finalCellRange.c:sheetRange.e.c;

            worksheet["!ref"]=XLSX.utils.encode_range(sheetRange);

            let cellPosition='';
            if(isRowOrCol=="row"){
                rowColData.forEach(function (value,index) {
                    cellPosition=XLSX.utils.encode_cell({r:rowOrCol,c:index});
                    newOfficeUtil.getCellObject(value,function (cellObject) {
                        worksheet[cellPosition]=cellObject;
                    })
                })
            }else{
                rowColData.forEach(function (value,index) {
                    cellPosition=XLSX.utils.encode_cell({r:index,c:rowOrCol});
                    newOfficeUtil.getCellObject(value,function (cellObject) {
                        worksheet[cellPosition]=cellObject;
                    })
                })
            }
            let results=new Map();
            results.set(excelKey,workbook);
            callback(null,results);
        } catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    excelDele:function (worksheet,) {

    },
    excelDeleRowCol:function (data,callback) {
        try{
            //todo  删除行列数据，麻烦，延后
            let workbook=data.excelObject,
                sheetName=data.sheetName,
                // operateType=data.operateType,
                rowCol=data.rowCol;
                rowOrCol=parseInt(data.rectangle)-1,
                excelKey=data.excelKey;

            let worksheet = workbook.Sheets[sheetName];
            let sheetRange=XLSX.utils.decode_range(worksheet["!ref"]);

            let cellPosition='';

            if(rowCol=="row"){
                for(let i=0;i<sheetRange.e.r+1;i++){
                    cellPosition=XLSX.utils.encode_cell({r:rowOrCol,c:i});
                    worksheet[cellPosition]={t:"s",v:'',w:''};
                }
            }else{
                for(let i=0;i<sheetRange.e.c+1;i++){
                    cellPosition=XLSX.utils.encode_cell({r:i,c:rowOrCol});
                    worksheet[cellPosition]={t:"s",v:'',w:''};
                }
            }

            let results=new Map();
            results.set(excelKey,workbook);
            callback(null,results);
        }catch (err) {
            return callback(errorStack("FileNotFoundException", err), null);
        }
    },
    readCsvFile:function (data,callback) {
        let filePath=data.filePath;

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
                newofficeUtil.convertUTF8Stream(filePath, callback);
            }

        });

        fs.createReadStream(filePath).pipe(parser);
    },
    writeCsvFile:function (data,callback) {
        let filename = data.filename,
            targetPath = data.targetPath + "/",
            data_value = data.valueParam,
            writeType = data.writeType;


        targetPath=targetPath + filename + ".csv";
        let ctx_data = data_value;
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
    convertUTF8: function (filepath, callback) {
        fs.readFile(filepath, function (err, buffer) {
            let fileContent = iconv.decode(buffer, 'gbk');
            fs.writeFile(filepath, fileContent, function () {
                csvParser.parseFile(filepath, function (err, data) {
                    callback(null, data);
                })
            });
        })
    }
};

module.exports = newOfficeUtil;