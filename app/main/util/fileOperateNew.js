const fs = require('fs');
const path = require('path');
const errorStack = require("../important/errorStack");
const archiver = require('archiver');
const decompress = require('decompress');

let fileOperateNew = {
    create_directory: function (data, callback) {
        var directory = data.directory;
        var name = data.name;
        // fs.mkdir(path[, mode], callback)
        fs.mkdir(directory + "/" + name, function (err, folder) {
            if (err) {
                callback(errorStack("FileTypeException", err));
                return;
            } else {
                console.log("创建目录成功！" + folder);
                callback();
            }
        });
    },
    create_file: function (data, callback) {
        var directory = data.directory;
        var name = data.name;
        fs.open(directory + "/" + name, 'w', (err, fd) => {
            if (err) {
                callback(errorStack("FileTypeException", err));
                return;
            } else {
                console.log("创建文件成功！");
                callback();
            }
        });

    },
    move_file: function (data, callback) {
        var file = data.file;
        var directory = data.directory;
        var name = path.basename(file);

        try {
            var readStream = fs.createReadStream(file);
            var writeStream = fs.createWriteStream(directory + "/" + name);
            readStream.pipe(writeStream);
            console.log("复制成功！");
            fs.unlink(file, (err) => {
                if (err) {
                    console.log(err);
                    callback(errorStack("FileTypeException", err));
                } else {
                    console.log(file + " was deleted");
                };
            });
            callback();
        } catch (err) {
            callback(errorStack("FileTypeException", err));
        }

        fs.rename(file, directory + "/" + name, function (err) {
            if (err) {
                callback(errorStack("FileTypeException", err));
                return;
            } else {
                console.log("移动文件成功！");
                callback();
            }
        })

    },
    delete_file: function (data, callback) {
        var file = data.file;
        fs.unlink(file, (err) => {
            if (err) {
                callback(errorStack("FileTypeException", err));
            } else {
                console.log(file + " was deleted");
                callback();
            };

        });
    },
    fs_delete_dir:function (data,callback) {
        let file_dir = data.file;
        fs.rmdir(file_dir, (err) => {
            if (err) {
                callback(errorStack("FileTypeException", err));
            } else {
                console.log(file_dir + " was deleted");
                callback();
            };

        });
    },
    exists_file: function (data, callback) {
        var path_fs = data.path;
        var rename = data.rename;
        fs.access(path_fs, (err) => {
            if (err) {
                callback(null, "false");
            } else {
                //todo ctx不支持boolean型赋值
                console.log('myfile already exists');
                callback(null, "true");
            }
        });
    },
    copy_file: function (data, callback) {
        var file = data.file;
        var directory = data.directory;
        var name = path.basename(file);
        try {
            if (file == (directory + "/" + name)) {
                callback(errorStack("FileTypeException", "你的目录选择错误！"));
                //throw new Error("你的目录选择错误！");
            } else {
                var readStream = fs.createReadStream(file);
                var writeStream = fs.createWriteStream(directory + "/" + name);
                readStream.pipe(writeStream);
                console.log("复制成功！");
                callback();
            }

        } catch (err) {
            callback(errorStack("FileTypeException", err));
            //throw err;
        }
    },
    //保存历史任务，文件别名，查看文件附件
    copy_rename_file: function (file_path, directory, new_name, callback) {
        try {
            var file_ob = path.parse(file_path);

            var readStream = fs.createReadStream(file_path);
            var writeStream = fs.createWriteStream(directory + "/" + new_name + file_ob.ext, { flags: "w+" });
            readStream.pipe(writeStream);
            console.log("复制成功！");
            callback();

        } catch (err) {
            callback(errorStack("FileTypeException", err));
            // throw err;
        }
    },
    rename_file: function (data, callback) {
        var file = data.file;
        var name = data.name;
        var path_fs = path.dirname(file);

        fs.rename(file, path_fs + "/" + name, function (err) {
            if (err) {
                callback(errorStack("FileTypeException", err));
                return;
            } else {
                console.log("重命名文件成功！");
                callback();
            }
        })
    },
    get_all_file: function (data, callback) {
        var directory = data.directory;
        var filetype = data.filetype
        try {
            var data_dir = fs.readdirSync(directory);
            var new_data_dir = [];
            data_dir.forEach(function (item, index) {
                data_dir[index] = directory + "/" + item;
                var item_path = path.parse(data_dir[index]);

                if ((item_path.ext == ("." + filetype)) || filetype == '') {
                    new_data_dir.push(data_dir[index]);
                }
            });
            callback(null, new_data_dir);
        } catch (err) {
            callback(errorStack("FileTypeException", err));
        }
    },
    archiverFile:function (data,callback) {
        let directory=data.directory,
            name=data.name,
            directory_res=data.directory_res,
            res_file=directory_res+"/"+name+".zip",
            output = fs.createWriteStream(res_file),
            zipArchiver = archiver('zip');
        zipArchiver.pipe(output);

        if(directory.indexOf('.')==-1){
            zipArchiver.directory(directory,path.parse(directory).base);
        }else{
            zipArchiver.append(fs.createReadStream(directory),{'name':path.parse(directory).base})
        }

        zipArchiver.finalize();
        callback(null,res_file);
    },
    unarchiverFile:function (data,callback) {
        let directory=data.directory,
            directory_res=data.directory_res;
        decompress(directory, directory_res).then(files => {
            callback();
        });
    }
};
module.exports = fileOperateNew