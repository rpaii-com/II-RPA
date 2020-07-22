
function Context() {
    this.primitives = {};
    this.collection1d = {};
    this.collection2d = {};
    this.others = {};
    this.parent = null;
    this.children = [];
    let that = this;
    const version = new Date();
    let thatObject = {
        //
        allContext: allContext,
        //
        isOwnProperty: isOwnProperty,
        /**
         * 存储key
         */
        set: set,
        /**
         * 读取key
         */
        get: get,
        /**
         * 所有简单类型key
         */
        keys: keys,
        /**
         * 所有数组key
         */
        constantize: constantize,
        getChildren: getChildren,
        setChildren: setChildren,
        setParent: setParent,
        getParent: getParent,
        arrays: arrays,
        tables: tables,
        maps: maps,
        that: that,
        version: version,
        isPrimitive: isPrimitive,
        isTable: function (val) {
            switch (signature(val)) {
                case '[[p':
                case '{[p':
                case '[{p':
                case '{{p':
                    return true;
                    break;
                default:
                    return false;
            }
        },
        isArray: function isArray(val) {
            if (signature(val) === '[p') {
                return true;
            }
            return false;

        },
        is2DArray: function is2DArray(val) {
            if (signature(val) === '[[p') {
                return true;
            }
            return false;
        },
        isMap: function (o) {
            return o instanceof Object && o.constructor === Object;
        },
        signature: signature
    }
    function get(key) {
        if (typeof that.primitives[key] != "undefined") {
            return that.primitives[key];
        } else if (typeof that.collection1d[key] != "undefined") {
            return that.collection1d[key];
        } else if (typeof that.collection2d[key] != "undefined") {
            return that.collection2d[key];
        } else {
            return that.others[key];
        }
    }
    function isOwnProperty(key) {
        return that.primitives.hasOwnProperty(key) || that.collection1d.hasOwnProperty(key) || that.collection2d.hasOwnProperty(key) || that.others.hasOwnProperty(key);
    }
    function drop(key) {
        delete that.primitives[key];
        delete that.collection1d[key];
        delete that.collection2d[key];
        delete that.others[key];
    }
    function constantize(obj) {
        Object.freeze(obj);
        Object.keys(obj).forEach((key, i) => {
            if (typeof obj[key] === 'object') {
                constantize(obj[key]);
            }
        });
    };
    function set(key, val) {
        drop(key);
        switch (signature(val)) {
            case 'p':
                that.primitives[key] = val;
                break;
            case '[p':
                that.collection1d[key] = val;
                break;

            case '[[p':
            case '{[p':
            case '[{p':
            case '{{p':
                that.collection2d[key] = val;
                break;
            default:
                that.others[key] = val;
        }
    }
    function setParent(obj) {
        if (that.parent == null && typeof obj != "undefined") {
            obj.setChildren(thatObject);
            that.parent = obj;
        }
    }
    function setChildren(obj) {
        that.children.push(obj);
    }
    function getParent() {
        return that.parent;
    }
    function getChildren() {
        return that.children;
    }
    function keys() {
        return Object.keys(that.primitives);
    };
    function arrays() {
        return Object.keys(that.collection1d);
    };
    function tables() {
        return Object.keys(that.collection2d);
    };
    function maps() {
        return Object.keys(that.others);
    }
    function retList(keys) {
        let ret = [];
        for (let i in keys) {
            let temp = {};
            temp[i] = keys[i];
            //instanceof Array ? keys[i].slice(0, 10) : typeof keys[i] == "string" ? keys[i] : JSON.stringify(keys[i]).slice(0, 100);
            // if(typeof keys[i] === 'undefined'){
            //     temp[i]
            // }
            // temp[i] = keys[i]instanceof Array ? keys[i].slice(0, 10) : typeof keys[i] == "string" ? keys[i] : JSON.stringify(keys[i]).slice(0, 100);
            ret.push(temp);
        }
        return ret;

    }
    function allContext() {
        let ret = [];
        ret = ret.concat(retList(that.primitives));
        ret = ret.concat(retList(that.collection1d));
        ret = ret.concat(retList(that.collection2d));
        ret = ret.concat(retList(that.others));
        return ret;
    }
    function signature(val) {
        if (isPrimitive(val)) {
            return "p"
        } else if (val instanceof Array) {
            return "[" + signature(val[0]);
        } else {
            return "{" + signature(val[Object.keys(val)[0]])
        }
    };
    function isPrimitive(val) { return (val !== Object(val)); };
    return thatObject;

}
const ctx = new Context();

// ctx.set("foo","bar")
// ctx.set("age",99)
// ctx.set("ll",[2,3,4])
// ctx.set("excel",[[2,3,4],[0,9,3]])

module.exports = {
    Context: Context,
    context: ctx
}