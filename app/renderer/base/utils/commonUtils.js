let commonUtils = {
    /**
     * 对象深拷贝
     * @param destination 拷贝后的对象
     * @param source 被拷贝对象
     * @returns void
     */
    deepClone: function (destination, source) {
        // let self = this;
        // console.log(self);
        for (let p in source) {
            if (source.hasOwnProperty(p)) {
                if (commonUtils.getType(source[p]) == "array" || commonUtils.getType(source[p]) == "object") {
                    destination[p] = commonUtils.getType(source[p]) == "array" ? [] : {};
                    arguments.callee(destination[p], source[p]);
                } else {
                    destination[p] = source[p];
                }
            }
        }
    },
    /**
     * 对象深拷贝，返回复制对象
     * @param source 被复制对象
     * @returns {}复制对象
     */
    getDeepCloneObj: function (source) {
        let newObj;
        let self = this;
        if (source instanceof Array) {
            newObj = [];
        } else if (source instanceof Object) {
            newObj = {};
        }
        for (let p in source) {
            if (source.hasOwnProperty(p)) {

                if (commonUtils.getType(source[p]) == "array" || commonUtils.getType(source[p]) == "object") {

                    newObj[p] = commonUtils.getType(source[p]) == "array" ? [] : {};
                    arguments.callee(source[p]);
                } else {

                    newObj[p] = source[p];
                }
            }
        }
        return newObj;
    },
    getType: function (o) {
        let _t;
        return ((_t = typeof (o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
    },
    /**
     * 获取当前的元流程id
     * @returns string:id
     */
    getCurrentMateId: function () {
        let id = $(".liucheng-list.current-show-list").eq(0).attr("id").replace("secondList", "");
        return id;
    },
    /**
     * 获取全局信息
     */
    getGlobalInfo:function(){
        let mainInfo = ctx.get('detailPretreatmentList');
        return mainInfo;
    },
    /**
     * 获取当前显示的ul 元流程或者是异常流程id
     */
    getTargetFlowID:function(){
        let isTryCatch = false;
        let targetId;
        let tryId = null;
        if ($('.abnormity-node.active').length > 0) {
            let tID = [];
            $('.abnormity-node.active').each((index, item) => {
                tID.push($(item).parents('.abnormity').eq(0).attr('id').replace('try', ''))
            })
            let pID;
            if ($('.liucheng-list.current-show-list').length > 0) {
                pID = $('.liucheng-list.current-show-list').eq(0).attr('id').replace('secondList', '');
            }
            tID.forEach((el, index) => {
                if (el == pID) {
                    targetId = el;
                    isTryCatch = true;
                    tryId = $('#try'+el).find('.abnormity-node.active').find('>.liucheng-list').attr('id');
                }
            })
        };
        return {
            mainId:targetId,
            isTryCatch:isTryCatch,
            tryId:tryId
        }
    }
    /**
     * 获取目标前一个元素
     */
};
