"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const debug_1 = require("../libs/debug");
const resx_1 = require("./resx");
const dynamolo_1 = require("../libs/dynamolo");
const parsersSet = {};
dynamolo_1.dynamolo(path_1.default.join(__dirname, './parser/'), impCompiler => parsersSet[impCompiler.extension] = impCompiler);
/*
parsersSet[pHbs.extension] = pHbs;
parsersSet[pHtml.extension] = pHtml;
parsersSet[pJson.extension] = pJson;
parsersSet[pLang.extension] = pLang;
*/
function parseFN(fn) {
    if (!fn.src.ext) {
        debug_1._logError("File without ext", fn.src.fullPath);
        return;
    }
    debug_1._logInfo(` PARSING: "${fn.src.fullPath}"`);
    const ext = fn.src.ext.substring(1);
    resx_1.IoResxManager.instance.add(fn);
    if (ext in parsersSet) {
        parsersSet[ext].parse(fn);
    }
}
exports.parseFN = parseFN;
function precompileFile(fn) {
    debug_1._logInfo(` PRE-COMPILING: "${fn.src.fullPath}"`);
    const ext = fn.src.ext.substring(1);
    if (ext in parsersSet) {
        parsersSet[ext].precompile(fn);
    }
}
exports.precompileFile = precompileFile;
function fnCtxMustBeCompiled(fn) {
    //TODO: may want to compile some extensions always (scss, etcc)
    //if (fnMustBeCompiled(fn)) {
    if (fn.stats.needsBuild) {
        return true;
    }
    //TODO: check all dependancies (lang, json, ... etc)
    const fnCtx = resx_1.IoResxManager.instance.getCtxByFn(fn);
    if (fnCtx.layout) {
        const fnLayout = resx_1.IoResxManager.instance.fnItem(fn => fn.src.fullPathNoExt == fnCtx.layout);
        if (fnLayout && fnCtxMustBeCompiled(fnLayout)) {
            return true;
        }
    }
    if (fnCtx.partials) {
        if (fnCtx.partials.some(_partial => {
            const fnPartial = resx_1.IoResxManager.instance.fnItem(fn => fn.src.fullPathNoExt == _partial);
            return fnPartial && fnCtxMustBeCompiled(fnPartial);
        })) {
            return true;
        }
    }
    return false;
}
function compileFile(fn, forceCompile = false) {
    debug_1._logInfo(` COMPILING: "${fn.src.fullPath}"`);
    if (!forceCompile && !fnCtxMustBeCompiled(fn)) {
        debug_1._logInfo("\t\tSkipped because existing not outdated!");
        return false;
    }
    const ext = fn.src.ext.substring(1);
    let content = null;
    if (ext in parsersSet) {
        const parser = parsersSet[ext];
        content = parser.compile(fn);
        if (parser.persist) {
            resx_1.persistFile(fn, content);
        }
    }
    else {
        resx_1.copyFile(fn);
    }
    return content;
}
exports.compileFile = compileFile;
class CompilerManager {
    constructor() { }
    static get instance() {
        return CompilerManager._instance;
    }
    get stats() {
        return this._stats;
    }
    start(outputRoot) {
        const compilationStatsPath = path_1.default.join(outputRoot, "compilationStats.json");
        const _stats = this._stats = {};
        if (fs_1.default.existsSync(compilationStatsPath)) {
            _stats.previous = JSON.parse(fs_1.default.readFileSync(compilationStatsPath).toString());
        }
        else {
            _stats.previous = {};
        }
        _stats.previous.build = _stats.previous.build || 0;
        _stats.previous.started = _stats.previous.started || 0;
        _stats.previous.finished = _stats.previous.finished || 0;
        _stats.previous.files = _stats.previous.files || {};
        _stats.current = {
            build: _stats.previous.build + 1,
            started: Date.now(),
            finished: 0,
            files: {}
        };
    }
    stop(outputRoot) {
        const compilationStatsPath = path_1.default.join(outputRoot, "compilationStats.json");
        const _stats = this._stats;
        _stats.current.finished = Date.now();
        _stats.current.files = {};
        resx_1.IoResxManager.instance.fnList()
            .forEach(fn => _stats.current.files[fn.src.fullPath] = fn.stats.version);
        const content = JSON.stringify(_stats.current, null, 2);
        fs_1.default.writeFileSync(compilationStatsPath, content);
    }
}
CompilerManager._instance = new CompilerManager();
exports.CompilerManager = CompilerManager;
//# sourceMappingURL=main.js.map