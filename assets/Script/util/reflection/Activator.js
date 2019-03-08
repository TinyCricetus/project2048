"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClassType_1 = require("../runtime/ClassType");
/**
 * 提供对象实例创建的方法。
 * @static
 * @class
 */
var Activator = /** @class */ (function () {
    /**
     * 私有构造方法，使类型成为静态类。
     * @private
     */
    function Activator() {
    }
    /**
     * 创建指定类型的实例。
     * @param  {string|Function} type 类型字符串或类型构造函数。
     * @param  {any[]} ...params 需要传递给构造函数的参数。
     * @returns T
     */
    Activator.createInstance = function (type) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var types = this._types, ctor;
        if (ClassType_1.Type.isString(type)) {
            type = type;
            // 先从缓存中获取类型，如果不存在则动态解析并加入缓存
            if (!types.has(type)) {
                ctor = ClassType_1.Type.getClassType(type);
                if (ctor === String) {
                    throw new TypeError("Can not found the type '" + type + "'.");
                }
                // 只有解析到的类型不是字符串，而是真实的类型时才往下走
                types.set(type, ctor);
            }
            else {
                ctor = types.get(type);
            }
        }
        else if (ClassType_1.Type.isFunction(type)) {
            ctor = type;
        }
        return new (ctor.bind.apply(ctor, [void 0].concat(params)))();
    };
    Activator._types = new Map();
    return Activator;
}());
exports.Activator = Activator;
