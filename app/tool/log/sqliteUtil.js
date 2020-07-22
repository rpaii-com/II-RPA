const sqlite3 = require('sqlite3');

sqliteUtil = {
    db: "",
    todayTableName: "",
    today: "",
    getNowFormatDate: function () {
        let date = new Date();
        let month = date.getMonth() + 1;
        let strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        let currentdate = date.getFullYear() + month + strDate;
        return currentdate;
    },
    connect: function (path, callback) {
        sqliteUtil.db = new sqlite3.Database(path, function (err) {
            if (typeof callback === "function") {
                callback(err)
            }
        })
    },
    create: function (tableName, value, callback) {
        sqliteUtil.db.run("create table if not exists " + tableName + " (" + value + ")", function (err) {
            if (typeof callback === "function") {
                callback(err)
            }
        })
    },
    createByday: function (tableName, callback) {
        tableName = tableName + this.getNowFormatDate()
        console.log(sqliteUtil.db)
        sqliteUtil.db.each("select count(*) num from sqlite_master where type = 'table' and name = $tableName", { $tableName: tableName }, function (err, data) {
            console.log(data)
            if (!err && !data.num) {
                sqliteUtil.db.run("create table if not exists " + tableName + " (id INTEGER PRIMARY KEY autoincrement,job_id INTEGER,step_id INTEGER,parameter TEXT,step_info TEXT,globalParameterList TEXT,partParameterList TEXT,step_status INTEGER,running_time TEXT)", function (err) {
                    if (typeof callback === "function") {
                        callback(err)
                    }
                })
            } else {
                if (typeof callback === "function") {
                    callback(err)
                }
            }
        })
    },
    /**
     * 插入json 数据
     * @param tableName 表名
     * @param jsonData json格式数据
     * @param callback 回调
     */
    insert: function (tableName, jsonData, callback) {
        if (tableName && jsonData) {
            let sqlHead = " INSERT INTO `" + tableName + "` ( ";
            let sqlData = " ";
            for (var i in jsonData) {
                sqlHead += " `" + i + "` ,";
                if (typeof jsonData[i] == 'string') {
                    sqlData += " '" + jsonData[i].replace(/'/g, "\\'") + "' ,";
                } else {
                    sqlData += " '" + JSON.stringify(jsonData[i]).replace(/'/g, "\\'") + "' ,";
                }
            }
            sqlHead = sqlHead.substr(0, sqlHead.length - 1) + ") VALUES ( ";
            sqlData = sqlData.substr(0, sqlData.length - 1) + " )";
            let sql = sqlHead + sqlData;
            sqliteUtil.db.run(sql, function (err) {
                if (typeof callback === "function") {
                    callback(err)
                }
            })
        }
    },
    /**
     * 更新 obj数据
     * @param tableName 表名
     * @param jsonData 新json格式数据
     * @param whereName 限制条件字段名
     * @param whereValue 限制条件值
     * @param resolve 回调
     */
    update: function (tableName, jsonData, whereName, whereValue, callback) {
        if (tableName && jsonData && whereName && whereValue) {
            let sql = " UPDATE  `" + tableName + "` SET ";
            for (var i in jsonData) {
                sql += " `" + i + "` = ";
                if (typeof jsonData[i] == 'string') {
                    sql += " '" + jsonData[i].replace(/'/g, "\\'") + "' ,";
                } else {
                    sql += " '" + JSON.stringify(jsonData[i]).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "' ,";
                }
            }
            sql = sql.substr(0, sql.length - 1) + " ";
            sql += " WHERE `" + whereName + "`='" + whereValue + "' ";
            //   console.log(sql);
            sqliteUtil.db.each(sql, function (err, data) {
                if (typeof callback === "function") {
                    callback(err, data)
                }
            })
        }
    },
    /**
     * 获取 obj数据
     * @param tableName 表名
     * @param jsonWhere json格式限制条件(可选)
     * @param callback 回调
     * @returns array
     */
    selectAll: function (tableName, jsonWhere, callback) {
        let sql = "select * from " + tableName;
        if (typeof jsonWhere == "function") {
            callback = jsonWhere;
            jsonWhere = null;
        }
        if (jsonWhere) {
            sql += " where ";
            for (let key in jsonWhere) {
                sql += "`" + key + "`" + " = ";
                if (typeof jsonWhere[i] == 'string') {
                    sql += " '" + jsonWhere[i].replace(/'/g, "\\'") + "' ,";
                } else {
                    sql += " '" + JSON.stringify(jsonWhere[i]).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "' ,";
                }
            }
        }
        sqliteUtil.db.all(sql, function (err, data) {
            if (typeof callback === "function") {
                callback(err, data)
            }
        })
    },
    /**
     * 获取 obj数据
     * @param tableName 表名
     * @param jsonWhere json格式限制条件(可选)
     * @param callback 回调
     * @returns map
     */
    selectOne: function (tableName, jsonWhere, callback) {
        let sql = "select * from " + tableName;
        if (typeof jsonWhere == "function") {
            callback = jsonWhere;
            jsonWhere = null;
        }
        if (jsonWhere) {
            sql += " where ";
            for (let key in jsonWhere) {
                sql += "`" + key + "`" + " = ";
                if (typeof jsonWhere[i] == 'string') {
                    sql += " '" + jsonWhere[i].replace(/'/g, "\\'") + "' ,";
                } else {
                    sql += " '" + JSON.stringify(jsonWhere[i]).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "' ,";
                }
            }
        }
        sqliteUtil.db.each(sql, function (err, data) {
            if (typeof callback === "function") {
                callback(err, data)
            }
        })
    },
    selectBySql: function (sql, callback) {
        sqliteUtil.db.all(sql, function (err, data) {
            if (typeof callback === "function") {
                callback(err, data)
            }
        })
    }

}
module.exports = sqliteUtil;
