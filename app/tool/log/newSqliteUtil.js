const Sequelize = require('sequelize');
const path=require('path');

//TODO 重要  设计器与执行器的数据库有些许不同，job_id，设计器为时间戳

//todo 1.循环内部嵌套,如何确定流程位置
//todo 3.变量过大，插入前检查，是否影响性能


const sequelize = new Sequelize('database', 'username', 'password', {
    // host: 'localhost',
    dialect: 'sqlite',
    operatorsAliases: false,
    
    pool: {
        max: 30,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

    // SQLite only
    logging: false,
    storage: path.join(__dirname, './../../../config/rpa_logs_1.db'),
});


const StepInfo=sequelize.define('stepinfo',{
    id:{
        type:Sequelize.INTEGER ,
        primaryKey:true,
        autoIncrement: true
    },
    job_id:{
        type:Sequelize.BIGINT,
        allowNull: false
    },
    step_id:{
        type:Sequelize.BIGINT,
        allowNull:false,
    },
    error_step:{
        type:Sequelize.BIGINT,
        allowNull:true,
    },
    parameter:{
        type:Sequelize.TEXT,
        allowNull:false,
    },
    step_info:{
        type:Sequelize.TEXT
    },
    error_info:{
        type:Sequelize.TEXT
    },
    step_status:{
        type:Sequelize.INTEGER,
        defaultValue: 0
    },//0 异常 1正常
    running_time:{
        type:Sequelize.BIGINT
    }
},{
    timestamps: false
});
const ParameterInfo=sequelize.define('parameterinfo',{
    id:{
        type:Sequelize.INTEGER ,
        primaryKey:true,
        autoIncrement: true
    },
    job_id:{
        type:Sequelize.BIGINT,
        allowNull: false
    },
    step_id:{
        type:Sequelize.BIGINT,
        allowNull:false
    },
    parameter_name:{
        type:Sequelize.STRING,
        allowNull:true
    },
    parameter:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    is_global:{
        type:Sequelize.INTEGER,
        defaultValue: 0
    },
    history:{
        type:Sequelize.BIGINT,
        defaultValue: 0
    }
},{
    timestamps: false
});
const JobHtml=sequelize.define('jobhtml',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    job_id:{
        type:Sequelize.BIGINT,
        allowNull: false,
        unique: true
    },
    job_html:{
        type:Sequelize.TEXT,
        allowNull:true
    }
},{
    timestamps: true
});
const ForInfo=sequelize.define('forinfo',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    job_id:{
        type:Sequelize.BIGINT,
        allowNull: false,
    },
    step_id:{
        type:Sequelize.BIGINT,
        allowNull:false
    },
    run_times:{
        type:Sequelize.INTEGER,
        allowNull:false
    }
},{
    timestamps: false
});
function initSqlite() {
    StepInfo.sync({force: true}).then(() => {
        // Table created
        console.log("stepinfo 表建立");
    });

    ParameterInfo.sync({force: true}).then(() => {
        // Table created
        console.log("ParameterInfo 表建立");
    });

    JobHtml.sync({force: true}).then(() => {
        // Table created
        console.log("jobhtml 表建立");
    });

    ForInfo.sync({force: true}).then(() => {
        // Table created
        console.log("forinfo 表建立");
    });
}
// 初始化，建立数据库表
initSqlite();


module.exports.sequelize = sequelize;
module.exports.StepInfo = StepInfo;
module.exports.ParameterInfo = ParameterInfo;
module.exports.JobHtml = JobHtml;
module.exports.ForInfo = ForInfo;