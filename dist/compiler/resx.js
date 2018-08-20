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
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const mkpath_1 = __importDefault(require("mkpath"));
const audit_1 = require("../libs/audit");
const debug_1 = require("../libs/debug");
const __1 = require("..");
exports.oMergeResx = {
    json: {
        ext: "json",
        keyProp: "data"
    },
    lang: {
        ext: "lang",
        keyProp: "locale"
    }
};
//TODO: add this to compilers
const converter = {
    ".hbs": ".html",
    ".md": ".html",
    ".sass": ".css",
    ".scss": ".css"
};
function toFileNaming(siteName, src_fullPath, targetPath, outputPath, cType) {
    return __awaiter(this, void 0, void 0, function* () {
        src_fullPath = path_1.default.normalize(src_fullPath);
        const srcFileName = path_1.default.basename(src_fullPath);
        const fileName = srcFileName.substring(0, srcFileName.indexOf("."));
        const srcPath = path_1.default.dirname(src_fullPath);
        const srcExt = path_1.default.extname(srcFileName);
        const relPath = path_1.default.relative(targetPath, src_fullPath);
        const outFileName = srcExt in converter ?
            srcFileName.replace(srcExt, converter[srcExt]) :
            srcFileName; //TODO
        const srcAbsolutePath = path_1.default.relative(targetPath, srcPath);
        const outPath = path_1.default.join(outputPath, srcAbsolutePath);
        const out_fullPath = path_1.default.join(outPath, outFileName);
        const out_fullPathNoExt = path_1.default.join(outPath, fileName);
        const needsBuildAndVersion = (yield fnMustBeCompiled(siteName, out_fullPath, src_fullPath, cType));
        const needsBuild = !!needsBuildAndVersion || needsBuildAndVersion == null;
        const needsNewVersion = !!needsBuildAndVersion;
        const fileAudit = yield audit_1.fileLastAudit(siteName, src_fullPath);
        const version = fileAudit ? fileAudit.version + (needsNewVersion ? 1 : 0) : 0;
        //_log(src_fullPath, targetPath, outputPath, outPath)
        const tfnRes = {
            siteName,
            fileName,
            relPath,
            cType,
            stats: {
                needsBuild,
                needsNewVersion,
                version
            },
            relations: [],
            src: {
                fileName: srcFileName,
                ext: srcExt,
                path: srcPath,
                fullPath: src_fullPath,
                fullPathNoExt: path_1.default.join(srcPath, fileName),
                root: targetPath
            },
            out: {
                fileName: outFileName,
                ext: path_1.default.extname(outFileName),
                path: outPath,
                fullPath: out_fullPath,
                fullPathNoExt: out_fullPathNoExt,
                root: outputPath
            },
            www: {
                isPartial: cType.isPartial,
                url: "/" + encodeURI(path_1.default.relative(outputPath, out_fullPath).replace(/\\/g, '/')),
                has: {}
            }
        };
        return tfnRes;
    });
}
function fnMustBeCompiled(siteName, out_fullPath, src_fullPath, ctype) {
    return __awaiter(this, void 0, void 0, function* () {
        const outExists = fs_1.default.existsSync(out_fullPath);
        //const outExists = (await fse.ex.ensureFile(.exists(out_fullPath));
        //const srcStats = fs.statSync(src_fullPath);
        const srcStats = (yield fs_extra_1.default.stat(src_fullPath));
        const srcLastEditTime = srcStats.mtimeMs || srcStats.ctimeMs;
        let outLastEditTime = 0;
        if (outExists) {
            const outStats = (yield fs_extra_1.default.stat(out_fullPath));
            outLastEditTime = outStats.mtimeMs || outStats.ctimeMs;
        }
        else {
            const lastFileAudit = yield audit_1.fileLastAudit(siteName, src_fullPath);
            outLastEditTime = lastFileAudit ? lastFileAudit._on : 0;
        }
        if (ctype.type == "build-resx") {
            // needs build but new version only if edited, otherwise no new version
            return (srcLastEditTime > outLastEditTime) || null;
        }
        return srcLastEditTime > outLastEditTime;
    });
}
function multiLanguageFileNameStrategy(fullPath, locale) {
    const bCtx = __1.currentBuildingContext();
    const isDefaultLocale = bCtx.siteConfig.locale[0] == locale;
    if (isDefaultLocale) {
        return fullPath;
    }
    return fullPath + "." + locale;
}
exports.multiLanguageFileNameStrategy = multiLanguageFileNameStrategy;
//TODO: localized filename strategy
function persistCompilerExportContent(fn, cExpcExpContent) {
    return __awaiter(this, void 0, void 0, function* () {
        debug_1._logInfo("\tPersisting:", fn.src.fullPath);
        mkpath_1.default.sync(fn.out.path);
        if (Array.isArray(cExpcExpContent)) {
            // localizable content
            yield __1.currentBuildingContext().siteConfig.locale
                .forEachAsync((locale, idx) => __awaiter(this, void 0, void 0, function* () { return yield fs_extra_1.default.writeFile(multiLanguageFileNameStrategy(fn.out.fullPath, locale), cExpcExpContent[idx]); }));
        }
        else {
            yield fs_extra_1.default.writeFile(fn.out.fullPath, cExpcExpContent);
        }
    });
}
exports.persistCompilerExportContent = persistCompilerExportContent;
function copyCompilerExportContent(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        debug_1._logInfo("\tCopying:", fn.src.fullPath);
        mkpath_1.default.sync(fn.out.path);
        if (fn.www.has[exports.oMergeResx.lang.keyProp]) {
            // localizable content
            yield __1.currentBuildingContext().siteConfig.locale
                .forEachAsync((locale, idx) => __awaiter(this, void 0, void 0, function* () { return fs_extra_1.default.copy(fn.src.fullPath, multiLanguageFileNameStrategy(fn.out.fullPath, locale)); }));
        }
        else {
            yield fs_extra_1.default.copy(fn.src.fullPath, fn.out.fullPath);
        }
    });
}
exports.copyCompilerExportContent = copyCompilerExportContent;
function toRootRelPath(fn, relPath) {
    const absPath = path_1.default.resolve(fn.src.path, relPath);
    return path_1.default.relative(process.cwd(), absPath);
}
exports.toRootRelPath = toRootRelPath;
//export class LocalizationManager {}
class IoResxManager {
    constructor() {
        this.items = [];
    }
    static get instance() {
        return IoResxManager._instance;
    }
    create(siteName, src_fullPath, targetPath, outputPath, cType) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.add(yield toFileNaming(siteName, src_fullPath, targetPath, outputPath, cType));
        });
    }
    add(fn) {
        this.items.push(fn);
        return fn;
    }
    fnItem(filter = () => true) {
        return this.fnList(filter)[0];
    }
    fnList(filter = () => true) {
        return this.items
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
            .filter(fn => fn.src.ext == ext)
            .filter(filter);
    }
}
IoResxManager._instance = new IoResxManager();
exports.IoResxManager = IoResxManager;
//# sourceMappingURL=resx.js.map