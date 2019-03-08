"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EnumEntry_1 = require("./EnumEntry");
var ClassType_1 = require("../runtime/ClassType");
var EnumUtils = /** @class */ (function () {
    function EnumUtils() {
    }
    /**
     * 获取指定枚举项对应的描述对象。
     * @param  {number} value 枚举值。
     * @param  {any} type 要获取的枚举类型。
     * @returns EnumEntry 返回的指定枚举项对应的枚举描述对象。
     */
    EnumUtils.getEntry = function (value, type) {
        if (!type) {
            return undefined;
        }
        var entries = this.getEntries(type).filter(function (e) { return e.value === value; });
        return entries.length === 1 ? entries[0] : null;
    };
    /**
     * 获取指定枚举的描述对象数据。
     * @param  {any} type 要获取的枚举类型。
     * @returns Array<EnumEntry> 返回的枚举描述对象数组。
     */
    EnumUtils.getEntries = function (type) {
        if (!type) {
            return undefined;
        }
        // 尝试从缓存中获取
        if (this._entryCache.has(type)) {
            return this._entryCache.get(type);
        }
        // 获取枚举的元数据
        var metadata = ClassType_1.Type.getMetadata(type) || {};
        var entries = new Array(), fields = this.getFields(type);
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var _a = fields_1[_i], name_1 = _a[0], value = _a[1];
            var meta = metadata[name_1];
            var alias = meta ? meta.alias : "";
            var description = meta ? meta.description : "";
            entries.push(new EnumEntry_1.EnumEntry(name_1, value, alias, description));
        }
        // 加入缓存以便下次获取
        if (entries.length > 0) {
            this._entryCache.set(type, entries);
        }
        return entries;
    };
    /**
     * 获取指定枚举类型的字段列表
     * @param  {any} type 枚举类型。
     * @returns Array<[string, number]> 一个元组数据，数据项以<名称,值>的方式返回。
     */
    EnumUtils.getFields = function (type) {
        if (!type) {
            return undefined;
        }
        var fields = Object.keys(type)
            .map(function (key) { return [key, type[key]]; })
            .filter(function (_a) {
            var key = _a[0], value = _a[1];
            return ClassType_1.Type.isNumber(value);
        });
        return fields;
    };
    EnumUtils._entryCache = new Map();
    return EnumUtils;
}());
exports.EnumUtils = EnumUtils;
