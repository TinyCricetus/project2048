"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 表示一个默认的枚举器。
 * @class
 */
var Enumerator = /** @class */ (function () {
    /**
     * 初始化 Enumerator<T> 类的新实例。
     * @constructor
     * @param  {Array<T>} items 要枚举的元素。
     */
    function Enumerator(items) {
        if (!items) {
            console.log('--- no arguments---');
        }
        this._index = 0;
        this._current = undefined;
        this._items = items;
    }
    Object.defineProperty(Enumerator.prototype, "current", {
        /**
         * 获取当前遍历的值。
         * @summary 如果已经遍历结束，则返回 undefined。
         * @property
         * @returns T
         */
        get: function () {
            return this._current;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 将枚举数推进到集合的下一个元素。
     * @returns boolean 如果枚举数已成功地推进到下一个元素，则为 true；如果枚举数传递到集合的末尾，则为 false。
     */
    Enumerator.prototype.next = function () {
        var items = this._items;
        if (this._index < items.length) {
            this._current = items[this._index++];
            return true;
        }
        else {
            return false;
        }
    };
    return Enumerator;
}());
exports.Enumerator = Enumerator;
