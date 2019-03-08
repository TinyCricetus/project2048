"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 定义可设置或检索的键/值对。
 * @class
 */
var KeyValuePair = /** @class */ (function () {
    /**
     * 初始化 KeyValuePair<K, V> 类的新实例。
     * @param  {K} key 每个键/值对中定义的对象。
     * @param  {V} value 与 key 相关联的定义。
     */
    function KeyValuePair(key, value) {
        this._key = key;
        this._value = value;
    }
    Object.defineProperty(KeyValuePair.prototype, "key", {
        /**
         * 获取键/值对中的键。
         * @property
         * @returns K
         */
        get: function () {
            return this._key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyValuePair.prototype, "value", {
        /**
         * 获取键/值对中的值。
         * @property
         * @returns V
         */
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用键和值的字符串表示形式返回 KeyValuePair<K, V> 的字符串表示形式。
     * @override
     * @returns string
     */
    KeyValuePair.prototype.toString = function () {
        return "[" + (this._key || "") + ", " + (this._value || "") + "]";
    };
    return KeyValuePair;
}());
exports.KeyValuePair = KeyValuePair;
