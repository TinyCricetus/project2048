"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enumerator_1 = require("./Enumerator");
/**
 * 表示一个强类型列表。提供用于对列表进行搜索、排序和操作的方法。
 * @class
 * @description Set<T> 接受 null 作为引用类型的有效值，但是不允许有重复的元素。
 */
var Set = /** @class */ (function () {
    /**
     * 初始化 Set<T> 的新实例。
     * @param  {Array<T>} ...values
     */
    function Set() {
        var _a;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        this._values = [];
        (_a = this._values).push.apply(_a, values);
    }
    Object.defineProperty(Set.prototype, "size", {
        /**
         * 获取 Set<T> 中实际包含的元素总数。
         * @property
         * @returns number
         */
        get: function () {
            return this._values.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 将元素添加到 Set<T> 的结尾处。
     * @param  {T[]} ...values 要添加到 Set<T> 末尾处的元素。
     * @returns Set
     */
    Set.prototype.add = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var value = values_1[_a];
            if (!this.has(value)) {
                this._values.push(value);
            }
        }
        return this;
    };
    /**
     * 获取指定索引处的元素。
     * @param  {number} index 要获得或设置的元素从零开始的索引。
     * @returns T 指定索引处的元素。
     */
    Set.prototype.get = function (index) {
        return this._values[index];
    };
    /**
     * 设置指定索引处的元素。
     * @param  {number} index 设置的元素从零开始的索引。
     * @param  {T} value 元素值。
     * @returns void
     */
    Set.prototype.set = function (index, value) {
        var values = this._values;
        if (index >= 0 && index < values.length) {
            if (!this.has(value)) {
                values[index] = value;
            }
        }
    };
    /**
     * 从 Set<T> 中移除特定元素的匹配项。
     * @param  {T} value 要从 Set<T> 中移除的元素。
     * @returns boolean 如果成功移除 value，则为 true；否则为 false。如果在 Set<T> 中没有找到 value，该方法也会返回 false。
     */
    Set.prototype.delete = function (value) {
        var values = this._values, index = values.indexOf(value);
        if (index !== -1) {
            values.splice(index, 1);
            return true;
        }
        return false;
    };
    /**
     * 移除 Set<T> 的指定索引处的元素。
     * @param  {number} index 要移除的元素的从零开始的索引。
     * @returns void
     */
    Set.prototype.deleteAt = function (index) {
        var values = this._values;
        if (index >= 0 && index < values.length) {
            values.splice(index, 1);
        }
    };
    /**
     * 从 Set<T> 中移除所有元素。
     * @returns void
     */
    Set.prototype.clear = function () {
        this._values.length = 0;
    };
    /**
     * 搜索指定的元素，并返回整个 Set<T> 中第一个匹配项的从零开始的索引。
     * @param  {T} value 要在 Set<T> 中定位的元素。对于引用类型，该值可以为 null。
     * @param  {number} index? 从零开始的搜索的起始索引。
     * @returns number 如果在整个 Set<T> 中找到 value 的第一个匹配项，则为该项的从零开始的索引；否则为 -1。
     */
    Set.prototype.indexOf = function (value, index) {
        return this._values.indexOf(value, index);
    };
    /**
     * 确定某元素是否在 Set<T> 中。
     * @param  {T} value 要在 Set<T> 中定位的元素。对于引用类型，该值可以为 null。
     * @returns boolean 如果在 Set<T> 中找到 value，则为 true，否则为 false。
     */
    Set.prototype.has = function (value) {
        return this._values.indexOf(value) !== -1;
    };
    /**
     * 返回一个循环访问集合的枚举器。
     * @returns IEnumerator
     */
    Set.prototype.getEnumerator = function () {
        return new Enumerator_1.Enumerator(this._values);
    };
    Set.prototype.forEach = function () {
        var values = this._values, callback = arguments[0], scope = arguments[1], fromEnumerable = callback.length === 2; // 标识是否从 IEnumerable 接口调用
        for (var i = 0, len = values.length; i < len; i++) {
            fromEnumerable ? callback.call(scope, values[i], this) : callback.call(scope, values[i], i, this);
        }
    };
    /**
     * 搜索与指定谓词所定义的条件相匹配的元素，并返回 Set<T> 中第一个匹配元素。
     * @param  {Function} callback 定义要搜索的元素的条件。
     * @param  {any} scope? 回掉函数中 this 所引用的对象。
     * @returns T
     */
    Set.prototype.find = function (callback, scope) {
        var values = this._values;
        for (var i = 0, len = values.length; i < len; i++) {
            if (callback.call(scope, values[i], i, this)) {
                return values[i];
            }
        }
        return undefined;
    };
    /**
     * 使用指定的比较器对整个 Set<T> 中的元素进行排序。
     * @param  {Function} comparer? 比较元素时要使用的比较器函数。
     * @returns void
     */
    Set.prototype.sort = function (comparer) {
        var values = this._values;
        this._values = values.sort(comparer);
    };
    /**
     * 将指定的 ISet<T> 合并到当前 ISet<T> 中。
     * @param  {ISet<T>} second 需要合并的数据源。
     * @returns ISet
     */
    Set.prototype.union = function (source) {
        var values = source.values();
        if (values.length > 0) {
            this.add.apply(this, values);
        }
        return this;
    };
    /**
     * 获取包含 Set<T> 中的值列表。
     * @returns Array
     */
    Set.prototype.values = function () {
        return this._values.concat();
    };
    /**
     * 返回 Set<T> 的字符串表示形式。
     * @override
     * @returns string
     */
    Set.prototype.toString = function () {
        return Array.prototype.toString.call(this._values);
    };
    return Set;
}());
exports.Set = Set;
