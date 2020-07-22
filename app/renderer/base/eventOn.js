$(document).ready(function () {
    //响应变量刷新事件
    myEmitter.on("refreshParameters", (type, targetMateFlowId) => {
        let mid;
        switch (type) {
            case "global":
                mid = $('.main-liucheng-item.main-liucheng-pretreatment').eq(0).attr('id');
                parameterUtils.refreshGlobalParamList();
                parameterUtils.refreshMainFlowOutParam(mid);
                break;
            case "part":
                if (typeof targetMateFlowId != "undefined") {
                    mid = targetMateFlowId.replace('secondList', '');
                    parameterUtils.refreshPartParamList(targetMateFlowId);
                    parameterUtils.refreshMainFlowOutParam(mid);
                };
                break;
            default:
                break;
        };
    });
    //响应单个节点的异常捕获
    myEmitter.on("singleNodeCreateTry", (currentLiId, mateId) => {
        singleTryFlag = true;
        let liId = currentLiId;
        let mId = mateId;
        myEmitter.once("templateCallback", () => {
            $("#coverModal").find("input[name='singleNodeId']").val(currentLiId);
        });
        myEmitter.once("completeCallback", () => {
            $("#" + currentLiId).find(".single-try-start").hide();
            $("#" + currentLiId).find(".single-try-edit").css("display", "block");
        });
        myEmitter.once("nodeComplete", (targetDom) => {
            targetDom.attr("singleid", currentLiId);
        })
        $(".left-menu >li").eq(11).find(">ul").find(">li").eq(1).click();
    });
    myEmitter.on("singleNodeEditTry", (currentLiId, mateId) => {
        singleTryFlag = true;
        let liId = currentLiId;
        let mId = mateId;
        let mainId = mateId.replace("secondList", "");
        $("#try" + mainId)
    });

    //错误事件
    myEmitter.on("hasError", (error, data) => {
        layer.confirm('保存失败', {
            icon: 2,
            title: " ",
            skin: 'layer-ext-clearData',
            btn: ['确认'], //按钮
            yes: function (index) {
                layer.close(index);
            }
        });
    });

    //读取到元流程
    myEmitter.on("loadScriptInMate",(mateId)=>{
        let scrollBox = new MateFlowScrollBox(mateId);
        scrollBox.getMapTree($('#'+mateId).find('>li').not('.segmentation-li'),scrollBox.mapTree,true);
        scrollBoxs[mateId] = scrollBox;
        scrollBoxs[mateId].getAnnotationTop();
        scrollBoxs[mateId].createTreeBranchByHeight();
        
    })

    //开始读取到元流程
    myEmitter.on("loadScriptInMateStart",(mateId)=>{
        
        if(!mateWorkFlows.hasOwnProperty(mateId)){
            mateWorkFlows[mateId] = new MateWorkFlow(mateId)
        }
    })

    //修改注释
    myEmitter.on("updateAannotation",(nodeId,val)=>{
        let ulId = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
        // scrollBoxs[ulId].updateHeightList(nodeId,val);
        myEmitter.emit('scrollAnnotionHide')
    })

    //删除节点
    myEmitter.on("deleteNodeDom",(nodeId)=>{
        let ulId = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
        // if($('#'+nodeId).find('>.node-main-box').find('>.annotation-tit').find('span').text() != ''){

        //     scrollBoxs[ulId].updateHeightList(nodeId,'','delete');
        // }
        myEmitter.emit('scrollAnnotionHide');
        mateWorkFlows[ulId].deleteNode(nodeId);
    })

    //元素拖动
    myEmitter.on("domDragStart",()=>{
        let ulId = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
        // scrollBoxs[ulId].updateHeightList();
        myEmitter.emit('scrollAnnotionHide')
    })

    //元素拖动成功
    myEmitter.on("domDragSuccess",(id,pid)=>{
        if(typeof pid === 'undefined'){
            // pid = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
            console.log("pid is undefined");
            return ;
        }
        let ulId = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
        // scrollBoxs[ulId].updateHeightList();
        mateWorkFlows[ulId].newNode(id,pid);
    })

    //注释滚动条隐藏
    myEmitter.on("scrollAnnotionHide",()=>{
        $('#detail-liucheng-scroll').find('>ul').hide();
        $('#detail-liucheng-scroll').hide();
    })

    //主流程切换
    myEmitter.on("mainLiuchengCut",(mateId)=>{
        myEmitter.emit('scrollAnnotionHide')
        if(!mateWorkFlows.hasOwnProperty(mateId)){
            mateWorkFlows[mateId] = new MateWorkFlow(mateId)
        }
        if(!scrollBoxs.hasOwnProperty(mateId)){
            scrollBoxs[mateId] = new MateFlowScrollBox(mateId)
        }
    })

    //元流程节点切换
    myEmitter.on("mateLiuchengNodeCut",()=>{
        myEmitter.emit('scrollAnnotionHide')
    })

    //点击右侧菜单项
    myEmitter.on("clickRightMenuItem",()=>{
        myEmitter.emit('scrollAnnotionHide')
    })

    //修改或新增节点开始
    myEmitter.on("addNodeStart",(id,pid,ulId)=>{
        if(typeof ulId === 'undefined'){
            ulId = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
        }
        if(typeof pid === 'undefined'){
            // pid = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
            console.log("pid is undefined");
            return
        }
        // let ulId = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
        mateWorkFlows[ulId].newNode(id,pid);
    })

    //修改或新增节点成功
    myEmitter.on("addNodeSuccess",(id,pid,ulId)=>{
        if(typeof ulId === 'undefined'){
            ulId = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
        }
        // let ulId = $('.detail-liucheng-lists-box > .current-show-list').eq(0).attr('id');
        if(typeof pid === 'undefined'){
            console.log("pid is undefined");
            return;
        }
        if(!mateWorkFlows.hasOwnProperty(ulId)){
            mateWorkFlows[ulId] = new MateWorkFlow(ulId)
        }
        mateWorkFlows[ulId].newNode(id,pid);
    })
});
