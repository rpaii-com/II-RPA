//切换开发者工具
myEmitter.on('toggleDevTool', () => {
    remote.getCurrentWebContents().toggleDevTools();
})

//窗口最小化
myEmitter.on('windowMinimize', () => {
    remote.getCurrentWindow().minimize();
});

//流程初始化
myEmitter.on('liuchengInit', (willReashParameters) => {
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
    if (willReashParameters) {

    } else {

    }
})