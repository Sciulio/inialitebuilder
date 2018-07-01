import fs from 'fs';

import lodash from 'lodash';

import { _logInfo } from "../../../libs/debug";
import { tFileNaming, IoResxManager } from '../../resx';
import { NoOp, tCompilerExport } from '../../parser/base';


const parsedCache: {[srcFullPath: string]: any} = {};

function parse(fn: tFileNaming) {
  _logInfo("\tParsing JSON"); //, fn.src.fullPath);

  if (fn.src.fullPath in parsedCache) {
    return;
  }

  const content = fs.readFileSync(fn.src.fullPath).toString();
  const data = JSON.parse(content);

  parsedCache[fn.src.fullPath] = data;
}

function compile(fn: tFileNaming, ctx: any) {
  _logInfo("\tCompiling JSON"); //, fn.src.fullPath);

  return parsedCache[fn.src.fullPath];
}

export default {
  extension: "json",
  persist: false,
  parse,
  precompile: NoOp,
  compile
} as tCompilerExport;