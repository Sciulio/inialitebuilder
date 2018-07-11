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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
function getFilesRecusively(...args) {
    return __awaiter(this, void 0, void 0, function* () {
        let recursive = true;
        let paths = args;
        if (args[0] == false || args[0] == true) {
            recursive = args[0];
            paths.shift();
        }
        const dir = path.join.apply(path, paths);
        //let res = fs.readdirSync(dir);
        let res = yield fs_extra_1.default.readdir(dir);
        if (recursive) {
            res = yield res
                .reduce((p_files, file) => __awaiter(this, void 0, void 0, function* () {
                const files = yield p_files;
                const name = path.join(dir, file);
                //const isDirectory = fs.statSync(name).isDirectory();
                const isDirectory = (yield fs_extra_1.default.stat(name)).isDirectory();
                return isDirectory ? [...files, ...yield getFilesRecusively(name)] : [...files, name];
            }), Promise.resolve([]));
        }
        return res;
    });
}
exports.getFilesRecusively = getFilesRecusively;
//# sourceMappingURL=io.js.map