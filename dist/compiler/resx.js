"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mkpath_1 = __importDefault(require("mkpath"));
const debug_1 = require("../libs/debug");
const main_1 = require("./main");
const converter = {
    ".hbs": ".html",
    ".md": ".html"
};
function toFileNaming(src_fullPath, targetPath, outputPath) {
    src_fullPath = path_1.default.normalize(src_fullPath);
    const srcFileName = path_1.default.basename(src_fullPath);
    const fileName = srcFileName.substring(0, srcFileName.indexOf("."));
    const srcPath = path_1.default.dirname(src_fullPath);
    const srcExt = path_1.default.extname(srcFileName);
    const outFileName = srcExt in converter ?
        srcFileName.replace(srcExt, converter[srcExt]) :
        srcFileName; //TODO
    //const outPath = path.join(config.output.path, srcPath);
    const srcAbsolutePath = path_1.default.relative(targetPath, srcPath);
    const outPath = path_1.default.join(outputPath, srcAbsolutePath);
    const out_fullPath = path_1.default.join(outPath, outFileName);
    const out_fullPathNoExt = path_1.default.join(outPath, fileName);
    const isPartial = fileName[0] == "_";
    const needsBuild = fnMustBeCompiled(out_fullPath, src_fullPath, isPartial);
    debug_1._log(src_fullPath, targetPath, outputPath, outPath);
    const tfnRes = {
        fileName,
        stats: {
            needsBuild,
            version: (main_1.CompilerManager.instance.stats.previous.files[src_fullPath] || 0) + (needsBuild ? 1 : 0)
        },
        src: {
            fileName: srcFileName,
            ext: srcExt,
            path: srcPath,
            fullPath: src_fullPath,
            fullPathNoExt: path_1.default.join(srcPath, fileName),
        },
        out: {
            fileName: outFileName,
            ext: path_1.default.extname(outFileName),
            path: outPath,
            fullPath: out_fullPath,
            fullPathNoExt: out_fullPathNoExt
        },
        www: {
            isPartial,
            url: "/" + encodeURI(path_1.default.relative(outPath, out_fullPathNoExt))
        }
    };
    debug_1._log(tfnRes);
    return tfnRes;
}
exports.toFileNaming = toFileNaming;
function toFileNamingSet(sourceFileSet, targetPath, outputPath) {
    debug_1._logInfo("ToNaming FileSet -----------------------------------------------------");
    return sourceFileSet
        .map(sourceFilePath => toFileNaming(sourceFilePath, targetPath, outputPath));
}
exports.toFileNamingSet = toFileNamingSet;
//export function fnMustBeCompiled(fn: tFileNaming) {
function fnMustBeCompiled(out_fullPath, src_fullPath, isPartial) {
    //const outExists = fs.existsSync(fn.out.fullPath);
    const outExists = fs_1.default.existsSync(out_fullPath);
    //if (!fn.www.isPartial && !outExists) {
    if (!isPartial && !outExists) {
        return true;
    }
    //const srcStats = fs.statSync(fn.src.fullPath);
    const srcStats = fs_1.default.statSync(src_fullPath);
    const srcLastEditTime = srcStats.mtimeMs || srcStats.ctimeMs;
    let outLastEditTime = 0;
    if (outExists) {
        //const outStats = fs.statSync(fn.out.fullPath);
        const outStats = fs_1.default.statSync(out_fullPath);
        outLastEditTime = outStats.mtimeMs || outStats.ctimeMs;
    }
    else {
        outLastEditTime = main_1.CompilerManager.instance.stats.previous.finished;
    }
    return srcLastEditTime > outLastEditTime;
}
exports.fnMustBeCompiled = fnMustBeCompiled;
function persistFile(fn, content) {
    debug_1._logInfo("\tPersisting:", fn.src.fullPath);
    mkpath_1.default.sync(fn.out.path);
    fs_1.default.writeFileSync(fn.out.fullPath, content);
}
exports.persistFile = persistFile;
function copyFile(fn) {
    debug_1._logInfo("\tCopying:", fn.src.fullPath);
    mkpath_1.default.sync(fn.out.path);
    fs_1.default.copyFileSync(fn.src.fullPath, fn.out.fullPath);
}
exports.copyFile = copyFile;
function toRootRelPath(fn, relPath) {
    const absPath = path_1.default.resolve(fn.src.path, relPath);
    return path_1.default.relative(process.cwd(), absPath);
}
exports.toRootRelPath = toRootRelPath;
class IoResxManager {
    constructor() {
        this.items = [];
    }
    static get instance() {
        return IoResxManager._instance;
    }
    add(fn) {
        this.items.push({ fn });
    }
    fnItem(filter = () => true) {
        return this.fnList(filter)[0];
    }
    fnList(filter = () => true) {
        return this.items
            .map(item => item.fn)
            .filter(filter);
    }
    fnItemByExt(ext, filter = () => true) {
        return this.fnListByExt(ext, filter)[0];
    }
    fnListByExt(ext, filter = () => true) {
        if (ext[0] !== '.') {
            ext = '.' + ext;
        }
        return this.items
            .filter(item => item.fn.src.ext == ext)
            .map(item => item.fn)
            .filter(filter);
    }
    getCtxByFn(fn) {
        return this.items.filter(ctx => ctx.fn == fn)[0];
    }
    addLayoutTo(fn, scrFullPath) {
        const ctx = this.getCtxByFn(fn);
        if (ctx) {
            ctx.layout = scrFullPath;
        }
        else {
            debug_1._logError("Not found context for:", fn.src.fullPath, scrFullPath);
        }
    }
    addPartialTo(fn, scrFullPath) {
        const ctx = this.getCtxByFn(fn);
        if (ctx) {
            (ctx.partials || (ctx.partials = [])).push(scrFullPath);
        }
        else {
            debug_1._logError("Not found context for:", fn.src.fullPath, scrFullPath);
        }
    }
}
IoResxManager._instance = new IoResxManager();
exports.IoResxManager = IoResxManager;
//# sourceMappingURL=resx.js.map