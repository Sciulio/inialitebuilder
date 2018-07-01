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
function build() {
    //(require as any).main.filename
    const config = require(path_1.default.join(process.cwd(), "inia-config.json"));
    debug_1._log("Configs:");
    debug_1._log(config);
    debug_1._logSeparator();
    main_1.CompilerManager.instance.start(config.output.root);
    config.target.sites
        .forEach(sitePath => {
        const targetPath = path_1.default.join(config.target.root, sitePath);
        const outputPath = path_1.default.join(config.output.root, sitePath);
        debug_1._log(sitePath, targetPath, outputPath);
        debug_1._logSeparator();
        const sourceFileSet = io_1.getFilesRecusively(targetPath);
        debug_1._log(sourceFileSet);
        const namedFileSet = resx_1.toFileNamingSet(sourceFileSet, targetPath, outputPath);
        //parseFileSet(namedFileSet);
        debug_1._logInfo("Parsing FileSet -----------------------------------------------------");
        namedFileSet.forEach(main_1.parseFN);
        //precompileFileSet();
        debug_1._logInfo("Precompile FileSet -----------------------------------------------------");
        resx_1.IoResxManager.instance.fnList().forEach(main_1.precompileFile);
        debug_1._logInfo("Compile FileSet -----------------------------------------------------");
        resx_1.IoResxManager.instance.fnList()
            .filter(fn => fn.fileName[0] != '_')
            .map(fn => main_1.compileFile(fn));
    });
    main_1.CompilerManager.instance.stop(config.output.root);
}
exports.build = build;
;
//# sourceMappingURL=index.js.map