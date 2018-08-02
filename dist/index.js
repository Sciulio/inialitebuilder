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
require("async-extensions");
const debug_1 = require("./libs/debug");
const io_1 = require("./libs/io");
const main_1 = require("./compiler/main");
const config_1 = require("./libs/config");
const audit_1 = require("./libs/audit");
function start() {
    const config = config_1.loadConfiguration();
    debug_1._log("Configs:");
    debug_1._log(config);
    debug_1._logSeparator();
    //CompilerManager.instance.start(config.output.root);
    return config;
}
function end(config) {
    //CompilerManager.instance.stop(config.output.root);
}
function doPhase(phaseName, siteName) {
    const config = start();
    if (!(phaseName in config.phases)) {
        debug_1._logError(`Phase passed "${phaseName}" is not existent!`);
        return;
    }
    const phase = config.phases[phaseName];
    end(config);
}
exports.doPhase = doPhase;
function build(outputPhase) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield _build(outputPhase);
        }
        catch (e) {
            debug_1._logError(e);
        }
    });
}
exports.build = build;
function _logException(err, item, idx) {
    debug_1._logError(idx, item.src ? item.src.fullPath : item, err);
    return null;
    // throw => to end execution
}
function _build(outputPhase) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = start();
        //TODO: make this async
        yield config.target.sites
            .mapAsync((siteName) => __awaiter(this, void 0, void 0, function* () {
            //CompilerManager.instance.building(siteName);
            yield audit_1.initDb(siteName);
            const targetPath = path_1.default.join(config.target.root, siteName);
            const outputPath = path_1.default.join(config.output.root, siteName);
            debug_1._log(siteName, targetPath, outputPath);
            debug_1._logSeparator();
            const sourceFileSet = yield io_1.getFilesRecusively(targetPath);
            debug_1._log(sourceFileSet);
            debug_1._logInfo("PreParsing FileSet -----------------------------------------------------");
            const namedFileSet = yield sourceFileSet
                .mapAsync((sourceFilePath) => __awaiter(this, void 0, void 0, function* () { return yield main_1.preparseFile(siteName, sourceFilePath, targetPath, outputPath); }), _logException);
            debug_1._logInfo("Parsing FileSet -----------------------------------------------------");
            namedFileSet
                .map(main_1.parseFile);
            debug_1._logInfo("Precompile FileSet -----------------------------------------------------");
            namedFileSet
                .forEach(main_1.precompileFile);
            //TODO: use streams where possible for compiled content
            debug_1._logInfo("Compile FileSet -----------------------------------------------------");
            const compiledSet = yield namedFileSet
                .filter(fn => fn.fileName[0] != '_')
                .mapAsync((fn) => __awaiter(this, void 0, void 0, function* () {
                let content = yield main_1.compileFile(fn);
                return {
                    fn,
                    content: yield main_1.aftercompile(fn, content)
                };
            }), _logException);
            debug_1._logInfo("Aftercompile -----------------------------------------------------");
            yield compiledSet
                .forEachAsync((cItem) => __awaiter(this, void 0, void 0, function* () {
                cItem.content = main_1.aftercompile(cItem.fn, cItem.content);
            }));
            debug_1._logInfo("Prepersisting and Persisting FileSet -----------------------------------------------------");
            yield compiledSet
                .forEachAsync((cItem) => __awaiter(this, void 0, void 0, function* () {
                yield main_1.prepersist(cItem.fn, cItem.content);
                yield main_1.persist(cItem.fn, cItem.content);
                yield main_1.afterpersist(cItem.fn);
            }));
            yield audit_1.disposeDb(siteName);
        }));
        end(config);
    });
}
;
//# sourceMappingURL=index.js.map