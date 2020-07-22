const robot = require("robotjs");

const exec = require('child_process').exec;
const clipboard = require('electron').clipboard;
const errorStack = require("../important/errorStack");

var CSRobotUtil = {
    /**
     * @param type 鼠标按键 left right middle (默认不填 left)
     */
    click: function (type = "left") {
        robot.mouseClick(type, false);
    },
    /**
     * @param type 鼠标按键 left right middle (默认不填 left)
     */
    dbclick: function (type = "left") {
        robot.mouseClick(type, true);
    },
    /**
     * @param x 坐标x
     * @param y 坐标y
     * @param isSmooth 是否平滑过渡（选填） true or false
     */
    moveMouse: function (x, y, isSmooth) {
        if (typeof (isSmooth) == "undefined") {
            robot.moveMouse(x, y)
        } else {
            if (isSmooth) {
                robot.moveMouseSmooth(x, y)
            } else {
                robot.moveMouse(x, y)
            }
        }
    },
    /**
     * @param ox 老坐标x
     * @param oy 老坐标y
     * @param nx 新坐标x
     * @param ny 新坐标y
     */
    drapMouse: function (ox, oy, nx, ny) {
        robot.moveMouse(ox, oy);
        robot.mouseToggle("down");
        robot.dragMouse(nx, ny);
        robot.mouseToggle("up");
    },
    /**
     * @param text 需要填写的信息
     * @param delay 填写信息的间隔 （选填）
     */
    inputText: function (text, delay) {
        if (typeof (delay) == "undefined") {
            robot.typeString(text)
        } else {
            robot.typeStringDelayed(text, delay)
        }
    },
    /**
    * @param key 键盘按键
    * @param group 键盘组合键(选填)
    */
    comKey: function (key, group) {
        if (typeof (group) == "undefined") {
            robot.keyTap(key)
        } else {
            robot.keyTap(key, group)
        }
    },
    /**
     * @param info 需要填写的信息
     */
    CtrlC: function (info) {
        if (typeof (info) == "undefined") {
            robot.keyTap("c", "control")
        } else {
            //   exec('<nul (set/p z=' + info + ') | clip');  // 复制 多一个空格
            // exec('echo ' + info + '| clip');  // 复制 多一个换行

            return clipboard.writeText(info + "");
        }
    },
    CtrlV: function () {
        robot.keyTap("v", "control")
    },
    /**
     * @param x 向上为负 
     * @param y 向左为负
     */
    scroll: function (x = 0, y = 0) {
        if ("" === x) {
            x = 0;
        }
        if ("" === y) {
            y = 0;
        }
        for (let i = 1; i <= Math.abs(parseInt(-x)); i++) {
            setTimeout(() => {
                console.log(parseInt(-x), parseInt(y), Math.abs(parseInt(-x)))
                robot.scrollMouse(parseInt(-x) / Math.abs(parseInt(-x)), 0);
            }, i * 100);

        }
        for (let i = 1; i <= Math.abs(parseInt(y)); i++) {
            setTimeout(() => {
                robot.scrollMouse(0, parseInt(y) / Math.abs(parseInt(y)));
            }, i * 100);

        }
        // console.log(parseInt(-x), parseInt(y))
        // robot.scrollMouse(parseInt(-x), parseInt(y));
    },
    /**
     * 获取当前的鼠标坐标
     * @returns 返回一个{x,y}的坐标对象
     */
    getMousePos: function () {
        return robot.getMousePos()
    },
    /**
     * 获取当前的鼠标像素颜色
     * @param x
     * @param y
     */
    getPixelColor: function (x, y) {
        if (x && y) {
            return robot.getPixelColor(x, y)
        } else {
            return robot.getPixelColor()

        }
    },
    /**
     * 获取当前的屏幕大小
     * @returns 返回一个{width,height}的对象
     */
    getScreenSize: function () {
        return robot.getScreenSize()
    },
    /**
     * 获取屏幕某个区域的BITMAP对象 
     * bitsPerPixel:32
     * byteWidth:800
     * bytesPerPixel:4
     * colorAt:function (x, y)
     * height:200
     * image:Uint8Array(160000)
     * width:200
     */
    getBitmap: function (x, y, width, height) {
        return robot.screen.capture(x, y, width, height);
    },
    draftingMouse: function (data, callback) {
        var [x_s, y_s] = data.rectangle_start.split(",");
        var [x_e, y_e] = data.rectangle_end.split(",");
        x_s = parseInt(x_s);
        x_e = parseInt(x_e);
        y_s = parseInt(y_s);
        y_e = parseInt(y_e);

        var ratio = window.devicePixelRatio;
        robot.moveMouseSmooth(x_s * ratio, y_s * ratio);
        console.log(x_s, y_s, x_e, y_e);
        robot.mouseToggle("down");
        let i;
        for (i = x_s + 1; i <= x_e; i++) {
            (function (x) {
                setTimeout(() => {
                    if (x != x_e) {
                        robot.setMouseDelay(parseInt(Math.random() * 5) + 1);
                        robot.moveMouseSmooth(x * ratio, x % 15 == 0 ? (y_s = y_s + parseInt(Math.random() * 50 - 25)) * ratio : y_s * ratio);
                    } else {
                        robot.moveMouseSmooth(x_e * ratio, y_e * ratio);
                        robot.mouseToggle("up");
                        callback();
                    }
                }, (x - x_s) * 5)
            })(i)
        }
    },
    capScreenPart: function (data, callback) {
        var fileName = data.fileName;
        if (data.rectangle_start.length == 0) {
            var dataset = robot.screen.capture();
        } else {
            var ratio = data.devicePixelRatio;
            var [x_s, y_s] = data.rectangle_start.split(",");
            var [x_e, y_e] = data.rectangle_end.split(",");
            x_s = x_s * ratio; y_s = y_s * ratio; x_e = x_eratio; y_e = y_e * ratio;
            var width = parseInt(x_e) - parseInt(x_s);
            var height = parseInt(y_e) - parseInt(y_s);

            var dataset = robot.screen.capture(x_s, y_s, width, height);
        }

        let buf8 = new Uint8ClampedArray(dataset.image);
        for (let i = 0; i < buf8.length; i += 4) {
            let red = buf8[i],
                green = buf8[i + 1],
                blue = buf8[i + 2],
                alpha = buf8[i + 3];

            buf8[i] = blue;
            buf8[i + 1] = green;
            buf8[i + 2] = red;
            buf8[i + 3] = alpha;
        }
        dataset.image = buf8;
        callback(null, dataset)

    },
    is_target: function (img, j, i, distance) {
        for (var k = 0; k < distance; k++) {
            if (img.atRaw(j, i + k) == 0) {
                return false;
            }
        }
        return true;
    },
    is_target_col: function (img, j, i, callback) {
        for (var k = 0; k < 30; k++) {
            if (img.atRaw(j + k, i) == 0) {
                return false;
            }
        }
        return true;
    },
    slidingVerificationCode: function (data, callback) {
        const cv = require('opencv4nodejs');
        var file = data.file;

        const img1 = cv.imread(file);

        var img2 = img1.canny(100, 600, new cv.Size(3, 3), true);
        cv.imwriteAsync(data.rootdirectory + "/" + "mess.png", img2);
        var [height, wide] = img2.sizes;
        var br_na = false;
        for (var j = 1; j < height; j++) {
            for (var i = 1; i < wide; i++) {
                var hui = img2.atRaw(j, i);
                if (hui > 50 && (i < (wide - 31))) {
                    if (CSRobotUtil.is_target(img2, j, i, 30)) {
                        br_na = true;
                        var target = i;
                        callback(null, target);
                        break;
                    }
                }
            }
            if (br_na) {
                break;
            }
        }
        if (typeof (target) == "undefined") {
            //针对横线找不到
            var br_na_col = false;
            for (var i_ = 1; i_ < wide; i_++) {
                for (var j_ = 1; j_ < height; j_++) {
                    var hui_col = img2.atRaw(j_, i_);
                    if (hui_col > 50 && (j_ < (height - 31))) {
                        if (CSRobotUtil.is_target_col(img2, j_, i_)) {
                            br_na_col = true;
                            var target_col = i_;
                            callback(null, target_col);
                            break;
                        }
                    }
                }
                if (br_na_col) {
                    break;
                }
            }
            if (typeof (target_col) == "undefined") {
                callback(null, wide);
            }
        }
        // cv.imshowWait('a',img2);
        // cv.destroyAllWindows();
    }
};
let getPixelColor = {
    get_pixel_color: function (data, callback) {
        switch (data.mouse_type) {
            case "mouse_input":
                this.mouse_input(data, callback);
                break;
            case "mouse_now":
                this.mouse_now(callback);
                break;
            default:
                callback(errorStack("getPixelColor", "getPixelColor.get_pixel_color判断出错！"));
        }
    },
    mouse_input: function (data, callback) {
        var position = data.position;
        var [x, y] = position.split(",");
        var ratio = data.devicePixelRatio;
        x = x * ratio; y = y * ratio;
        var hex = robot.getPixelColor(x, y);
        var rgb = this.hexToRgb(hex);
        var [r_rgb, g_rgb, b_rgb, a_rgb] = data.rgb.split(",");
        //todo 判断条件需更改
        if ((r_rgb == rgb.r) && (g_rgb == rgb.g) && (b_rgb == rgb.b)) {
            callback(null, "true");
        } else {
            // //todo 自定义错误
            // callback(new ErrorEvent("getPixelColor",
            //     new Error("目标位置像素不正确！")));
            callback(null, "false");
        }
    },
    mouse_now: function (callback) {
        var mouse = robot.getMousePos();
        //todo 是否正确
        var hex = robot.getPixelColor(mouse.x, mouse.y);
        var rgb = this.hexToRgb(hex);

        var [r_rgb, g_rgb, b_rgb, a_rgb] = data.rgb.split(",");
        //todo 判断条件需更改
        if ((r_rgb == rgb.r) && (g_rgb == rgb.g) && (b_rgb == rgb.b)) {
            callback(null, "true");
        } else {
            // callback(new ErrorEvent("getPixelColor",
            //     new Error("目标位置像素不正确！")));
            callback(null, "false");
        }
    },
    hexToRgb: function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
};
let CallbackPixelPosition = {
    callback_pixel_position: function (data, callback) {
        var [x_, y_] = data.rectangle_left_up.split(",");
        var [x_max_, y_max_] = data.rectangle_right_down.split(",");
        var ratio = data.devicePixelRatio;
        x_ = x_ * ratio; y_ = y_ * ratio; x_max_ = x_max_ * ratio; y_max_ = y_max_ * ratio;
        var width = x_max_ - x_;
        var height = y_max_ - y_;
        var img = robot.screen.capture(x_, y_, width, height);

        this.get_position(data, img, x_, y_, callback);

    },
    get_position: function (data, img, x_, y_, callback) {
        var data_img = img.image;
        let errorRange=data.errorRange.length==0?0:parseInt(data.errorRange);
        x_ = parseInt(x_);
        y_ = parseInt(y_);
        var [r_, g_, b_] = data.rgb.split(",");
        r_=parseInt(r_);
        g_=parseInt(g_);
        b_=parseInt(b_);
        var x_min, x_max, y_min, y_max;
        var results = [];

        for (var y = 0; y < img.height; y++) {
            var get_break = false;
            for (var x = 0; x < img.width; x++) {
                var idx = (img.width * y + x) << 2;

                var b_rgb = data_img[idx];
                var g_rgb = data_img[idx + 1];
                var r_rgb = data_img[idx + 2];
                var a = data_img[idx + 3];
                // var ha = getPixelColor.hexToRgb(img.colorAt(x, y));
                if( (r_rgb>=(r_-errorRange) && r_rgb<(r_+errorRange))
                    && (g_rgb>=(g_-errorRange) && g_rgb<(g_+errorRange) )
                    && (b_rgb>=(b_-errorRange) && r_rgb<(r_+errorRange))){
                // if (r_rgb == r_ && (g_rgb == g_) && (b_rgb == b_)) {
                    // console.log("测试",x,y,r_rgb,g_rgb,b_rgb);
                    // console.log("对比",x,y,ha.r,ha.g,ha.b);
                    results.push([x + x_, y + y_]);
                    // get_break=true;
                    x_min = (x_min < x) ? (x_min) : (x);
                    x_max = (x_max > x) ? (x_max) : (x);
                    y_min = (y_min < y) ? (y_min) : (y);
                    y_max = (y_max > y) ? (y_max) : (y);
                    // break;
                }
                // and reduce opacity
                // this.data[idx+3] = this.data[idx+3] >> 1;
            }
            if (get_break) {
                break;
            }
        }
        if (typeof (x_min) == "undefined") {
            callback(errorStack("ElementNotFoundException", "没有符合预期的屏幕像素点！"));
            // throw new Error("没有符合预期的屏幕像素点点");
            return;
        }
        x_min = x_min + x_;
        x_max = x_max + x_;
        y_min = y_min + y_;
        y_max = y_max + y_;
        console.log("全部扫描", x_min, x_max, y_min, y_max);

        switch (data.fd_type) {
            case 'up_left':
                this.get_first(results, x_min, 's', 0, 1, callback);
                break;
            case 'up_right':
                this.get_first(results, x_min, 'b', 0, 1, callback);
                break;
            case 'down_left':
                this.get_first(results, x_max, 's', 0, 1, callback);
                break;
            case 'down_right':
                this.get_first(results, x_max, 'b', 0, 1, callback);
                break;
            case 'left_up':
                this.get_first(results, y_min, 's', 1, 0, callback);
                break;
            case 'left_down':
                this.get_first(results, y_min, 'b', 1, 0, callback);
                break;
            case 'right_up':
                this.get_first(results, y_max, 's', 1, 0, callback);
                break;
            case 'right_down':
                this.get_first(results, y_max, 'b', 1, 0, callback);
                break;
            default:
                callback(errorStack("ElementNotFoundException", "没有此选项！"));
        }
    },
    get_first: function (results, first, second, num, un_num, callback) {
        var new_results = [];
        var min_min, max_max;
        results.forEach(function (value) {
            if (value[num] == first) {
                new_results.push(value[un_num])
            }
        });
        var max = Math.max.apply(Math, new_results);
        var min = Math.min.apply(Math, new_results);

        switch (second) {
            case 's':
                if (num) { callback(null, [min, first]) } else { callback(null, [first, min]) };
                break;
            case 'b':
                if (num) { callback(null, [max, first]) } else { callback(null, [first, max]) };
                break;
            default:
                callback(errorStack("ElementNotFoundException", "没有此选项！"));
        }

    }
}
module.exports = {
    cs: CSRobotUtil,
    CallbackPixelPosition: CallbackPixelPosition,
    getPixelColor: getPixelColor
}