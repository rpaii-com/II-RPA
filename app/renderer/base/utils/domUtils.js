let domUtils = {
    //创建初始化主流程dom
    createInitDom: function () {
        let tempDate = new Date().getTime();
        // let html = "";
        this.createPreDom(tempDate);
        this.createEndDom(tempDate);
    },
    //创建预处理节点
    createPreDom: function (time) {
        let html = '<li class="main-liucheng-item main-liucheng-pretreatment" itemtype="pretreatment" id="' + time + '">';
        html += '<i class="icon-main-liucheng-item icon-main-item-ywk"></i>';
        html += '<span class="title">预处理</span>';
        html += '<div class="parameter-botton"><label>出参：</label></div>';
        html += '</li>';
        let ulHtml = '<ul class="liucheng-list current-show-list detail-liucheng-pretreatment" id="secondList' + time + '"></ul>';
        $(".main-liucheng-box .main-liucheng-list").append(html);
        $(".detail-liucheng-lists-box").append(ulHtml);
        ctx.set(time, { type: "pretreatment", parameters: [{ name: "pretreatmentName", value: "预处理" }] })
    },
    //创建结束节点
    createEndDom: function (time) {
        time = time + 1;
        let html = '<li class="main-liucheng-item main-liucheng-finally" itemtype="finally" id="' + time + '">';
        html += '<i class="icon-main-liucheng-item icon-main-item-ywk"></i>';
        html += '<span class="title">结束节点</span>';
        html += '<div class="parameter-botton"><label>出参：</label></div>';
        html += '</li>';
        let ulHtml = '<ul class="liucheng-list detail-liucheng-finally" id="secondList' + time + '"></ul>';
        let tryHtml = '<div id="try' + time + '" class="abnormity"></div>';
        $(".main-liucheng-box .main-liucheng-list").append(html);
        $(".detail-liucheng-lists-box").append(ulHtml);
        $(".detail-liucheng-lists-box").append(tryHtml);
        ctx.set(time, { type: "finally", parameters: [{ name: "finallyName", value: "结束节点" }] })
        // return html;
    },
    //绑定操作任意其他区域，dom处理
    /**
     * @param eventList 事件名称或数组string or array
     * @param dom 目标节点
     * @param targetArea 目标区域，默认为document
     * @returns void
     */
    bindExcludeEvent: function (eventList, dom, targetArea) {
        let isEventArray = false;
        dom = $(dom);
        if (typeof targetArea == "undefined") {
            targetArea = document.body;
        }
        targetArea = $(targetArea);
        if (eventList instanceof Array) {
            isEventArray = true;
        }
        if (isEventArray) {
            eventList.forEach((item, index) => {
                singleBind(item, dom);
            });
        } else {
            singleBind(eventList, dom);
        }
        function singleBind(eventName, singleDom) {
            let isParants = false;
            targetArea.on(eventName, "*", function (event) {
                // event.stopPropagation();
                $(event.target).parents().map(function (i, ele) {
                    if (ele == singleDom[0]) {
                        isParants = true;
                    }
                })
                if (!isParants) {
                    singleDom.hide();
                }
            })
            dom.on(eventName, function (e) {
                e.stopPropagation();
            })
        }
    },
    /**
     * 计算节点距头部的距离
     * @param id 节点ID
     */
    calcOffset:function(id) {
        let item = $("#" + id);
        let itemParent = item.parent();
        let offsetTop = item[0].offsetTop;
        let offsetLeft = item[0].offsetLeft
        while (!itemParent.hasClass("liucheng-list")) {
            offsetTop += itemParent[0].offsetTop;
            offsetLeft += itemParent[0].offsetLeft;
            itemParent = itemParent.parent();
        }
        return {
            offsetTop: offsetTop,
            offsetLeft: offsetLeft
        };
    },
    /**
     * 计算节点距头部的距离
     * @param id 节点ID
     */
    calcOffsetTop:function(id) {
        let item = $("#" + id);
        let itemParent = item.parent();
        let offsetTop = item[0].offsetTop;
        while (!itemParent.hasClass("liucheng-list")) {
            offsetTop += itemParent[0].offsetTop;
            itemParent = itemParent.parent();
        }
        return offsetTop;
    },
    /**
     * 获取节点的注释，如果没有则返回false
     * @param id 节点id
     */
    getAnnotation:function(id){
        let dom = $('#' + id);
        let t = dom.find('>.node-main-box').find('>.annotation-tit').find('>span').text();
        if (t && t !== '') {
            return t
        } else {
            return false;
        }
    },
    /**
     * 获取目标节点的父级id
     * @param id 节点id
     * @return parentsList 父级节点id 
     */
    getTargetParentsList:function(id){
        let dom = $('#'+id);
        let parentsList = [];
        while(dom.parents('li.separate-icon').length > 0){
            parentsList.push(dom.parents('li.separate-icon').eq(0).attr('id'));
            dom = dom.parents('li.separate-icon').eq(0);
        }
        return parentsList.reverse()
    },
    /**
     * 获取上一个节点的id，没有返回false
     * @param id 节点id
     * @return id|false
     */
    getPrevNodeId:function(id){
        let dom = $('#'+id);
        while(dom.prev('li').hasClass('segmentation-li')){
            dom = dom.prev('li')
        }
        if(dom.prev('li.separate-icon').length > 0){
            return dom.prev('li.separate-icon').attr('id');
        }else {
            return false;
        }
    }
};