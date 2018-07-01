import path from 'path';
import fs from 'fs';


export function dynamolo<T>(_path: string, cback: (def: T) => void) {
  fs.readdirSync(_path)
  .map(_file => path.join(_path, _file))
  .filter(_filePath => fs.statSync(_filePath).isDirectory())
  .forEach(_filePath => {
    const indexModuleFilePath = path.join(_filePath, "main.js");
    console.log("Importing module: ", indexModuleFilePath);

    var importedModule = require(indexModuleFilePath);
    cback(importedModule.default);
  })
}