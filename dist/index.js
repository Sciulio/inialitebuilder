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
            const config = start();
            yield config.target.sites
                .mapAsync((siteConfig) => __awaiter(this, void 0, void 0, function* () { return yield _build(siteConfig); }));
            end(config);
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
//TODO: add a building context
let _buildingContext;
function currentBuildingContext() {
    return _buildingContext;
}
exports.currentBuildingContext = currentBuildingContext;
function _build(siteConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        _buildingContext = {
            siteConfig,
            data: {}
        };
        const config = config_1.loadConfiguration();
        //CompilerManager.instance.building(siteName);
        yield audit_1.initDb(siteConfig.siteName);
        const targetPath = path_1.default.join(config.target.root, siteConfig.siteName);
        const outputPath = path_1.default.join(config.output.root, siteConfig.siteName);
        debug_1._log(siteConfig.siteName, targetPath, outputPath);
        debug_1._logSeparator();
        const sourceFileSet = yield io_1.getFilesRecusively(targetPath);
        debug_1._log(sourceFileSet);
        debug_1._logInfo("PreParsing FileSet -----------------------------------------------------");
        const namedFileSet = yield sourceFileSet
            .mapAsync((sourceFilePath) => __awaiter(this, void 0, void 0, function* () { return yield main_1.preparseFile(siteConfig.siteName, sourceFilePath, targetPath, outputPath); }), _logException);
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
            // update lastmodified if file does not need to be built but has been built because of related resources
            if (fn.stats.built && !fn.stats.needsBuild) {
                fn.www.lastModified = Date.now();
            }
            return {
                fn,
                content
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
        yield audit_1.disposeDb(siteConfig.siteName);
    });
}
;
//# sourceMappingURL=index.js.map