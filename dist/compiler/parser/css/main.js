"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const debug_1 = require("../../../libs/debug");
const base_1 = require("../base");
const clean_css_1 = __importDefault(require("clean-css"));
const parsedCache = {};
function preparse(sourceFilePath) {
    return {
        isPartial: false,
        type: "compilable"
    };
}
;
function parse(fn) {
    debug_1._logInfo("\tParsing CSS"); //, fn.src.fullPath);
    if (fn.src.fullPath in parsedCache) {
        return;
    }
    const content = fs_1.default.readFileSync(fn.src.fullPath).toString();
    parsedCache[fn.src.fullPath] = content;
}
function compile(fn) {
    debug_1._logInfo("\tCompiling SASS/SCSS");
    return parsedCache[fn.src.fullPath].toString();
}
const ccss = new clean_css_1.default({
    inliner: true,
});
function aftercompile(fn, content) {
    return ccss.minify(content).styles;
}
exports.default = {
    extension: "css",
    //persist: false,
    preparse,
    parse,
    precompile: base_1.NoOp,
    compile,
    aftercompile
};
//# sourceMappingURL=main.js.map