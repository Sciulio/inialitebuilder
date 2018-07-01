"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getFilesRecusively(...args) {
    let recursive = true;
    let paths = args;
    if (args[0] == false || args[0] == true) {
        recursive = args[0];
        paths.shift();
    }
    const dir = path.join.apply(path, paths);
    let res = fs.readdirSync(dir);
    if (recursive) {
        res = res.reduce((files, file) => {
            const name = path.join(dir, file);
            const isDirectory = fs.statSync(name).isDirectory();
            return isDirectory ? [...files, ...getFilesRecusively(name)] : [...files, name];
        }, []);
    }
    return res;
}
exports.getFilesRecusively = getFilesRecusively;
/*export function folderToContextData(dir: string) {
  let res = {};

  getFilesRecusively(dir)
  .map(fileInfo())
  .filter(_file => _file.ext == ".json")
  .forEach(_file => {
    const content = fs.readFileSync(_file.fullPath).toString();
    const obj = JSON.parse(content);

    let props = path.relative(dir, _file.fullPath).split(path.sep); //.join(".");
    props.push(_file.name);
    props = props.filter(prop => prop[0] != "_");

    setValue(res, props, obj);
  });

  return res;
}

export function getFolderDictionary(_files: string[], rootPath = ""): tDictionary {
  let fDict: tDictionary = { };

  _files
  .map(fileInfo())
  .filter(_file => _file.fullName != "__wrap_.hbs")
  .forEach(_file => {
    let _fileSet = fDict;
    const segmentsList = _file.fullPath.split(path.sep);

    segmentsList
    .forEach((seg, idx) => {
      if (idx == segmentsList.length - 1) {
        _fileSet[seg] = _file.fullPath;
      } else {
        _fileSet = (_fileSet[seg] || (_fileSet[seg] = { })) as tDictionary;
      }
    });
  });
  
  return _.get(fDict, rootPath) as tDictionary;
}*/ 
//# sourceMappingURL=io.js.map