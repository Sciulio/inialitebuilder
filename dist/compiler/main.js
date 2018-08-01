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
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const debug_1 = require("../libs/debug");
const dynamolo_1 = require("../libs/dynamolo");
const resx_1 = require("./resx");
const parsersSet = {};
dynamolo_1.dynamolo(path_1.default.join(__dirname, './parser/'), impCompiler => Array.isArray(impCompiler.extension) ?
    impCompiler.extension.forEach(ext => parsersSet[ext] = impCompiler) :
    parsersSet[impCompiler.extension] = impCompiler);
function preparseFile(siteName, sourceFilePath, targetPath, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const ext = path_1.default.extname(sourceFilePath).substring(1);
        let ctype = {
            isPartial: false,
            type: "site-resx" //TODO: set default (images etc...)
        };
        if (ext in parsersSet) {
            ctype = parsersSet[ext].preparse(sourceFilePath);
        }
        return yield resx_1.IoResxManager.instance.create(siteName, sourceFilePath, targetPath, outputPath, ctype);
    });
}
exports.preparseFile = preparseFile;
function parseFile(fn) {
    if (!fn.src.ext) {
        debug_1._logError("File without ext", fn.src.fullPath);
        return;
    }
    debug_1._logInfo(` PARSING: "${fn.src.fullPath}"`);
    const ext = fn.src.ext.substring(1);
    if (ext in parsersSet) {
        parsersSet[ext].parse(fn);
    }
}
exports.parseFile = parseFile;
function precompileFile(fn) {
    debug_1._logInfo(` PRE-COMPILING: "${fn.src.fullPath}"`);
    const ext = fn.src.ext.substring(1);
    if (ext in parsersSet) {
        parsersSet[ext].precompile(fn);
    }
}
exports.precompileFile = precompileFile;
function fnCtxMustBeCompiled(fn) {
    //TODO: may always want to compile some extensions (scss, etcc) -> type "build-resx"
    if (fn.stats.needsBuild) {
        return true;
    }
    //TODO: check all dependancies (lang, json, ... etc)
    return fn.relations && fn.relations
        .some(relation => fnCtxMustBeCompiled(relation.fn));
}
function compileFile(fn, forceCompile = false) {
    return __awaiter(this, void 0, void 0, function* () {
        debug_1._logInfo(` COMPILING: "${fn.src.fullPath}"`);
        if (!forceCompile && !fnCtxMustBeCompiled(fn)) {
            debug_1._logInfo("\t\tSkipped because existing not outdated!");
            return null;
        }
        const ext = fn.src.ext.substring(1);
        let content = null;
        if (ext in parsersSet) {
            const parser = parsersSet[ext];
            content = yield parser.compile(fn);
        }
        return content;
    });
}
exports.compileFile = compileFile;
function aftercompile(fn, content) {
    const ext = fn.src.ext.substring(1);
    let aftercompiledContent = null;
    if (ext in parsersSet) {
        const parser = parsersSet[ext];
        aftercompiledContent = parser.aftercompile(fn, content);
    }
    return (aftercompiledContent || content || "").toString();
}
exports.aftercompile = aftercompile;
function prepersist(fn, content) {
    if (content) {
        fn.www.hash = crypto_1.default
            .createHash('md5')
            .update(content.toString())
            .digest("hex");
    }
}
exports.prepersist = prepersist;
//# sourceMappingURL=main.js.map