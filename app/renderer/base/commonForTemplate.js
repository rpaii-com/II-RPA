$(document).ready(function () {
    //excel相关功能的前端展示，
    $("#coverModal").on("DOMSubtreeModified",".excel-about",function (e) {
        $('.excel-key').val($(".excel-object").val().replace("@","").trim());
        //    表格局部复制
        if (typeof $('.excel-key2').val() !=="undefined"){
            $('.excel-key2').val($(".excel-object2").val().replace("@","").trim());
        }
    });
    //保存历史任务，点击，出现文件别名
    $("#coverModal").on("click","#isSaveHistory",function (e) {
        if($("#isSaveHistory").is(':checked')){
            $('.save-history').show();
        }else{
            $('.save-history').hide();
        }
    });
});




