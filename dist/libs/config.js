"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const configFileName = "inia-config.json";
let _loadedConfiguration = null;
function loadConfiguration() {
    return _loadedConfiguration || (_loadedConfiguration = require(path_1.default.join(process.cwd(), configFileName)));
}
exports.loadConfiguration = loadConfiguration;
//# sourceMappingURL=config.js.map