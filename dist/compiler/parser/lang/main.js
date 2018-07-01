"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const debug_1 = require("../../../libs/debug");
const base_1 = require("../../parser/base");
const parsedCache = {};
function parse(fn) {
    debug_1._logInfo("\tParsing LANG"); //, fn.srcFullPath);
    if (fn.src.fullPath in parsedCache) {
        return;
    }
    const content = fs_1.default.readFileSync(fn.src.fullPath).toString();
    const data = JSON.parse(content);
    parsedCache[fn.src.fullPath] = data;
}
function compile(fn, ctx) {
    debug_1._logInfo("\tCompiling LANG", fn.src.fullPath);
    return parsedCache[fn.src.fullPath];
}
exports.default = {
    extension: "lang",
    persist: false,
    parse,
    precompile: base_1.NoOp,
    compile
};
//# sourceMappingURL=main.js.map