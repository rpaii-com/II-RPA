const mysql = require('mysql');
const sql = require('mssql');

const errorStack = require("../important/errorStack");

/*返回数据键名，均为大写*/
function data_format_oracle(result) {
    var metaData = result.metaData;
    var new_results = [];
    result.rows.forEach(function (row) {
        var new_result = {};
        for (var i = 0; i < row.length; i++) {
            new_result[metaData[i].name] = row[i];
        }
        new_results.push(new_result);
    });
    return new_results;
}
//关闭oracle数据库连接
function doRelease(connection) {
    connection.close(
        function (err) {
            if (err)
                console.error(err.message);
        });
}

let dbOracle = {
    db_select: function (db_config, db_sql, callback) {
        oracledb.getConnection(db_config,
            function (err, connection) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                connection.execute(
                    db_sql, [],
                    function (err, result) {
                        //统一返回数据格式
                        if (err) {
                            console.error(err.message);
                            doRelease(connection);
                            return;
                        }
                        var new_results = data_format_oracle(result)
                        callback(err, new_results);
                        doRelease(connection);
                    });
            });
    },
    db_others: function (db_config, db_sql, callback) {
        oracledb.getConnection(db_config,
            function (err, connection) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                connection.execute(
                    db_sql, [],
                    function (err, result) {
                        //统一返回数据格式
                        if (err) {
                            console.error(err.message);
                            doRelease(connection);
                            return;
                        }
                        var new_results = result.rowsAffected;
                        callback(err, new_results);
                        doRelease(connection);
                    });
            });
    }
};
/*mssql数据库相关操作*/
let dbMssql = {
    /*查询*/
    db_select: function (db_config, db_sql, callback) {
        sql.close();
        sql.connect(db_config, err => {
            if (err) {
                callback(errorStack("SQLException", err));
                //throw err;
                return;
            };
            new sql.Request().query(db_sql, (err, results) => {
                callback(null, results.recordset);
                console.log(results);
                sql.close();
            });
        });
    },
    db_others: function (db_config, db_sql, callback) {
        sql.close();
        sql.connect(db_config, err => {
            if (err) {
                callback(errorStack("SQLException", err));
                // throw err;
                return;
            };
            new sql.Request().query(db_sql, (err, results) => {
                if (err) {
                    callback(errorStack("SQLException", err));
                    //throw err;
                    return;
                };
                callback(err, results.rowsAffected[0]);
                console.log(results);
                sql.close();
            });
        });
    }
};

/*mysql数据库相关操作*/
let dbMysql = {
    /*查询*/
    db_select: function (db_config, db_sql, callback) {
        var connection = mysql.createConnection(db_config);
        connection.connect();
        connection.query(db_sql, function (err, results, fields) {
            if (err) {
                callback(errorStack("SQLException", err));
                //throw err;
                return;
            };
            console.log('The solution is: ', results[0]);
            callback(null, results);
        });
        connection.end();
    },
    db_others: function (db_config, db_sql, callback) {
        var connection = mysql.createConnection(db_config);
        connection.connect();
        connection.query(db_sql, function (err, results, fields) {
            if (err) {
                callback(errorStack("SQLException", err));
                //throw err;
                return;
            };
            console.log('The solution is: ', results.affectedRows);
            callback(null, results.affectedRows);
        });
        connection.end();
    }
}
/*菜单数据库功能操作*/
let dbForMenuUtil = {
    /*配置数据库*/
    db_config: function (data, callback) {
        switch (data.db_type) {
            case "mysql":
                var stepParamter = {
                    db_type: data.db_type,
                    db_config: {
                        host: data.hostname,
                        port: data.port,
                        user: data.username,
                        password: data.password,
                        database: data.schema
                    }
                };
                break;
            case "mssql":
                var stepParamter = {
                    db_type: data.db_type,
                    db_config: {
                        server: data.hostname,
                        port: data.port,
                        user: data.username,
                        password: data.password,
                        database: data.schema
                    }
                };
                break;
            case "oracle":
                const oracledb = require('oracledb');
                var port = data.port ? data.port : 1521;
                var connectString = data.hostname + ":" + port + "/" + data.schema;
                var stepParamter = {
                    db_type: data.db_type,
                    db_config: {
                        connectString: connectString,
                        user: data.username,
                        password: data.password
                    }
                };
                break;
            default:
                callback(errorStack("ElementNotFoundException", "没有此选项！"));
        }

        if (stepParamter.db_config.port == "" || stepParamter.db_config.username == "") {
            callback(errorStack("SQLException", "数据库配置信息不完整"));
        } else {
            var db_rename = data.rename;
            callback(null, stepParamter);
        }
    },
    /*查询数据库*/
    db_select: function (data, callback) {
        let db_sql = data.db_sql;
        let stepParamter = data.db_rename;
        let db_type = stepParamter.db_type;
        let db_config = stepParamter.db_config;

        switch (db_type) {
            case "mysql":
                dbMysql.db_select(db_config, db_sql, callback);
                break;
            case "mssql":
                dbMssql.db_select(db_config, db_sql, callback);
                break;
            case "oracle":
                dbOracle.db_select(db_config, db_sql, callback);
                break;
            default:
                callback(errorStack("ElementNotFoundException", "没有此选项！"));
        }

    },
    db_others: function (data, callback) {
        let db_sql = data.db_sql;
        let stepParamter = data.db_rename;
        let db_type = stepParamter.db_type;
        let db_config = stepParamter.db_config;

        switch (db_type) {
            case "mysql":
                dbMysql.db_others(db_config, db_sql, callback);
                break;
            case "mssql":
                dbMssql.db_others(db_config, db_sql, callback);
                break;
            case "oracle":
                dbOracle.db_others(db_config, db_sql, callback);
                break;
            default:
                callback(errorStack("ElementNotFoundException", "没有此选项！"));
        }
    },
    db_insert: function (data, callback) {
        var db_sql = data.db_sql;
        var stepParamter = data.db_rename;
        var db_type = stepParamter.db_type;
        var db_config = stepParamter.db_config;
        var db_data = data.db_data;

        if (Object.prototype.toString.call(db_data).toLowerCase() != "[object array]" &&
            Object.prototype.toString.call(db_data[0]).toLowerCase() != "[object array]") {
            return callback(errorStack("ElementNotFoundException",
                "没有此选项！"));
        };
        db_sql = db_sql.replace('VALUES', 'values');
        let reg_val = /values[ ]*\((.*)\)/g;
        let db_sql_new = [];
        if (reg_val.test(db_sql)) {
            let k_lists = RegExp.$1.split(',');
            let sql_a = [];
            for (var i = 0; i < db_data.length; i++) {
                let sql_b = []
                for (var j = 0; j < k_lists.length; j++) {
                    sql_b.push(db_data[i][parseInt(k_lists[j])]);
                }
                db_sql_new.push(JSON.stringify(sql_b).replace("[", '').replace("]", ""));
            }
            var sql_head = db_sql.split("values")[0];
            db_sql = sql_head + " values" + "(" + db_sql_new.join("),(") + ")";
        } else {
            return callback(errorStack("ElementNotFoundException",
                "没有此选项！"))
        }
        switch (db_type) {
            case "mysql":
                dbMysql.db_others(db_config, db_sql, callback);
                break;
            case "mssql":
                dbMssql.db_others(db_config, db_sql, callback);
                break;
            case "oracle":
                dbOracle.db_others(db_config, db_sql, callback);
                break;
            default:
                callback(errorStack("ElementNotFoundException",
                    "没有此选项！"));
        }
    }
};
module.exports = dbForMenuUtil;