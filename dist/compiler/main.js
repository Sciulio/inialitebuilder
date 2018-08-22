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
const fs_extra_1 = __importDefault(require("fs-extra"));
const dynamolo_1 = require("dynamolo");
const debug_1 = require("../libs/debug");
const resx_1 = require("./resx");
const __1 = require("..");
const parsersSet = {};
dynamolo_1.load(path_1.default.join(__dirname, './parser/*/main.js'), //'./parser/*/main.js',
//'./parser/*/main.js',
impCompiler => Array.isArray(impCompiler.extension) ?
    impCompiler.extension.forEach(ext => parsersSet[ext] = impCompiler) :
    parsersSet[impCompiler.extension] = impCompiler, {
    exportDefault: true,
    //rootPath: __dirname,
    logInfo: (...args) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
    logError: (...args) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
});
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
        fn.stats.built = true;
        const srcExt = fn.src.ext.substring(1);
        if (srcExt in parsersSet) {
            const parser = parsersSet[srcExt];
            return yield parser.compile(fn);
        }
        return null;
    });
}
exports.compileFile = compileFile;
function aftercompile(fn, cExpContent) {
    const ext = fn.src.ext.substring(1);
    let cExpContentAfter = null;
    if (ext in parsersSet) {
        const parser = parsersSet[ext];
        cExpContentAfter = parser.aftercompile(fn, cExpContent);
    }
    return cExpContentAfter || cExpContent;
}
exports.aftercompile = aftercompile;
function prepersist(fn, cExpContent) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
        switch (fn.cType.type) {
          case "build-resx": break;
          case "site-resx":
          case "compilable":
            //const content = await fse.readFile(fn.out.fullPath);
            if (content) {
              fn.www.hash = crypto
              .createHash('md5')
              .update(content.toString())
              .digest("hex");
            }
            break;
        }*/
    });
}
exports.prepersist = prepersist;
function persist(fn, cExpContent) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (fn.cType.type) {
            case "compilable":
                if (cExpContent && !fn.cType.isPartial) {
                    //TODO: accept Stream
                    yield resx_1.persistCompilerExportContent(fn, cExpContent);
                }
                break;
            case "site-resx":
                yield resx_1.copyCompilerExportContent(fn);
                break;
            case "build-resx": break;
        }
    });
}
exports.persist = persist;
function _afterpersist(fn, locale) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileFullPath = locale ? resx_1.multiLanguageFileNameStrategy(fn.out.fullPath, locale) : fn.out.fullPath;
        const content = yield fs_extra_1.default.readFile(fileFullPath);
        fn.www.hash = crypto_1.default
            .createHash('md5')
            .update(content)
            .digest("hex");
    });
}
function afterpersist(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO: improve this check
        if (fn.cType.type == "site-resx" || fn.cType.type == "compilable" && !fn.cType.isPartial) {
            const stats = yield fs_extra_1.default.stat(fn.out.fullPath);
            fn.stats.size = stats.size;
            if (fn.www.has[resx_1.oMergeResx.lang.keyProp]) {
                yield __1.currentBuildingContext().siteConfig.locale
                    .forEachAsync((locale) => __awaiter(this, void 0, void 0, function* () {
                    yield _afterpersist(fn, locale);
                }));
            }
            else {
                yield _afterpersist(fn);
            }
        }
    });
}
exports.afterpersist = afterpersist;
//# sourceMappingURL=main.js.map