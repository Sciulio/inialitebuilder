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
const debug_1 = require("../../../libs/debug");
const base_1 = require("../base");
const parsedCache = {};
function preparse(sourceFilePath) {
    return {
        isPartial: false,
        type: "build-resx"
    };
}
;
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
    return __awaiter(this, void 0, void 0, function* () {
        debug_1._logInfo("\tCompiling LANG", fn.src.fullPath);
        return Promise.resolve(parsedCache[fn.src.fullPath]);
    });
}
exports.default = {
    extension: "lang",
    //persist: false,
    preparse,
    parse,
    precompile: base_1.NoOp,
    compile,
    aftercompile: base_1.NoOp
};
//# sourceMappingURL=main.js.map