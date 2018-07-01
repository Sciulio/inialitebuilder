import fs from 'fs';

import { _logInfo } from "../../../libs/debug";
import { tFileNaming } from '../../resx';
import { tCompilerExport, NoOp } from '../../parser/base';


const parsedCache: {[srcFullPath: string]: string} = {};

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
  persist: true,
  parse,
  precompile: NoOp,
  compile
} as tCompilerExport;