$(document).ready(function () {
    //app 初始化 工作 -------------------------------------------开始-------------------------------

    // myEmitter.emit('appInit')
    // app标题初始化
    $(".logo-tit-box .logo-main-tit").text("数字员工");
    $("#set_main_setter").text(`copyright@北明软件`).css({
        cursor: "not-allowed",
        color:"#E6E9ED", 
        "text-align": "center",
        width: "100%",
        display: "block"
    })

    // 菜单选项的title赋值，防止看不全菜单名称
    $(".child-menu .child-menu-title").each(function () {
        let str = $(this)[0].innerText;
        $(this).attr("title", str);
    })

    //app 初始化 工作 -------------------------------------------结束-------------------------------

    //webview标签
    //webview 后退
    $('.li-up').on('click', function () {
        webview.goBack();
    })
    //webview 前进
    $('.li-down').on('click', function () {
        webview.goForward();
    })
    //webview 刷新
    $('.li-refresh').on('click', function () {
        webview.reload();
    });


    // 变量 树结构js
    $('.description-action').on('click', '.this_tree li > span', function () {
        var children = $(this).parent('li').find(' > ul > li');
        if (children.is(":visible")) {

            children.hide('fast');
        } else {

            children.show('fast');
        }
    })


    // 模糊查询
    $('.search-menu-box').bind('input propertychange', function () {
        var inputVal = $('.search-menu-box input').val();

        if (inputVal != '') {
            $('span.child-menu-title').parents('.child-menu').find('li').hide();
            $('span.child-menu-title').parents('.left-menu > li').hide();

            var txt = $(this).parents('#leftMenu').find('span.child-menu-title').each(function () {
                var txt = $(this).text();
                if (txt.indexOf(inputVal) != -1) {
                    console.log(inputVal);
                    var txt = $(this).text();
                    console.log(txt);
                    var text = txt.replace(inputVal, "<b>" + inputVal + "</b>");
                    console.log(text);
                    $(this).find('label').html(text);
                    $(this).parent().show();
                    $(this).parent().parent().parent().show();
                }
            });
        } else {
            var txt = $(this).parents('#leftMenu').find('span.child-menu-title').each(function () {
                var txt = $(this).text();
                if (txt.indexOf(inputVal) != -1) {
                    // console.log(inputVal);
                    var txt = $(this).text();
                    // console.log(txt);
                    var text = txt.replace("<b>", "");
                    // console.log(text);
                    $(this).find('label').html(text);
                    $(this).parent().show();
                    $(this).parent().parent().parent().show();
                }
            });

            $('span.child-menu-title').parents('.left-menu > li').show();
            $('span.child-menu-title').parents('.left-menu > li > ul > li').hide();
            $('span.child-menu-title').parents('.left-menu > li > ul > li').css({ 'opacity': '1' });
            $('span.child-menu-title').parents('.left-menu > li > ul > li').css({ 'height': 'auto' });
            $('span.child-menu-title').parents('.left-menu > li > ul > li > span').hide();
            $('span.child-menu-title').parents('.left-menu > li:first').hide();
        }
    });

    //主流程与元流程的大小比例调整
    var isResizing = false;
    var lastDownX = 0;

    var container = $('.box-drag');

    var left = $('.main-liucheng-box');
    var right = $('.detail-liucheng-box');
    var resizor = $('.resizor-box');

    resizor.on('mousedown', function (e) {
        isResizing = true;
        lastDownX = e.clientX;
        console.log(e.clientX)
    });

    $(document).on('mousemove', function (e) {
        if (!isResizing) return true;
        var offsetRight = container.width() - (e.clientX - container.offset().left);
        // 判断左右拖动范围
        if (offsetRight < 0 || offsetRight >= container.width()) {
            isResizing = false;
            return true;
        }

        left.css('right', offsetRight);
        resizor.css('right', offsetRight);
        right.css('width', offsetRight);

    }).on('mouseup', function (e) {
        isResizing = false;
    });

    // 关闭提示引导
    $('body').click(function () {
        $('.icon-prompt').hide();
    });


    let layerIndex;
    let editConfig = [];
    let readConfig;
    let globalPath = remote.getGlobal('path')
    let isPackager = remote.getGlobal('isPackager')
    let version;
    let outVersionHtml;

    //app关闭按钮
    $(".header-do .header-close").on("click", function () {
        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            shadeClose: true,
            area: ['300px', '150px'],
            skin: 'layer-ext-professional-modal',
            content: $("#main-header-close .cover-alert").html(),
            btn: ['确认', '取消'],
            btnAlign: 'c',
            yes: function (index, layero) {
                remote.getCurrentWindow().close();
            }
        });
    });

    //app最小化
    $(".header-do .header-min").on("click", function () {
        myEmitter.emit('windowMinimize');
    });
    //app配置按钮
    $(".header-do .header-set").on("click", function (e) {
        e.stopPropagation();
        $("#appSetter").toggle();
    });
    //app最大化
    $(".header-do .header-max").on("click", function () {
        remote.getCurrentWindow().maximize();
        let $this = this;
        setTimeout(function () {
            $($this).addClass("header-unmax");
        }, 0)
    });
    //app最大化还原
    $(".header-do").on("click", ".header-unmax", function () {
        remote.getCurrentWindow().unmaximize();
        let $this = this;
        setTimeout(function () {
            $($this).removeClass("header-unmax");
        }, 0)
    });

    //切换开发者工具
    $("#set_child_toggledevtool").on("click", function () {
        myEmitter.emit('toggleDevTool');
    });
    //查看版本信息
    $("#set_child_version_detail").on("click",function(){
        let currentsize = remote.getCurrentWindow().getContentSize();
        let sizes = [currentsize[0]*2/3+'px',currentsize[1]*2/3+'px']
        let html = ''; 
        if(typeof outVersionHtml === 'undefined'){

            if(typeof version === 'undefined'){
                version = JSON.parse(readText(path.join(__dirname, '../.././interiorConfig/version.json'), 'utf8'));
            }
            version.forEach((item,index) => {
                let t = '';
                t += '<h2 class="update-explain-title">Version:'+item.version+'<span class="update-explain-time" style="margin-left: 20px;font-size:12px;color:#ccc;">'+item.date+'</span></h2>';
                t += '<ul class="update-explain-list">'
                item.data.forEach((e,i)=>{
                    t += '<li class="update-explain-item">'+e+'</li>';
                });
                t += '</ul>'
                html = t + html;
            });
            outVersionHtml = html;
        }
        layer.open({
            type: 1
            ,title: false //不显示标题栏
            ,closeBtn: true
            ,area: sizes
            ,shade: 0.6
            ,btnAlign: 'c'
            ,moveType: 1 //拖拽模式，0或者1
            ,content: outVersionHtml
        });
    })

    function readText(pathname) {
        var bin = fs.readFileSync(pathname);
        if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
            bin = bin.slice(3);
        }
        return bin.toString('utf-8');
    }
})