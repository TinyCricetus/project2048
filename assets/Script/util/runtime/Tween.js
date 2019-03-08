"use strict";
/**
 * t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。
 */
Object.defineProperty(exports, "__esModule", { value: true });
var mTween = /** @class */ (function () {
    function mTween() {
    }
    /**
     * 加速
     * @param t
     * @param b
     * @param c
     * @param d
     * @returns {number}
     */
    mTween.quadEaseIn = function (t, b, c, d) {
        return c * (t /= d) * t + b;
    };
    /**
     * 匀速
     * @param t
     * @param b
     * @param c
     * @param d
     * @returns {number}
     */
    mTween.quadLinear = function (t, b, c, d) {
        return c * t / d + b;
    };
    return mTween;
}());
exports.mTween = mTween;
