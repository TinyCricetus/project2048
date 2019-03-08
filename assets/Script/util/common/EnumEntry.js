"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 表示枚举项的描述。
 * @class
 * @version 1.0.0
 */
var EnumEntry = /** @class */ (function () {
    /**
     * 初始化枚举项的新实例。
     * @param  {string} name 枚举项的名称。
     * @param  {number} value 枚举项的值。
     * @param  {string=""} alias 枚举项的别名。
     * @param  {string=""} description 枚举项的描述。
     */
    function EnumEntry(name, value, alias, description) {
        this.name = name;
        this.value = value;
        this.alias = alias || "";
        this.description = description || "";
    }
    return EnumEntry;
}());
exports.EnumEntry = EnumEntry;
