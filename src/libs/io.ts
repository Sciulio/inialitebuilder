import * as fs from 'fs';
import * as path from "path";

import * as _ from "lodash";

//import { setValue } from './obj';
//import { constants } from "../constants";


export type tFileInfo = {
  name: string,
  path: string,
  fullName: string,
  fullPath:  string,
  ext: string,
  relPath: string,
  outPath: string,
  outFullPath: string
}

export type tDictionary = {
  [path: string]: string|tDictionary;
  //_relPath: string;
};

/* function fileInfo(id: string = '') {
  return (fullPath: string) => {
    const fullName = path.basename(fullPath);
    //const relPath = path.relative(constants.game.path, fullPath);
    const relPath = path.relative(constants.template.path, fullPath);
    const outFullPath = path.join(constants.build.lotteries.path, id, relPath)
    .split(path.sep)
    .filter(seg => seg[0] != '_')
    .join(path.sep);

    return <tFileInfo>{
      name: fullName.replace(/\.[^/.]+$/, ""),
      path: path.dirname(fullPath),
      fullName,
      fullPath,
      ext: path.extname(fullPath),
      relPath,
      outPath: path.dirname(outFullPath),
      outFullPath
    };
  }
}*/

export function getFilesRecusively(recursive: boolean, ...paths: string[]): string[];
export function getFilesRecusively(...paths: string[]): string[];
export function getFilesRecusively(...args: any[]): string[] {
  let recursive: boolean = true;
  let paths: string[] = args;

  if (args[0] == false || args[0] == true) {
    recursive = args[0];
    paths.shift();
  }

  const dir = path.join.apply(path, paths);
  let res = fs.readdirSync(dir);

  if (recursive) {
    res = res.reduce((files: string[], file: string) => {
      const name = path.join(dir, file);
      const isDirectory = fs.statSync(name).isDirectory();
      return isDirectory ? [...files, ...getFilesRecusively(name)] : [...files, name];
    }, []);
  }

  return res;
}

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