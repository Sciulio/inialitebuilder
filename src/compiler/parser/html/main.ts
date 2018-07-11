import fs from 'fs';
import path from 'path';

import { _logInfo } from "../../../libs/debug";
import { tFileNaming } from '../../resx';
import { tCompilerExport, NoOp, tCompileType } from '../base';


const parsedCache: {[srcFullPath: string]: string} = {};

function preparse(sourceFilePath: string): tCompileType {
  return {
    isPartial: path.basename(sourceFilePath)[0] == '_',
    type: "compilable"
  };
};
function parse(fn: tFileNaming) {
  _logInfo("\tParsing  HTML"); //, fn.src.fullPath);

  if (fn.src.fullPath in parsedCache) {
    return;
  }

  const content = fs.readFileSync(fn.src.fullPath).toString();
  parsedCache[fn.src.fullPath] = content;
}

function compile(fn: tFileNaming) {
  _logInfo("\tCompiling HTML"); //, fn.src.fullPath);

  return parsedCache[fn.src.fullPath];
}

export default {
  extension: "html",
  //persist: true,
  preparse,
  parse,
  precompile: NoOp,
  compile
} as tCompilerExport;