// 关闭并发和条件判断
$('body').on('click', '.logic-box-off', function () {
    $(this).parent('li').remove();
})

function concurrence() {
    let tempDate;
    // 并发往下添加
    // let concurrence_node = '<li class="point main-liucheng-item main-item-select" id=' + tempDate + ' ><div class="liucheng-item-utils"><i class="liucheng-item-util-add"></i><i class="liucheng-item-util-remove"></i><i class="liucheng-item-util-default"></i></div><i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title=""></span><div class="parameter-botton"><label>出参：</label></div></li>';

    let concurrence_list = '<li class="branch-way"><ul class="tunnel"><li itemType="MetaWorkflow" class="point main-liucheng-item main-item-select"><div class="liucheng-item-utils"><i class="liucheng-item-util-add"></i><i class="liucheng-item-util-remove"></i><i class="liucheng-item-util-default"></i></div><i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title=""></span><div class="parameter-botton"><label>出参：</label></div></li><li class="long-string"></li></ul></li>'
    //向下添加一项，暂支持if和并发
    $('.main-liucheng-list').on('click', '.liucheng-item-util-default', function (ev) {
        ev.stopPropagation();
        tempDate = new Date().getTime();
        $(".main-item-select").removeClass("main-item-select");
        let concurrence_node = '<li itemType="MetaWorkflow" class="point main-liucheng-item main-item-select"><div class="liucheng-item-utils"><i class="liucheng-item-util-add"></i><i class="liucheng-item-util-remove"></i><i class="liucheng-item-util-default"></i></div><i class="icon-main-liucheng-item icon-main-item-ywk"></i><span class="title" title=""></span><div class="parameter-botton"><label>出参：</label></div></li>';
        $(this).parents('.point').after(concurrence_node);
    })
    //主流程节点删除按钮
    $('.main-liucheng-list').on('click', '.liucheng-item-util-remove', function (ev) {
        ev.stopPropagation();
        let currentLiId = $(this).parents("li.main-liucheng-item").eq(0).attr("id");
        let currentSecondId = 'secondList' + currentLiId;
        var li_list = $(this).parents('.tunnel').find('.point').length;
        var way_list = $(this).parents('.branch-container').find('.branch-way').length;
        if ($(this).parents(".main-liucheng-item").hasClass("point")) {
            if ($(".detail-liucheng-lists-box").find("#" + currentSecondId).find("li").not(".segmentation-li").length > 0) {
                alert("请先清空元流程再删除");
                return;
            } else {
                if (way_list == 1 && li_list == 1) {
                    // 并发处理
                    $(this).parents('.this_concurrence').next('br').remove();
                    $(this).parents('.this_concurrence').remove();
                    // 条件判断
                    $(this).parents('.li-branch-if').next('br').remove();
                    $(this).parents('.li-branch-if').remove();
                } else if (li_list == 1) {
                    $(this).parents('.branch-way').remove();
                }
                $(this).parents('.point').remove();
                $(".detail-liucheng-lists-box").find("#" + currentSecondId).remove();
            }
        } else if ($(this).parents(".main-liucheng-item").eq(0).hasClass("for-liucheng-start") || $(this).parents(".main-liucheng-item").eq(0).hasClass("for-liucheng-end")) {
            let startId = "secondList" + $(this).parents(".this_for").eq(0).find("li.for-liucheng-start").attr("id");
            let endId = "secondList" + $(this).parents(".this_for").eq(0).find("li.for-liucheng-end").attr("id");
            if ($(this).parents(".main-liucheng-item").parents("li").eq(0).find(">ul").find(">li.main-liucheng-item").length > 2) {
                alert("请先清空循环中流程")
                return;
            } else if ($("#" + startId).find("li").not(".segmentation-li").length > 0 || $("#" + endId).find("li").not(".segmentation-li").length > 0) {
                alert("请先清空元流程中流程")
                return;
            } else {

                $(this).parents(".main-liucheng-item").parents("li").eq(0).find(">ul").find(">li.main-liucheng-item").each(function () {
                    let currentSecondId = "secondList" + $(this).attr("id");
                    $("#" + currentSecondId).remove();
                    ctx.set(currentSecondId, null);
                });
                $(this).parents(".this_for").remove()
            }
        } else {
            if ($(".detail-liucheng-lists-box").find("#" + currentSecondId).find("li").not(".segmentation-li").length > 0) {
                alert("请先清空元流程再删除");
                return;
            } else {
                $(this).parents(".main-liucheng-item").remove();
                $(".detail-liucheng-lists-box").find("#" + currentSecondId).remove();
            }
        }

    })

    // 并发添加一列
    $('.main-liucheng-list').on('click', '.liucheng-item-util-add', function (ev) {
        ev.stopPropagation();
        $(".main-item-select").removeClass("main-item-select");
        $(this).parents('.branch-way').after(concurrence_list);
    })
};