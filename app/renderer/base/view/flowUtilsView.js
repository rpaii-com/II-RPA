//点击注释缩略
$(".detail-liucheng-scroll").on('click','span.scroll-item-annotation',function(){
    let tempId = $(this).parent('li.scroll-nodeItem').attr('id');
    let targetListId = $(this).parents('ul.scroll-nodeItem-list').eq($(this).parents('ul.scroll-nodeItem-list').length-1).attr('id').replace('scrollList','secondList');
    let targetId = tempId.replace('scrollItem','');
    let targetSize = domUtils.calcOffset(targetId);
    let itemParentsUl = $('#'+targetListId)
    itemParentsUl.scrollTop(targetSize.offsetTop - itemParentsUl.outerHeight() / 2);
    itemParentsUl.scrollLeft(targetSize.offsetLeft - itemParentsUl.outerWidth() / 2);
    $('.detail-liucheng-lists-box .liucheng-item-selected').removeClass('liucheng-item-selected');
    $('#'+targetId).addClass('liucheng-item-selected');
})