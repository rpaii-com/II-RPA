$(document).ready(function () {
    //绑定其他位置点击设置框消失
    domUtils.bindExcludeEvent("click", $("#appSetter"), document);

    //绑定其他位置点击滚动消失
    domUtils.bindExcludeEvent("click", $("#detail-liucheng-scroll"), document);
})