class MateWorkFlow {
    constructor(mateId) {
        this.MateId = mateId;
        this[mateId] = {
            id: mateId,
            parent: false,
            parameters: [],
            children: []
        };
        this.isPrement = $('#' + this.MateId).hasClass('detail-liucheng-pretreatment');
        this.isFinally = $('#' + this.MateId).hasClass('detail-liucheng-finally');
    }
    /**
     * 记录新节点信息
     * @param {id,parentId} 节点id,父级节点id 
     */
    newNode(id, parentId) {
        let that = this;
        let info = ctx.get(id);
        let tempObj = {};
        let t;
        tempObj.parent = parentId;
        tempObj.id = parseInt(id);
        tempObj.parameters = [];
        tempObj.children = [];
        tempObj.type = info.type;

        if (info.hasOwnProperty('outParameterName')) {

            switch (info.type) {
                case 'hashfor':
                case 'for':
                case 'excelToObject':
                    info.parameters.forEach(element => {

                        if (element.name.indexOf('rename') > -1) {

                            tempObj.parameters.push(element.value)
                        }
                    });
                    break;
                case 'IDAccountPassword':
                    info.parameters.forEach(element => {

                        if (element.name == 'ID') {

                            t = element.value;
                        }
                    });
                    info.parameters.forEach(element => {

                        if (element.name == 'username') {

                            tempObj.parameters.push("账号-"+t)
                        }
                        if (element.name == 'password') {

                            tempObj.parameters.push("密码-"+t)
                        }
                        if (element.name == 'department') {

                            tempObj.parameters.push("归属地-"+t)
                        }
                        if (element.name == 'attache') {

                            tempObj.parameters.push("部门-"+t)
                        }
                    });
                    break;
                default:
                    if (typeof info.outParameterName !== 'undefined') {

                        tempObj.parameters.push(info.outParameterName)
                    }

                    break;
            }
        }
        that[id] = tempObj;
        if (that.hasOwnProperty(parentId)) {
            if(that[parentId].children.indexOf(tempObj.id) === -1){

                that[parentId].children.push(tempObj.id)
            }
        }
    }

    /** 
     * 获取作用域范围参数
     * @param nodeId 节点id
     * @returns Array
     */
    getParameters(nodeId) {
        let that = this;
        let tempArray = [];
        let tempParant;
        if (!that.hasOwnProperty(nodeId) || nodeId == false) {
            if (nodeId == false || nodeId == "false") {

                that[that.MateId].children.forEach(item => {
                    if(typeof that[item] !== 'undefined'){

                        if (that[item].type === 'hashfor' || that[item].type === 'for' || that[item].type === 'excelToObject' || that[item].type === 'if' || that[item].type === 'backGlobalParam') {
    
                        } else {
    
                            that[item].parameters.forEach(el => {
    
                                tempArray.push({
                                    id: item,
                                    name: el,
                                    come: that.isPrement ? 'global' : 'part'
                                })
                            })
                        }
                    }else {

                        console.error('变量删除可能异常',item,that[item]);
                    }


                });
            } else {

                console.error('获取可选参数异常：节点为加入对象map', that, nodeId)
            }
        } else {

            that[nodeId].parameters.forEach((item) => {
                tempArray.push({
                    id: nodeId,
                    name: item,
                    come: that.isPrement ? 'global' : 'part'
                })
            });
            tempParant = that[nodeId].parent;

            while (tempParant !== false) {

                that[tempParant].parameters.forEach(item => {

                    tempArray.push({
                        id: tempParant,
                        name: item,
                        come: that.isPrement ? 'global' : 'part'
                    })
                });
                that[tempParant].children.forEach(item => {
                    if(typeof that[item] !== 'undefined'){

                        if (that[item].type === 'hashfor' || that[item].type === 'for' || that[item].type === 'excelToObject' || that[item].type === 'if' || that[item].type === 'backGlobalParam') {
    
                        } else {
    
                            that[item].parameters.forEach(el => {
    
                                // tempArray.push(el);
                                tempArray.push({
                                    id: item,
                                    name: el,
                                    come: that.isPrement ? 'global' : 'part'
                                })
                            })
                        }
                    }else {

                        console.error('变量删除可能异常',item,that[item]);
                    }


                });
                tempParant = that[tempParant].parent;
            }
        }
        tempArray = quchongArray(tempArray)
        return tempArray;
    }

    /**
     * 删除节点
     * @param id 节点id
     */
    deleteNode(id) {
        let that = this;

        if (that.hasOwnProperty(that[id].parent)) {
            
            let index = that[that[id].parent].children.indexOf(parseInt(id)) == -1?that[that[id].parent].children.indexOf(id):that[that[id].parent].children.indexOf(parseInt(id));
            if (index > -1) {

                that[that[id].parent].children.splice(index, 1);
            }else {
                console.error('未在改父节点中找到改自节点');
            }
        }else {

            console.error('节点不存在父节点',id,that[id]);
        }

        delete that[id];
    }

    /**
     * 移动元素
     */
    moveNode(id, pid) {
        let that = this;

        if (that.hasOwnProperty(that[id])) {

            console.error('移动节点异常：未在map中找到该节点')
        } else {

            if (that.hasOwnProperty(that[id].parent)) {

                let index = that[that[id].parent].children.indexOf(id);
                if (index > -1) {

                    that[that[id].parent].children.splice(index, 1);
                }
            }
            that[id].parent = pid;
        }
    }

    /**
     * 遍历树结构
     */
    eachTreeById(id,callback){
        let that = this;
        console.log(that[id].id,that[id].parent);
        that[id].children.forEach((item,index)=>{
            that.eachTreeById.call(that,item,callback)
        })
    }
}

function quchongArray(array) {
    let tempArray = [];
    let tArray = [];

    array.forEach(item => {

        if (tArray.indexOf(item.name) === -1) {

            tempArray.push(item)
            tArray.push(item.name)
        }
    })
    return tempArray;
}
// export {MateWorkFlow}
// module.exports = {
//     MateWorkFlow:MateWorkFlow
// }