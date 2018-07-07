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
dynamolo_1.dynamolo(path_1.default.join(__dirname, './parser/'), impCompiler => Array.isArray(impCompiler.extension) ?
    impCompiler.extension.forEach(ext => parsersSet[ext] = impCompiler) :
    parsersSet[impCompiler.extension] = impCompiler);
/*
TODO
function getParserSet(ext: string) {
  if (ext in parsersSet) {
    return parsersSet[ext];
  }
}
*/
function preparseFile(sourceFilePath, targetPath, outputPath) {
    const ext = path_1.default.extname(sourceFilePath).substring(1);
    let ctype = {
        isPartial: false,
        type: "site-resx" //TODO: set default (images etc...)
    };
    if (ext in parsersSet) {
        ctype = parsersSet[ext].preparse(sourceFilePath);
    }
    return resx_1.toFileNaming(sourceFilePath, targetPath, outputPath, ctype);
}
exports.preparseFile = preparseFile;
function parseFile(fn) {
    if (!fn.src.ext) {
        debug_1._logError("File without ext", fn.src.fullPath);
        return;
    }
    resx_1.IoResxManager.instance.add(fn);
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
        return null;
    }
    const ext = fn.src.ext.substring(1);
    let content = null;
    if (ext in parsersSet) {
        const parser = parsersSet[ext];
        content = parser.compile(fn);
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
    updateFileVersion(srcRoot, relPath, needsNewVersion) {
        const _stats = this._stats;
        if (!_stats) {
            throw Error("CICCIO");
        }
        const prev_siteStatItem = _stats.previous.sites[srcRoot] || (_stats.previous.sites[srcRoot] = {});
        const prev_siteStatItemItem = prev_siteStatItem[relPath] || (prev_siteStatItem[relPath] = {
            version: 0
        });
        const prev_version = prev_siteStatItemItem.version || 0;
        const curr_siteStatItem = _stats.current.sites[srcRoot] || (_stats.current.sites[srcRoot] = {});
        if (relPath in curr_siteStatItem) {
            return curr_siteStatItem[relPath];
        }
        return curr_siteStatItem[relPath] = {
            version: prev_version + (needsNewVersion ? 1 : 0)
        };
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
        _stats.previous.sites = _stats.previous.sites || {};
        _stats.current = {
            build: _stats.previous.build + 1,
            started: Date.now(),
            finished: 0,
            sites: {}
        };
    }
    stop(outputRoot) {
        const compilationStatsPath = path_1.default.join(outputRoot, "compilationStats.json");
        const _stats = this._stats;
        _stats.current.finished = Date.now();
        const content = JSON.stringify(_stats.current, null, 2);
        fs_1.default.writeFileSync(compilationStatsPath, content);
    }
}
CompilerManager._instance = new CompilerManager();
exports.CompilerManager = CompilerManager;
//# sourceMappingURL=main.js.map