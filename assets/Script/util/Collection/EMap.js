"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enumerator_1 = require("./Enumerator");
var KeyValuePair_1 = require("./KeyValuePair");
/**
 * 表示一个用于存储键值对的数据结构。
 * @class
 * @description Map 类似于对象，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。
 */
var Map = /** @class */ (function () {
    function Map() {
        this._keys = []; // 键列表
        this._values = []; // 值列表
    }
    Object.defineProperty(Map.prototype, "size", {
        /**
         * 获取 Map<K, V> 中实际包含的成员总数。
         * @property
         * @returns number
         */
        get: function () {
            return this._keys.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 设置键名 key 对应的键值为 value，然后返回整个 Map<K, V> 结构。
     * 如果 key 已经有值，则键值会被更新，否则就新生成该键。
     * @param  {K} key 键。
     * @param  {V} value 值。
     * @returns void
     */
    Map.prototype.set = function (key, value) {
        var keys = this._keys, index = keys.indexOf(key);
        if (index === -1) {
            index = keys.length;
            keys[index] = key;
        }
        this._values[index] = value;
        return this;
    };
    /**
     * 读取 key 对应的键值，如果找不到 key，返回 undefined。
     * @param  {K} key 键。
     * @returns V
     */
    Map.prototype.get = function (key) {
        var index = this._keys.indexOf(key);
        return index !== -1 ? this._values[index] : undefined;
    };
    /**
     * 确定 Map<K, V> 是否包含指定的键。
     * @param  {K} key 键。
     * @returns boolean 如果 Map<K, V> 包含具有指定键的成员，则为 true；否则为 false。
     */
    Map.prototype.has = function (key) {
        return this._keys.indexOf(key) !== -1;
    };
    /**
     * 从 Map<K, V> 中删除指定的键对应的项。
     * @param  {K} key 键。
     * @returns boolean  如果成功找到并移除该项，则为 true；否则为 false。
     */
    Map.prototype.delete = function (key) {
        var index = this._keys.indexOf(key);
        if (index !== -1) {
            // 删除键和值
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            return true;
        }
        return false;
    };
    /**
     * 清除所有键和值。
     * @returns void
     */
    Map.prototype.clear = function () {
        this._keys.length = 0;
        this._values.length = 0;
    };
    /**
     * 返回一个循环访问集合的枚举器。
     * @returns IEnumerator
     */
    Map.prototype.getEnumerator = function () {
        var entries = this.entries();
        return new Enumerator_1.Enumerator(entries);
    };
    /**
     * 对 IEnumerable<T> 进行迭代处理。
     * @param  {Function} callback 每次迭代中执行的回调函数，当前迭代项将传入该函数。
     * @param  {any} scope? 回掉函数中 this 所引用的对象。
     * @returns void
     */
    Map.prototype.forEach = function (callback, scope) {
        var keys = this._keys, values = this._values;
        for (var i = 0, len = keys.length; i < len; i++) {
            callback.call(scope, new KeyValuePair_1.KeyValuePair(keys[i], values[i]), this);
        }
    };
    /**
     * 获取包含 Map<K, V> 中的键列表。
     * @returns Array
     */
    Map.prototype.keys = function () {
        return this._keys.concat();
    };
    /**
     * 获取包含 Map<K, V> 中的值列表。
     * @returns Array
     */
    Map.prototype.values = function () {
        return this._values.concat();
    };
    /**
     * 获取包含 Map<K, V> 中的成员列表。
     * @returns Array
     */
    Map.prototype.entries = function () {
        var entries = new Array();
        this.forEach(function (item, source) {
            entries.push(new KeyValuePair_1.KeyValuePair(item.key, item.value));
        });
        return entries;
    };
    /**
     * 返回 Map<K, V> 的字符串表示形式。
     * @override
     * @returns string
     */
    Map.prototype.toString = function () {
        var obj = Object.create(null);
        this.forEach(function (item, source) {
            obj[item.key] = item.value;
        });
        return JSON.stringify(obj);
    };
    return Map;
}());
exports.Map = Map;
