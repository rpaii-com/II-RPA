// 导入数据
$(function () {
    let mateTestParams;
    let sqliteUtil;
    let isMysql = false;
    let isLic = true;
    let isUseBuffer = sysConfig.isBuffer;
    let bufferJson;
    let daoruTypes = [{ name: '全部', desc: '全部', id: 0 }];
    function getDaoruTypesLi() {
        let thtml = "";
        daoruTypes.forEach((item, index) => {
            thtml += '<li title="' + item.desc + '" index="' + item.id + '" class="li-has-after-close">' + item.name + '<i class="li-close"></i></li>'
        });
        $(".data_import .top-utils .top-input-box ul").html(thtml);
    }
    function initSQL() {
        let sql = 'select * from d_script_type ';
        if (isLocalSQL) {
            clearInterval(sqlIn);
            if ("fail" != isLocalSQL && "licfail" != isLocalSQL) {
                isMysql = true;
                sqliteUtil = important.sqliteUtil;
                let str = "id INTEGER PRIMARY KEY autoincrement,title TEXT,desc TEXT,createTime TEXT,json blob,html blob,parameters blob,import_file blob,group_password blob,semantic blob,import_text_file blob,type_id TEXT";
                let str_tyoe = "id INTEGER PRIMARY KEY autoincrement,name TEXT,desc TEXT";
                sqliteUtil.create("d_script", str)
                sqliteUtil.create("d_script_type", str_tyoe)
                sqliteUtil.selectBySql(sql, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    console.log(data)
                    daoruTypes = daoruTypes.concat(data)
                    getDaoruTypesLi()
                })
            }
            if ("licfail" === isLocalSQL) {
                isLic = false;
            }
        } else {
            if (typeof ctx.get("dataBaseConfig") == "undefined") {
                isMysql = false;
                isLic = false;
            } else {
                isMysql = true;
                isLic = true;
                clearInterval(sqlIn)
                mysqlTemp = remote.getGlobal('important').mysqlUtil;
                mysqlTemp.config(ctx.get("dataBaseConfig"))
                ctx.set("mysqlTemp", mysqlTemp);
                redisUtil.selectAll("d_script_type", { sort: "createTime", }, function (err, data) {
                    if (err) {
                        return;
                    }
                    //console.log(data)
                    daoruTypes = daoruTypes.concat(data)
                    getDaoruTypesLi()
                });
            }
        }
    }
    let sqlIn = setInterval(() => {
        initSQL()
    }, 1000)
    // ctx.set("dataBaseConfig", {
    //     user: "RPA",
    //     host: "192.168.0.201",
    //     port: "3306",
    //     database: "rpa",
    //     password: "123456"
    // })
    initSQL();

    function tableShow(data, length, pageNum) {
        //旧 lowDb 查询
        //   var dataArray = db.find("title");
        var dataArray = data;
        //   console.log(dataArray);
        var options = {
            "id": "page", //显示页码的元素
            "data": dataArray, //显示数据
            "maxshowpageitem": 3, //最多显示的页码个数
            "pagelistcount": 7, //每页显示数据个数
            "callBack": function (result) {
                var date_list = "";
                //   console.log(result)
                for (var i = 0; i < result.length; i++) {
                    date_list += "<tr>";
                    date_list += "<td name='title' _id='" + result[i].id + "'>" + result[i].title + "</td>";
                    date_list += "<td name='desc'>" + result[i].desc + "</td>";
                    date_list += "<td>" + new Date(result[i].createTime).format("yyyy-MM-dd HH:mm:ss") + "</td>";
                    date_list += "<td><span class='changImport'>选择</span><span class='shanchu'>删除</span></td>";
                    date_list += "</tr>";

                }

                // $("#demoContent").html(cHtml);//将数据增加到页面中
                $('.data_import_table tbody').html(date_list)
                loadingBox.end();
            },
            'setNowPage': function (page, num, type, callback) {
                let sql;
                if (type) {
                    sql = 'select * from d_script s left join d_script_type t on s.type_id=t.id where t.name="' + type + '" order by create_time limit ' + ((page - 1) * num) + ',' + num + '';
                } else {
                    sql = 'select * from d_script  order by create_time limit ' + ((page - 1) * num) + ',' + num + '';
                }
                if (isLocalSQL) {
                    if (type) {
                        sql = 'select * from d_script s left join d_script_type t on s.typeId=t.id where t.name="' + type + '" order by creatTime limit ' + ((page - 1) * num) + ',' + num + '';
                    } else {
                        sql = 'select * from d_script  order by createTime limit ' + ((page - 1) * num) + ',' + num + '';
                    }
                    sqliteUtil.selectBySql(sql, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        callback(data);
                    })
                } else {
                    let config = {};
                    if (type === "全部" || typeof type === "undefined") config = { sort: "createTime" }
                    else {
                        config = {
                            sort: "createTime", filter: { key: "typeName", value: type }
                        }
                    }
                    redisUtil.selectAll("d_script_info", config, function (err, data) {
                        if (err) {
                            showTableFailCallBack()
                            console.log(err)
                            return;
                        }
                        //console.log(data, config);
                        callback(data.splice((page - 1) * num, num));
                    })
                }
            },
            'searchFun': function (nowPage, type, num, callback) {
                if (!type) {
                    //console.log(type)
                    // showTable(1, num, true);
                    showTable({ pageNum: 1, num: num, isSearch: true });
                } else {
                    let sql = 'select * from d_script s left join d_script_type t on s.type_id=t.id where t.name="' + type + '"  order by create_time limit ' + ((nowPage - 1) * num) + ',' + num + '';
                    if (isLocalSQL) {
                        sqliteUtil.selectBySql('select count(1) num from d_script s left join d_script_type t on s.type_id=t.id where t.name="' + type + '"', function (err, data) {
                            let count = data[0].num;
                            sqliteUtil.selectBySql(sql, function (err, data) {
                                if (err) {
                                    throw err;
                                }
                                callback(data, count);
                            })
                        })
                    } else {
                        let config = {};
                        if (type === "全部" || typeof type === "undefined") config = { sort: "createTime" }
                        else {
                            config = {
                                sort: "createTime", filter: { key: "typeName", value: type }
                            }
                        }
                        redisUtil.selectAll("d_script_info", config, function (err, data) {
                            if (err) {
                                console.log(err)
                                showTableFailCallBack();
                                return;
                            }
                            let length = data.length;
                            callback(data.splice((nowPage - 1) * num, num), length);
                        })
                    }
                }
            }
        };
        page.init(length, pageNum, options);
    }

    function showTableFailCallBack() {
        loadingBox.end();
    }
    //关闭类型
    $(".top-input-box").on("click", ".li-close", function () {
        let that = this;
        // let thattitle = $(this).parents("li").eq(0).attr("title");
        let id = $(this).parents("li").eq(0).attr("index");
        let name = $(this).parents("li").text();
        function success() {
            daoruTypes.forEach((item, index) => {
                if (item.name == name) {
                    daoruTypes.splice(index, 1);
                }
            });
            getDaoruTypesLi();
        }

        layer.confirm('是否删除类型？', {
            icon: 2,
            title: " ",
            skin: 'layer-ext-clearData',
            btn: ['是', '否'], //按钮
            yes: function (index) {
                layer.close(index);
                let sql = "DELETE FROM d_script_type where id='" + id + "' ";
                if (isLocalSQL) {
                    sqliteUtil.selectBySql(sql, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        if (data) {
                            layer.msg('删除成功', { icon: 1, title: " ", time: 500, skin: "layer-ext-dotips" });
                            success()
                        } else {
                            layer.msg('删除失败', { icon: 2, title: " ", time: 500, skin: "layer-ext-dotips" });
                        }

                    })
                } else {
                    console.log($(that).parent().text());
                    redisUtil.removeOne("d_script_type", $(that).parent().text(), function (err, data) {
                        if (err) {
                            layer.msg(err.message || '删除失败', { icon: 2, title: " ", time: 500, skin: "layer-ext-dotips" });
                            return;
                        }
                        console.log(data)
                        layer.msg('删除成功', { icon: 1, title: " ", time: 500, skin: "layer-ext-dotips" });
                        success()

                    })
                    // new Promise(function (resolve, reject) {
                    //     mysqlTemp.queryForJsonAsync(sql, resolve);
                    // }).then(function (result, error) {
                    //     if (result) {
                    //         layer.msg('删除成功', { icon: 1, title: " ", time: 500, skin: "layer-ext-dotips" });
                    //         success()
                    //     } else {
                    //         layer.msg('删除失败', { icon: 2, title: " ", time: 500, skin: "layer-ext-dotips" });
                    //     }

                    // }).catch(function (err) {
                    //     console.log(err);
                    // });
                }
                // $(".liucheng-list").html("");

            },
            no: function () {
                layer.close(index);
            }
        });
        return false;
    })
    $(".add-type-box").on("click", ".btn-left", function () {
        if ($(".add-type-box").find(".cover-box-main").find("input[name='type']").value == "" || $(".add-type-box").find(".cover-box-main").find("input[name='typeDec']") == "") {
            return;
        }
        let info = {}
        info.name = $(".add-type-box").find(".cover-box-main").find("input[name='type']").val();
        info.desc = $(".add-type-box").find(".cover-box-main").find("input[name='dec']").val();
        if (isLocalSQL) {
            sqliteUtil.selectBySql('select count(1) num from d_script_type where name="' + info.name + '"', function (err, data) {
                if (err) {
                    return;
                }
                let count = data[0].num;
                if (count > 0) {
                    layer.msg('重复类型，请重新输入！', { icon: 2, title: " ", skin: "layer-ext-dotips" });
                } else {
                    sqliteUtil.insert('d_script_type', info, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        success()
                        layer.msg('保存成功', { icon: 1, title: " ", skin: "layer-ext-dotips" });
                    });
                }
            })
        } else {
            redisUtil.selectOne("d_script_type", info.name, function (err, data) {
                if (err) {
                    layer.msg('插入失败', { icon: 2, title: " ", skin: "layer-ext-dotips" });
                    return;
                }
                if (data != null) {
                    layer.msg('重复类型，请重新输入！', { icon: 2, title: " ", skin: "layer-ext-dotips" });
                    return;
                }
                redisUtil.setAndUpdate("d_script_type", info.name, JSON.stringify(info), function (err, data) {
                    if (err) {
                        layer.msg(err.msg || '保存失败', { icon: 2, title: " ", time: 500, skin: "layer-ext-dotips" });
                        return;
                    }
                    layer.msg('保存成功', { icon: 1, title: " ", time: 500, skin: "layer-ext-dotips" });
                    redisUtil.selectAll("d_script_type", function (err, data) {
                        if (err) {
                            layer.msg(err.msg || '保存失败', { icon: 2, title: " ", time: 500, skin: "layer-ext-dotips" });
                            return;
                        }
                        daoruTypes = [{ name: '全部', desc: '全部' }];
                        data.forEach((item, index) => {
                            let obj = {};
                            obj.id = index;
                            obj.name = item.name;
                            obj.desc = item.desc;
                            daoruTypes.push(obj)
                        });
                        success()
                        $('.data_io').hide();
                    })
                })
            })
        }
        let that = this;
        function success() {
            $(".add-type-box").find(".cover-box-main").find("input[name='type']").val("");
            $(".add-type-box").find(".cover-box-main").find("input[name='dec']").val("")
            $(that).parents(".cover-alert").eq(0).parent().hide();
            $(".data_import .top-utils .top-input-box ul").empty();
            // daoruTypes.push(info);
            // util.httpPost.post("/script/findScriptType", function (err, data) {
            //     if (err) {
            //         console.error(err, data);
            //         callback(errorStack("WEBException", err));
            //         return;
            //     }
            //     ctx.set(step.parameters.rename, JSON.parse(data));
            //     callback();
            // })
            getDaoruTypesLi();
        }
    })

    function showTable(pageNum = 1, num = 7, isSearch, callBack = showTableFailCallBack) {
        if ($("#select_type").val() !== "全部" && !isSearch) {
            return page.searchGo($("#select_type").val());
        }
        let sql = 'select * from d_script  order by create_time limit ' + ((pageNum - 1) * num) + ',' + num + '';
        if (isLocalSQL) {
            let sql = 'select * from d_script  order by createTime limit ' + ((pageNum - 1) * num) + ',' + num + '';
            sqliteUtil.selectBySql('select count(1) num from d_script', function (err, data) {
                let count = data[0].num;
                sqliteUtil.selectBySql(sql, function (err, data) {
                    // loadingBox.end();
                    if (err) {
                        throw err;
                    }
                    tableShow(data, count, pageNum);
                })
            })
        } else {
            redisUtil.selectAll("d_script_info", {
                sort: "createTime"
            }, function (err, data) {
                if (err) {
                    console.log(err)
                    showTableFailCallBack();
                    return;
                }
                let length = data.length;
                tableShow(data.splice((pageNum - 1) * num, num), length, pageNum);
            })
            // new Promise(function (resolve, reject) {
            //     mysqlTemp.queryForJsonAsync('select count(1) num from d_script', resolve);
            // }).then(function (data, error) {
            //     let count = data[0].num;
            //     new Promise(function (resolve, reject) {
            //         mysqlTemp.queryForJsonAsync(sql, resolve);
            //     }).then(function (data, error) {
            //         // loadingBox.end();
            //         tableShow(data, count, pageNum);
            //     }).catch(function (err) {
            //         if (typeof callBack == 'function') {
            //             callBack()
            //         }
            //         // loadingBox.end();
            //         console.log(err);
            //     });
            // }).catch(function (err) {
            //     // loadingBox.end();
            //     if (typeof callBack == 'function') {
            //         callBack()
            //     }
            //     console.log(err);
            // });

        }

    };
    //流程功能按钮样式
    $(".utils-list li").on("click", function () {
        // $(this).siblings().removeClass("selected");
        // $(this).addClass("selected");
    });

    // //调试
    // $(".debuger_start").on('click', function () {
    //     let json = [];
    //     doGetWorkflow(json);
    //     ipc.send('debugger_init', json);

    // });
    //调试按钮
    $(".main-liucheng-util-debugger").on("click", function () {
        $(".main-liucheng-list >ul").find("li").eq(0).click();
        let json = [];
        loadingBox.start();
        loadingBox.setMsg("编译任务中");
        $(".logo-tit-box .status-an").show();
        if (isUseBuffer && typeof bufferJson != "undefined" && bufferJson != "") {
            json = bufferJson;
        } else {
            doGetWorkflow(json);
        }
        ipc.send('debugger_init', { scriptInfo: nowData, json: json });
    });
    //清空
    $(".clean_data").on('click', function () {
        layer.confirm('是否清空流程图？', {
            icon: 2,
            title: " ",
            skin: 'layer-ext-clearData',
            btn: ['是', '否'], //按钮
            yes: function (index) {
                layer.close(index);
                $(".liucheng-list").html("");
                nowData = {
                    id: "",
                    title: "",
                    desc: ""
                };
            },
            no: function () { }
        });
    });
    //主流程清空按钮
    $(".main-liucheng-util-clean").on("click", function () {
        if (false) {
            alert("请先清空子流程");
        } else {
            layer.confirm('是否清空流程图？', {
                icon: 2,
                title: " ",
                skin: 'layer-ext-clearData',
                btn: ['是', '否'], //按钮
                yes: function (index) {
                    layer.close(index);
                    $(".liucheng-list").html("");
                    nowData = {
                        id: "",
                        title: "",
                        desc: ""
                    };
                    $(".main-liucheng-box>ul").empty();
                    let tempGlobal = [];
                    $(".detail-liucheng-lists-box").empty();
                    domUtils.createInitDom();
                    ctx.set("detailPretreatmentList", tempGlobal);
                    $(".description-action .this_tree>il").empty();
                    $(".main-liucheng-item.main-liucheng-pretreatment").eq(0).click();
                    myEmitter.emit("refreshParameters", "global");
                },
                no: function () { }
            });
        }
    });

    //元流程清空按钮
    $(".detail-liucheng-util-clean").on("click", function () {
        let detailPretreatmentList = typeof ctx.get("detailPretreatmentList") != "undefined" ? ctx.get("detailPretreatmentList") : [];
        let isReturn = false;
        layer.confirm('是否清空该元流程？', {
            icon: 2,
            title: " ",
            skin: 'layer-ext-clearData',
            btn: ['是', '否'], //按钮
            yes: function (index) {
                layer.close(index);
                $(".detail-liucheng-lists-box .liucheng-list.current-show-list").eq(0).empty();
                let currentId = $(".detail-liucheng-lists-box .liucheng-list.current-show-list").eq(0).attr("id");
                let isGlobalList = $(".detail-liucheng-lists-box .liucheng-list.current-show-list").hasClass("detail-liucheng-pretreatment") ? true : false;
                if (isGlobalList) {
                    ctx.set("detailPretreatmentList", []);
                    myEmitter.emit("refreshParameters", "global");
                } else {
                    ctx.set(currentId, []);
                    detailPretreatmentList.forEach((item, index) => {
                        if (item.parentMateFlowId == currentId) {
                            detailPretreatmentList.splice(index, 1);
                            isReturn = true;
                        }
                    });
                    if (isReturn) {
                        ctx.set("detailPretreatmentList", detailPretreatmentList);
                        myEmitter.emit("refreshParameters", "global");
                    }
                    myEmitter.emit("refreshParameters", "part", currentId);
                }
            },
            no: function () { }
        });
    });

    //显示注释信息
    $(".detail-liucheng-util-scroll-annotation").on("click", function (e) {
        e.stopPropagation();
        if ($(".detail-liucheng-lists-box .current-show-list").length > 1) {
            console.error("显示元流程数量有误！")
        }
        let currentListId = $(".detail-liucheng-lists-box .current-show-list").eq(0).attr("id");
        let currentId = currentListId.replace("secondList", "scrollList");
        $("#detail-liucheng-scroll").toggle();
        $(".detail-liucheng-scroll > ul").hide();
        // $(".detail-liucheng-scroll").hide();
        // $(".detail-liucheng-scroll").show();
        $("#detail-liucheng-scroll").find("#" + currentId).show();
        scrollBoxs[currentListId].initStart();
    })

    //元流程单元测试
    $(".detail-liucheng-util-matetest").on("click", function () {
        let json = [];
        let targetMateId = $(".detail-liucheng-lists-box .current-show-list").eq(0).attr("id");
        workflowUtils.getMateTest(targetMateId, json);
        mateTestParams = json;
        if (json[0].undefinedInParams.length > 0) {
            // $(".mate-test-in").show();
            let tempHtml = "";
            json[0].undefinedInParams.forEach((item, index) => {
                tempHtml += "<div class='input-box'><label title=" + item + ">" + item + "</label><input type='text' name=" + item + "></div>";
            });
            $(".mate-test-in .stipulation-list").html(tempHtml);
            layer.open({
                type: 1,
                title: false,
                closeBtn: 1,
                shadeClose: false,
                area: ['400px'],
                skin: 'layer-ext-mate-modal',
                content: $("#mate_test_in .cover-alert").html(),
                btn: ['确认', '关闭'],
                btnAlign: 'c',
                yes: function (index, layero) {
                    let flag = true;
                    mateTestParams[0].params = [];
                    $(layero[0]).find(".input-box").find("input").each(function (index, item) {
                        if ($(this).val() == "") {
                            flag = false;
                        }
                    });
                    if (!flag) {
                        return;
                    }
                    let tempArr = $(layero[0]).find("form").serializeArray();
                    mateTestParams[0].undefinedInParams.forEach((item, index) => {
                        tempArr.forEach((ele, i) => {
                            if (item == ele.name) {
                                let obj = {};
                                obj.name = item;
                                obj.value = ele.value;
                                mateTestParams[0].params.push(obj)
                            }
                        })
                    });
                    $(".mate-test-in .stipulation-list").empty();
                    // $(".mate-test-in").hide();
                    ipc.send('debugger_init', mateTestParams);
                    layer.close(index);
                },
                no: function (index) {
                    $(".mate-test-in .stipulation-list").empty();
                    layer.close(index);
                }
            });
        } else {
            ipc.send('debugger_init', json);
        }
    });
    //元流程变量定义 确定
    $(".mate-test-in .cover-box-foot .btn-left").on("click", function () {
        let flag = true;
        mateTestParams[0].params = [];
        $(".mate-test-in .input-box input").each(function (index, item) {
            if ($(this).val() == "") {
                flag = false;
            }
        });
        if (!flag) {
            return;
        }
        let tempArr = $(".mate-test-in form").serializeArray();
        mateTestParams[0].undefinedInParams.forEach((item, index) => {
            tempArr.forEach((ele, i) => {
                if (item == ele.name) {
                    let obj = {};
                    obj.name = item;
                    obj.value = ele.value;
                    mateTestParams[0].params.push(obj)
                }
            })
        });
        $(".mate-test-in .stipulation-list").empty();
        $(".mate-test-in").hide();
        ipc.send('debugger_init', mateTestParams);
    });
    //附件导入
    //页面上写了
    //附件导出
    $(".info-export").on("click", function () {
            $(".export-info").show();
            $(".export-info .cover-alert").css("height", "auto")
            $(".export-info .cover-alert").show();
    })
    // 关闭
    $('.export-info .cover-box-foot .btns-box .btn-right').click(function (event) {
        $(".export-info .cover-alert").hide();
        $('.export-info').hide();

    });
    $('.export-info .cover-close-icon').click(function (event) {
        $(".export-info .cover-alert").hide();
        $('.export-info').hide();
    });
    $('.export-info .cover-box-foot .btns-box .btn-left').click(function (event) {
            loadingBox.start();
            loadingBox.setMsg("正在导出");
            let path = $("#export_info_dir_show").val()
            let title = $(".export-info [name='title']").val()
            let desc = ""
            let type = $(".export-info [name='type']").val()
            fs.writeFile(path + '/' + title + "-" + type + ".rpa", JSON.stringify(getSaveDBData(false, false, title, desc).all), function (err) {
                loadingBox.end();
                if (err) {
                    layer.alert('导出失败', {
                        icon: 2,
                        title: ' ',
                        skin: 'layer-ext-importData',
                    });
                } else {
                    layer.alert('导出成功', {
                        icon: 1,
                        title: ' ',
                        skin: 'layer-ext-importData',
                    });
                    $(".export-info .cover-alert").hide();
                    $('.export-info').hide();
                }

            })
    })
    window["theAttachmentImport"] = function (path) {
            function readText(pathname) {
                var bin = fs.readFileSync(pathname);

                if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
                    bin = bin.slice(3);
                }
                let data = bin.toString('utf-8');
                if (data.includes("�")) {
                    return iconv.decode(bin, 'gbk');
                } else {
                    return data;
                }
            }
            if (path.substring(path.lastIndexOf('.') + 1, path.length) == "rpa") {
                layer.confirm('是否导入' + path.substring((path.lastIndexOf('\\') > -1 ? path.lastIndexOf('\\') : path.lastIndexOf('/')) + 1, path.length) + '？', {
                    icon: 3,
                    title: ' ',
                    skin: 'layer-ext-importData',
                    btn: ['是', '否'], //按钮
                    yes: function (index) {
                        layer.close(index);
                        loadingBox.start();
                        loadingBox.setMsg("导入数据中");
                        let data = readText(path);
                        data = JSON.parse(data);
                        doUnLockWorkflow(data, false);
                        setTimeout(function () {
                            $('.detail-liucheng-lists-box .liucheng-list').dad({
                                draggable: '.menu-icon'
                            });
                            addEndNode();
                        }, 0);
                    },
                    no: function () { }
                });
            } else {
                layer.alert('文件类型错误', {
                    icon: 2,
                    title: ' ',
                    skin: 'layer-ext-importData',
                });
            }
    }
    $(function () {
        var holder = document.querySelector('body');
        holder.ondragover = function (e) {
            return false;
        };
        holder.ondragleave = holder.ondragend = function (e) {
            return false;
        };
        holder.ondrop = function (e) {
            e.preventDefault();
            var file = e.dataTransfer.files[0];
            if (file.path.substring(file.path.lastIndexOf('.') + 1, file.path.length) == "rpa") {
                theAttachmentImport(file.path)
            }
            // if
            return false;
        };
    })
    //元流程变量定义 取消
    $(".mate-test-in .cover-box-foot .btn-right").on("click", function () {
        $(".mate-test-in").hide();
    });
    //如果就旧流程没有结束节点，则加上结束节点
    function addEndNode() {
        if ($(".main-liucheng-box .main-liucheng-list").find("li.main-liucheng-finally").length < 1) {
            (function () {
                let temp = new Date().getTime();
                let endMateId = "secondList" + temp;
                let endTryId = "try" + temp;
                let mHtml = '<li class="main-liucheng-item main-liucheng-finally" itemtype="finally" id="' + temp + '">';
                mHtml += '<i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title">结束节点</span>';
                mHtml += '<div class="parameter-botton"><label>出参：</label></div></li>';
                let uHtml = '<ul class="liucheng-list detail-liucheng-finally current-show-list" id="' + endMateId + '"></ul>';
                let tHtml = '<div id="' + endTryId + '" class="abnormity" style="display: none;"></div>';
                $(".main-liucheng-box .main-liucheng-list").append(mHtml);
                $(".detail-liucheng-lists-box").append(uHtml);
                $(".detail-liucheng-lists-box").append(tHtml);
                ctx.set(endMateId, []);
            })()
        }
    }
    // 删除数据库可选流程项
    $('.data_import_table tbody').on("click", ".shanchu", function (event) {
        let $this = $(event.target).parents("tr:eq(0)")
        layer.confirm('是否删除' + $this.find("[name='title']").html() + '？', {
            icon: 2,
            extend: 'dataDel/style.css',
            skin: 'layer-ext-dataDel',
            title: ' ',
            btn: ['是', '否'], //按钮
            yes: function (index) {
                layer.close(index);
                let sql = "DELETE FROM d_script where id='" + $this.find("[name='title']").attr("_id") + "' ";
                if (isLocalSQL) {
                    sqliteUtil.selectBySql(sql, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        if (data) {
                            layer.msg('删除成功', { icon: 1, title: " ", time: 500, skin: "layer-ext-dotips" });
                            showTable(page.nowPage);
                        } else {
                            layer.msg('删除失败', { icon: 2, title: " ", time: 500, skin: "layer-ext-dotips" });
                        }

                    })
                } else {
                    redisUtil.removeOne("d_script:" + $this.find("[name='title']").attr("_id"), function (err, data) {
                        if (err) {
                            console.log(err, data)

                            layer.msg(err.msg || '删除失败', { icon: 2, title: " ", time: 500, skin: "layer-ext-dotips" });
                            return;
                        }
                        redisUtil.removeOne("d_script_info", $this.find("[name='title']").attr("_id"), function (err, data) {
                            console.log(err, data)
                            layer.msg('删除成功', { icon: 1, title: " ", time: 500, skin: "layer-ext-dotips" });
                            showTable(page.nowPage);
                        })

                    })
                }

            },
            no: function () { }
        });
    });
    // 关闭导入数据
    $('.data_import .cover-box-foot .btns-box .btn-mid').click(function (event) {
        $('.data_import').hide();
        // $('.data_import').css("background", "transparent");
        // $(".data_import .cover-alert").fadeOut(300, function () {
        //     $('.data_import').hide();
        // });
    });
    $('.data_import .cover-close-icon').click(function (event) {
        $('.data_import').hide();
        // $('.data_import').css("background", "transparent");
        // $(".data_import .cover-alert").fadeOut(300, function () {
        //     $('.data_import').hide();
        // });
    });
    //保存流程图
    // 关闭
    $('.data_io .cover-box-foot .btns-box .btn-right').click(function (event) {
        // $('.data_io').css("background", "transparent");
        // $(".data_io .cover-alert").fadeOut(300, function () {
        //     $('.data_io').hide();
        // });
        $(".data_io .cover-alert").hide();
        $('.data_io').hide();

    });
    $('.data_io .cover-close-icon').click(function (event) {
        // $('.data_io').css("background", "transparent");
        // $(".data_io .cover-alert").fadeOut(300, function () {
        //     $('.data_io').hide();
        // });
        $(".data_io .cover-alert").hide();
        $('.data_io').hide();
    });
    //debug继续
    $(".main-liucheng-util-continue").click(function (event) {
        console.log(1)
        let json = { type: "debugStop", context: "" }
        console.log(json)
        ipc.send('actionInterchange', json)
        console.log(3)


    });
    //debug下一步
    $(".main-liucheng-util-next").click(function (event) {
        console.log(2)
        let json = { type: "debugNext", context: "" }
        console.log(json)
        ipc.send('actionInterchange', json)
        console.log(4)

    });
    /**********添加注释功能    开始  **********/
    //给选中节点添加注释
    $(".detail-liucheng-util-annotation").on("click", function () {
        $(".annotation-box").show();
        if ($(".liucheng-item-selected").length > 0 && $(".liucheng-item-selected")[0].localName == "li") {
            var domSelect = $(".liucheng-item-selected");
            $(".has-no-current-item").hide();
            $(".annotation-box").find("form").show();
            $(".annotation-box").find("input.annotation-input").val(domSelect.find(">div.node-main-box").find(">.annotation-tit").find("span").text());
            setTimeout(function () {
                if (!domSelect.hasClass("liucheng-item-selected")) {
                    domSelect.addClass("liucheng-item-selected");
                }
            }, 0)
        } else {
            $(".annotation-box").find("form").hide();
            $(".has-no-current-item").show();
        }
    });
    //元流程缩略
    $(".detail-liucheng-util-breviary").on("click", function () {
        let dom = $(".detail-liucheng-lists-box .current-show-list").eq(0);
        if (dom.hasClass("breviary-list")) {
            dom.removeClass("breviary-list")
        } else {
            dom.addClass("breviary-list");
        }
    })
    //关闭添加注释框
    $(".annotation-box .cover-close-icon").on("click", function () {
        $(".annotation-box").hide()
    });
    //确定添加注释
    $(".annotation-box .btns-box a.btn-start").eq(0).on("click", function () {
        let val = $(".annotation-box .annotation-input").val();
        let id = $(".liucheng-item-selected").eq(0).attr("id");
        $(".annotation-box").hide();
        $(".liucheng-item-selected").eq(0).attr("annotation", val);
        $(".annotation-box .annotation-input").val("");
        $(".liucheng-item-selected >.node-main-box >.annotation-tit span").eq(0).text(val);
        $(".liucheng-item-selected").eq(0).find(">.node-main-box>.liucheng-utils").find(".liucheng-icon-delete").addClass("liucheng-icon-delete-gold");
        if (val != '') {

            // myEmitter.emit('updateAannotation',id,domUtils.getTargetParentsList(id),domUtils.getPrevNodeId(id));
            myEmitter.emit('updateAannotation', id, val);
        }
    });
    //取消添加注释
    $(".annotation-box .btns-box a.btn-cancel").eq(0).on("click", function () {
        $(".annotation-box .annotation-input").val("");
        $(".annotation-box").hide();
    });
})