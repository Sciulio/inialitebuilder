"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const debug_1 = require("./libs/debug");
const io_1 = require("./libs/io");
const main_1 = require("./compiler/main");
const resx_1 = require("./compiler/resx");
function start() {
    const config = require(path_1.default.join(process.cwd(), "inia-config.json"));
    debug_1._log("Configs:");
    debug_1._log(config);
    debug_1._logSeparator();
    main_1.CompilerManager.instance.start(config.output.root);
    return config;
}
function end(config) {
    main_1.CompilerManager.instance.stop(config.output.root);
}
function doPhase(phaseName, siteName) {
    const config = start();
    if (!(phaseName in config.phases)) {
        debug_1._logError(`Phase passed "${phaseName}" is not existent!`);
        return;
    }
    const phase = config.phases[phaseName];
    /*config.target.sites
    .filter(_siteName => !siteName || siteName == _siteName)
    .forEach(sitePath => {
      Object.keys(CompilerManager.instance.stats.current.files)
      .forEach(srcFileFullPath => {
        const srcFilePath = path.dirname(srcFileFullPath);
  
        mkdirSync(filePath);
        fs.copyFileSync(filePath, filePath);
      });
    });*/
    end(config);
}
exports.doPhase = doPhase;
function build(outputPhase) {
    const config = start();
    config.target.sites
        .forEach(sitePath => {
        const targetPath = path_1.default.join(config.target.root, sitePath);
        const outputPath = path_1.default.join(config.output.root, sitePath);
        debug_1._log(sitePath, targetPath, outputPath);
        debug_1._logSeparator();
        const sourceFileSet = io_1.getFilesRecusively(targetPath);
        debug_1._log(sourceFileSet);
        debug_1._logInfo("PreParsing FileSet -----------------------------------------------------");
        const namedFileSet = sourceFileSet
            .map(sourceFilePath => main_1.preparseFile(sourceFilePath, targetPath, outputPath));
        //parseFileSet(namedFileSet);
        debug_1._logInfo("Parsing FileSet -----------------------------------------------------");
        namedFileSet
            .forEach(main_1.parseFile);
        //precompileFileSet();
        debug_1._logInfo("Precompile FileSet -----------------------------------------------------");
        resx_1.IoResxManager.instance.fnList()
            .forEach(main_1.precompileFile);
        debug_1._logInfo("Compile FileSet -----------------------------------------------------");
        const compiledSet = resx_1.IoResxManager.instance.fnList()
            .filter(fn => fn.fileName[0] != '_')
            .map(fn => {
            return {
                fn,
                content: main_1.compileFile(fn)
            };
        });
        debug_1._logInfo("Persisting FileSet -----------------------------------------------------");
        compiledSet
            .forEach(cItem => {
            switch (cItem.fn.cType.type) {
                case "compilable":
                    if (cItem.content) {
                        resx_1.persistFile(cItem.fn, cItem.content);
                    }
                    break;
                case "site-resx":
                    resx_1.copyFile(cItem.fn);
                    break;
                case "build-resx": break;
            }
        });
    });
    end(config);
}
exports.build = build;
;
//# sourceMappingURL=index.js.map