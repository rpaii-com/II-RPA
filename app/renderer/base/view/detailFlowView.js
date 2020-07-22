$(function(){

    //元流程节点 debug按钮 点击
    $(".detail-liucheng-lists-box").on("click", ".debug-flag", function (e) {
        e.stopPropagation();
        $(this).toggleClass("debug-true");
        return false;
    });
    
    //关闭弹窗
    $(".cover-box .cover-close-icon").on("click", function () {
        modal.cleanModal();
        webview.send('stop', 'stop');
    
        myEmitter.emit('modalClose');
        
    });
    
    //异常列表下按钮
    $('body').on('click', '.fluctuate-bottom', function (event) {
        event.stopPropagation()
        var thisModule = $(this).parents('.abnormity-node');
        if ($(thisModule).next())
            $(thisModule).next().after($(thisModule));
    })
    
    //异常列表上按钮
    $('body').on('click', '.fluctuate-top', function (event) {
        event.stopPropagation()
        var thisModule = $(this).parents('.abnormity-node');
        if ($(thisModule).prev())
            $(thisModule).prev().before($(thisModule));
    })
    
    //异常切换
    $('body').on('click', '.abnormity-node-top', function () {
    
        var div_Hei = $(this).parents('.abnormity').height();
    
        var ul_Hei = $('.detail-liucheng-lists-box').height();
    
        $(this).parent().siblings().find('.ab_module').animate({ height: 0 }, 300);
    
        if ($(this).parent().find('ul').height() == 0) {
            $(this).parents('.abnormity-node').addClass('active').siblings().removeClass('active');
            $(this).parent().find('ul').animate({ height: ul_Hei - div_Hei }, 300);
    
        } else {
    
            $(this).parent().find('ul').animate({ height: 0 }, 300, function () {
                $(this).parents('.abnormity-node').removeClass('active');
            });
    
        }
    })
})