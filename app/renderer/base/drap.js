    var html = ""
    var addLiuchengItem = {};
    var liuchengItem = "";
    var tipsBox;

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drag(ev) {
        var tipsBoxDemo = '<div class="liucheng-item-tips">';
        var thisTipsBox = $(ev.target).parent().find(".liucheng-item-tips").length > 0 ? tipsBoxDemo + $(ev.target).parent().find(".liucheng-item-tips").eq(0).html() + '</div>' : '';
        tipsBox = thisTipsBox;
        html = $(ev.target).parent().find(".child-menu-operate").html()
        var thisParentLiIndex = $(ev.target).parents(".child-menu").parent("li").index();
        var thisVal = $(ev.target).parent().children(".child-menu-title").text();
        addLiuchengItem.uuid = new Date().getTime(); //获取时间戳作为uuid
        addLiuchengItem.thisParentLiIndex = thisParentLiIndex;
        addLiuchengItem.newNodeMainClass = "menu-item-" + (thisParentLiIndex + 1);
        addLiuchengItem.newNodeLeftIconClass = $(ev.target).find(".child-menu-title").find("i").className();
        liuchengItem = '<li  id="' + addLiuchengItem.uuid + '" class="' + addLiuchengItem.newNodeMainClass + ' dads-children clear"><i class="' + addLiuchengItem.newNodeLeftIconClass + ' menu-icon"></i><span class="title" style="line-height: 32px;">';
        liuchengItem += thisVal;
        liuchengItem += '</span><div class="liucheng-utils clear">';
        liuchengItem += '<i class="liucheng-icon-xiugai"></i>';
        liuchengItem += '<i class="liucheng-icon-delete"></i>';
        liuchengItem += '</div><span class="liucheng-operate-data"></span>';
        // liuchengItem += '<div class="liucheng-item-tips">';
        liuchengItem += tipsBox;
        liuchengItem += '</li>';
        addLiuchengItem.newNodeItem = liuchengItem;

        // console.log(ev.target.innerText);
        // // ev.dataTransfer.setData("Text", ev.target.id);
        // // $(".liucheng-list").append('<li id="1512011404372" class="menu-item-1 dads-children clear"><i class="menu-icon-1 dad-draggable-area"></i><span class="title">打开网页</span></li>');
        // $('.liucheng-list').dad({
        //     draggable: '.menu-icon-1'
        // });
        // $(".first-tips-box").hide();
        // if ($(".liucheng-box").eq(0).css("display") == "none") {
        //     $(".liucheng-box").show();
        //     $('.liucheng-list').css('height', '180px');
        // }
    }

    function drop(ev) {
        let txt = "#";
        txt += ev.target.id;
        $(txt).parent().find('ul').eq(0).append(addLiuchengItem.newNodeItem);
        $("#" + addLiuchengItem.uuid + "> .liucheng-operate-data").html(html)
        console.log(addLiuchengItem.uuid)
        html = ""
        addLiuchengItem = {};
        // ev.preventDefault();
        // var data = ev.dataTransfer.getData("Text");
        // ev.target.appendChild(document.getElementById(data));
        $('.liucheng-list').dad({
            draggable: '.menu-icon'
        });
    }