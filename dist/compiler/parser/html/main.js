"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const html_minifier_1 = require("html-minifier");
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
    return __awaiter(this, void 0, void 0, function* () {
        debug_1._logInfo("\tCompiling HTML"); //, fn.src.fullPath);
        return parsedCache[fn.src.fullPath];
    });
}
function aftercompile(fn, content) {
    //TODO: load config
    return html_minifier_1.minify(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        preserveLineBreaks: true,
        removeComments: true
    });
}
exports.default = {
    extension: "html",
    //persist: true,
    preparse,
    parse,
    precompile: base_1.NoOp,
    compile,
    aftercompile
};
//# sourceMappingURL=main.js.map