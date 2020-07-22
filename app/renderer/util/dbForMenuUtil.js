const mysql= require('mysql');
const sql=require('mssql');


//关闭oracle数据库连接
function doRelease(connection)
{
    connection.close(
        function(err) {
            if (err)
                console.error(err.message);
        });
}

function test_oracle_connect(db_config) {
    const oracledb = require('oracledb');
    oracledb.getConnection(db_config,
        function(err, connection)
        {
            if (err) {
                console.error(err.message);
                alert("oracle数据库测试连接失败！");
                return;
            }
            alert("oracle数据库测试连接成功！");
            doRelease(connection);
        });
}

function test_mssql_connect(db_config) {
    sql.close();
    sql.connect(db_config,function(err){
        if(err){
            console.error(err.stack);
            alert("mssql数据库测试连接失败！");
            return;
        }
        alert("mssql数据库测试连接成功！");
        sql.close();
    });
}

function test_mysql_connect(db_config) {
    var connection = mysql.createConnection(db_config);

    connection.connect(function(err) {
        if (err) {
            console.error('xu_error connecting: ' + err.stack);
            alert("mysql数据库测试连接失败！");
            return;
        }
        alert("mysql数据库测试连接成功！");
        console.log('数据库测试成功：connected as id ' + connection.threadId);
    });
    connection.end();
}

