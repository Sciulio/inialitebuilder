"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const debug_1 = require("../../../libs/debug");
const base_1 = require("../base");
const parsedCache = {};
function preparse(sourceFilePath) {
    return {
        isPartial: path_1.default.basename(sourceFilePath)[0] == '_',
        type: "compilable"
    };
}
;
function parse(fn) {
    debug_1._logInfo("\tParsing  HTML"); //, fn.src.fullPath);
    if (fn.src.fullPath in parsedCache) {
        return;
    }
    const content = fs_1.default.readFileSync(fn.src.fullPath).toString();
    parsedCache[fn.src.fullPath] = content;
}
function compile(fn) {
    debug_1._logInfo("\tCompiling HTML"); //, fn.src.fullPath);
    return parsedCache[fn.src.fullPath];
}
exports.default = {
    extension: "html",
    //persist: true,
    preparse,
    parse,
    precompile: base_1.NoOp,
    compile
};
//# sourceMappingURL=main.js.map