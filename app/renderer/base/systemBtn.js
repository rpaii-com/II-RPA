$(function () {
    let layerIndex;
    let editConfig = [];
    let readConfig;
    let globalPath = remote.getGlobal('path')
    let isPackager = remote.getGlobal('isPackager')
    let version;
    let outVersionHtml;
    $(".header-do .header-close").on("click", function () {
        // remote.getCurrentWindow().close();
        if(hasDownLoadNewSuccess){

            layer.open({
                type: 1,
                title: false,
                closeBtn: 1,
                shadeClose: true,
                area: ['300px', '150px'],
                skin: 'layer-ext-professional-modal',
                content: $("#main-header-close .cover-alert").html(),
                btn: ['确认', '取消','更新'],
                btnAlign: 'c',
                yes: function (index, layero) {
                    remote.getCurrentWindow().close();
                }
            });
        }else {

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
        }

    });
    $(".header-do .header-min").on("click", function () {
        remote.getCurrentWindow().minimize();
    });
    $(".header-do .header-set").on("click", function (e) {
        e.stopPropagation();
        // remote.getCurrentWindow().minimize();
        $("#appSetter").toggle();
    });
    $(".header-do .header-max").on("click", function () {
        remote.getCurrentWindow().maximize();
        let $this = this;
        setTimeout(function () {
            $($this).addClass("header-unmax");
        }, 0)
    });
    $(".header-do").on("click", ".header-unmax", function () {
        remote.getCurrentWindow().unmaximize();
        let $this = this;
        setTimeout(function () {
            $($this).removeClass("header-unmax");
        }, 0)
    });
    $("#set_child_toggledevtool").on("click", function () {
        remote.getCurrentWebContents().toggleDevTools()
    });
    $("#set_child_version_detail").on("click",function(){
        console.log(currentWindowSize);
        let currentsize = remote.getCurrentWindow().getContentSize();
        let sizes = [currentsize[0]*2/3+'px',currentsize[1]*2/3+'px']
        let html = ''; 
        console.log(sizes);
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
        // document.getElementById('version_info').innerHTML=html;
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
    });


    function readText(pathname) {
        var bin = fs.readFileSync(pathname);
        if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
            bin = bin.slice(3);
        }
        return bin.toString('utf-8');
    }
})
