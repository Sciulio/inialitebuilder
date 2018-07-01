"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function dynamolo(_path, cback) {
    fs_1.default.readdirSync(_path)
        .map(_file => path_1.default.join(_path, _file))
        .filter(_filePath => fs_1.default.statSync(_filePath).isDirectory())
        .forEach(_filePath => {
        const indexModuleFilePath = path_1.default.join(_filePath, "main.js");
        console.log("Importing module: ", indexModuleFilePath);
        var importedModule = require(indexModuleFilePath);
        cback(importedModule.default);
    });
}
exports.dynamolo = dynamolo;
//# sourceMappingURL=dynamolo.js.map