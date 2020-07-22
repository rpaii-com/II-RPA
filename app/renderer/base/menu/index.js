Vue.component('tree-item', {
    props: ['tree'],
    data() {
        return {
            expanded: false
        };
    },
    created: function () {
        this.expanded = this.tree.isPrev;
    },
    template: `<li  @click.stop="change" :class="{on:expanded}">
            <i class="main-menu-icon menu-icon" v-if="tree.children" :class="tree.className"></i>
            <span :class="{'child-menu-title':!tree.children}" ><i v-if="!tree.children" :class="tree.className"></i><label>{{tree.name}}</label></span>
            <i class="main-menu-icon menu-icon-xiala" v-if="tree.children"></i>
            <transition-group v-if="tree.children" class="child-menu" name="fade" tag="ul"  
            v-bind:css="false"
            v-on:before-enter="beforeEnter"
            v-on:enter="enter"
            v-on:leave="leave">
                <tree-item v-for='(child, index) in tree.children' :data-index="index" v-show="expanded"  :key='child.name' :tree='child'>
                </tree-item>
            </transition-group>
        </li>`,
    methods: {
        beforeEnter: function (el) {
            el.style.opacity = 0
            el.style.height = 0
        },
        enter: function (el, done) {
            var delay = el.dataset.index * (200.0 / $(el).parent().children().length)
            setTimeout(() => {
                $(el).animate({
                    opacity: 1,
                    height: "30px"
                }, "fast", function () {
                    done();
                });
            }, delay);
        },
        leave: function (el, done) {
            console.log((20.0 / $(el).parent().children().length));
            var delay = el.dataset.index * (200.0 / $(el).parent().children().length)
            setTimeout(() => {
                $(el).animate({
                    opacity: 0,
                    height: 0
                }, "fast", function () {
                    done();
                });
            }, delay);
        },
        change: function (el) {
            $(".tool").hide();
            let thisDom;
            let isTryCatch = false;
            isTryCatch = commonUtils.getTargetFlowID().isTryCatch;
            // if($('.liucheng-list.ab_module.active').length>0){
            //     let tID =[];
            //     $('.liucheng-list.ab_module.active').each((index,item)=>{
            //         tID.push($(item).parents('.abnormity').eq(0).attr('id').replace('try',''))
            //     })
            //     let pID;
            //     if($('.liucheng-list.current-show-list').length>0){
            //         pID = $('.liucheng-list.current-show-list').eq(0).attr('id').replace('secondList','');
            //     }
            //     tID.forEach((el,index)=>{
            //         if(el == pID){
            //             isTryCatch = true;
            //         }
            //     })
            // } ;
            if (el.target.localName != "li") {
                thisDom = $(el.target).parents("li").eq(0);
            } else {
                thisDom = $(el.target)
            }

            if (typeof (this.tree.children) == "undefined" || this.tree.children.length == 0) {
                let timeTmp = new Date().getTime();
                let thisParentLiIndex = thisDom.parents(".child-menu").parent("li").index();
                let thisIClassName = thisDom.find("i").eq(0).attr("class");
                let classIndex = thisDom.parents(".child-menu").parent("li").find(">i").attr("class").match(/menu-icon-\d{1,2}/)[0].match(/\d{1,2}/)[0];
                let liuchengItem;
                var thisVal = thisDom.find("span.child-menu-title").text();
                // if (typeof thisVal == "undefined" || thisVal == "") {
                //     debugger;
                // }
                let treeName = this.tree.name;
                let nodeType = this.tree.nodeType;
                let isFrame = '';
                // var thisTipsBox = $(this).find(".liucheng-item-tips").length > 0 ? tipsBoxDemo + $(this).find(".liucheng-item-tips").eq(0).html() + '</div>' : '';
                modal.postion = {
                    top: el.y,
                    left: el.x,
                }
                let openPath;
                if (this.tree.url.includes(":\\")) {
                    openPath = this.tree.url
                } else {
                    openPath = path.join(__dirname, "../pages/template/" + this.tree.url);
                }
                modal.showModal(openPath, this.tree.name, function () {
                    setTimeout(() => {
                        switch (nodeType) {
                            case "koulingxuanze":
                                // newLI();
                                break;
                            case "backGlobalParam":
                                newLI({
                                    onlyPart: true,
                                    isTryCatch:isTryCatch
                                });
                                break;
                            case "try_catch":
                                break;
                            default:
                                newLI({isTryCatch:isTryCatch});
                                // console.timeEnd("getTemplate")
                                break;
                        }
                    }, 0);
                    myEmitter.emit("templateCallback")
                })
                switch (nodeType) {
                    case 'hashfor':
                        isFrame = 'is-frame-area';
                        break;
                    case 'excelToObject':
                        isFrame = 'is-frame-area';
                        break;
                    case 'for':
                        isFrame = 'is-frame-area';
                        break;
                    case "if":
                        isFrame = 'is-frame-area';
                        break;
                }
                modal.$data.addLiuchengItem.uuid = timeTmp;
                modal.$data.addLiuchengItem.thisParentLiIndex = thisParentLiIndex;
                modal.$data.addLiuchengItem.newNodeMainClass = "menu-item-" + classIndex;
                modal.$data.addLiuchengItem.newNodeLeftIconClass = thisIClassName;
                liuchengItem = '<li  id="' + modal.$data.addLiuchengItem.uuid + '" class="' + modal.$data.addLiuchengItem.newNodeMainClass + ' separate-icon dads-children clear ' + isFrame + '">';
                liuchengItem += '<div class="single-try-catch"><div class="single-try-catch-btns"><a class="single-try-start"></a><a class="single-try-edit"></a></div></div>';
                liuchengItem += '<div class="node-main-box"><i class="' + modal.$data.addLiuchengItem.newNodeLeftIconClass + ' menu-icon"></i><span class="title" title="' + thisVal + '">';
                liuchengItem += thisVal;
                liuchengItem += '</span><div class="liucheng-utils clear">';
                switch (treeName) { //等待时间和逻辑流程没有debugger按钮
                    case "全局等待时间":
                        break;
                    case "等待时间":
                        break;
                    case "列表遍历":
                        break;
                    case "迭代循环":
                        break;
                    case "跳出循环":
                        break;
                    case "继续循环":
                        break;
                    case "条件判断":
                        break;
                    case "异常捕获":
                        break;
                    default:
                        liuchengItem += '<i class="debug-flag"></i>';
                        break;
                }
                liuchengItem += '<i class="liucheng-icon-delete"></i>';

                modal.$data.addLiuchengItem.newNodeItem = liuchengItem;

                return false;

            } else {
                this.expanded = !this.expanded
            }
            // console.log(modal);
            myEmitter.emit('clickRightMenuItem')
        }

    }
})
let leftMenu = new Vue({
    el: '#leftMenu',
    data:{
        menu:[]
    },
    created: function () {
        this.menu = ctx.get("menu");
        this.pretreamentItem = this.menu[0];
        this.treeLength = this.menu.length;
    },
    methods: {
        hidePretreament:()=>{
            if(leftMenu.menu.length === leftMenu.treeLength || true){

                leftMenu.menu.shift();
            }
            return leftMenu.menu;
        },
        show:()=>{
            if(leftMenu.menu.length === leftMenu.treeLength){

                leftMenu.menu.unshift(leftMenu.pretreamentItem)
            }
            return leftMenu.menu;
        }
    }
});
// console.log("come from index.js");
//创建可选入参项
function newLI({
    isMain = false,
    onlyPart = false,
    hasout = false,
    isTryCatch = false
} = {}) {
    let comeIndex = $("#coverModal").find(">.cover-alert").attr("comeindex");
    let parametersArray;
    let targetTry;
    let ulId = $(".detail-liucheng-lists-box .current-show-list").eq(0).attr("id");
    if($('#try'+ulId.replace('secondList','')).find('.abnormity-node.active').length>0){
        targetTry = $('#try'+ulId.replace('secondList','')).find('.abnormity-node.active').eq(0).find('>ul').eq(0);
        ulId = targetTry.attr('id');
    }
    //新版参数选择
    if (typeof comeIndex === 'undefined' || !comeIndex || comeIndex == 'false') {
        if ($(".detail-liucheng-lists-box .current-show-list").eq(0).find(".liucheng-item-selected").length > 0) {
            let tDom = $(".detail-liucheng-lists-box .current-show-list").eq(0).find(".liucheng-item-selected").eq(0)
            // if (!tDom.hasClass("separate-icon")) {
            //     comeIndex = tDom.parents("li.separate-icon").eq(0).attr("id");
            // } else {
            //     comeIndex = tDom.eq(0).attr("id");
            // }
            comeIndex = jtxLi(comeIndex,tDom);
        } else {
            comeIndex = false;
        }
    }
    if(isTryCatch){
        comeIndex = jtxLi(comeIndex,targetTry.find(".liucheng-item-selected"));
        parametersArray = getTargetItemCanUseParameters();
    }else {

        parametersArray = getTargetItemCanUseParameters_new(comeIndex, ulId, isMain, onlyPart);
    }
    //新版参数选择结束

    // parametersArray = getTargetItemCanUseParameters(isMain, onlyPart);
    let li = "";
    parametersArray.forEach(e => {
        if (e.come == "global") {
            let name = typeof e.moreName == 'undefined' ? e.name : e.moreName;
            li = li + '<li class="parameter" globalName="' + e.name + '" index="' + e.id + '">' + name + '</li>'
        } else {
            li = li + '<li class="parameter" index="' + e.id + '">' + e.name + '</li>'
        }
    })
    if (hasout) {
        return li;
    } else {
        $(".cover-box .parameters-can-select").html(li);
    }
    function jtxLi(comeIndex,tDom){
        if (!tDom.hasClass("separate-icon")) {
            comeIndex = tDom.parents("li.separate-icon").eq(0).attr("id");
        } else {
            comeIndex = tDom.eq(0).attr("id");
        }
        return comeIndex;
    }
}
//创建口令组可选入参项
function newCmdLI(jsonObj, dom) {
    let liHtml = "<ul class='common-list' style='display:none'>";
    jsonObj.forEach((item, index) => {
        liHtml += "<li class='common-li' index='" + item.id + "'>" + item.system_name + "</li>";
    });
    liHtml += "</ul>"
    dom.after(liHtml);
    dom.next().on("click", "li", function () {
        let text = $(this).text();
        dom.val(text);
        dom.attr("index", $(this).attr("index"));
        dom.parents(".main-con-item").find("input[name='rename']").val(text);
        dom.parents(".main-con-item").find("input[name='groupId']").val($(this).attr("index"));
        $(this).parent().hide();
    })
}
//创建口令选择可选项
function newChooseLI(jsonObj = [], dom) {
    let jsonLen = jsonObj.length;
    let cmdGroupList = "<ul class='common-list' style='display:none'>";
    jsonObj.forEach((item, index) => {
        cmdGroupList += "<li class='common-li' index='" + item.data.id + "'>" + item.name + "</li>";
    });
    cmdGroupList += "</ul>";
    dom.after(cmdGroupList);
    dom.next("ul.common-list").on("click", "li", function () {
        let text = $(this).text();
        let index = $(this).attr("index");
        dom.val(text);
        dom.attr("index", index);
        if (dom.parents(".main-con-item").find("input[name='groupKey']").next()[0].localName == "ul") {
            dom.parents(".main-con-item").find("input[name='groupKey']").next().html("");
            let childHtml = "";
            let childCmd;
            let mainCmd = ctx.get("cmdGroupList");
            mainCmd.forEach((item, index) => {
                if (item.name == dom.val()) {
                    childCmd = item;
                }
            });
            childCmd.data.forEach((item, index) => {
                childHtml += "<li class='common-li' index='" + item.id + "'>" + item.commandName + "</li>";
            });
            // childHtml += "</ul>";
            dom.parents(".main-con-item").find("input[name='groupKey']").next().html(childHtml);

        } else {
            // dom.parents(".main-con-item").find("input[name='groupKey']").after("")
            let childHtml = "<ul class='common-list' style='display:none;position:absolute'>";
            let childCmd;
            let mainCmd = ctx.get("cmdGroupList");
            mainCmd.forEach((item, index) => {
                // childHtml += "<liclass='common-li'>"
                if (item.name == dom.val()) {
                    // if(){

                    // }
                    childCmd = item;
                }
            });
            childCmd.data.forEach((item, index) => {
                childHtml += "<li class='common-li' index='" + item.id + "'>" + item.commandName + "</li>";
            });
            childHtml += "</ul>";
            dom.parents(".main-con-item").find("input[name='groupKey']").after(childHtml);
        }
        // dom.parents(".main-con-item").find("input[name='groupKey']")
    })
}
//获得系统变量列表，回传atwho.js，实现@功能
function at_v() {
    console.log("come from index.js");
    let parametersArray;
    parametersArray = getTargetItemCanUseParameters();

    var at_parameter_array = new Array();
    parametersArray.forEach(e => {
        at_parameter_array.push(e.name)
    })
    return at_parameter_array
}
(function () {
    let menuObj = {};
    let menu = ctx.get("menu");
    if (typeof ctx.get("menu") === 'undefined') {

    } else {
        menu.forEach((item, index) => {
            item.children.forEach((t, i) => {
                if (menuObj.hasOwnProperty(t.nodeType)) {
                    console.log("nodeType has defined:" + t.nodeType)
                };
                if (t.url.includes(":\\")) {
                    menuObj[t.nodeType] = t.url
                } else {
                    menuObj[t.nodeType] = path.join(__dirname, "../pages/template/" + t.url)
                }

            })
        })
    }
    ctx.set("menu_obj", menuObj)
})()