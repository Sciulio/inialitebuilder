import fs from 'fs';

import lodash from 'lodash';

import { _logInfo, _logWarn } from "../../../libs/debug";
import { tFileNaming, IoResxManager } from '../../resx';
import { NoOp, tCompilerExport } from '../../parser/base';


const parsedCache: {[srcFullPath: string]: any} = {};

function parse(fn: tFileNaming) {
  _logInfo("\tParsing LANG"); //, fn.srcFullPath);

  if (fn.src.fullPath in parsedCache) {
    return;
  }

  const content = fs.readFileSync(fn.src.fullPath).toString();
  const data = JSON.parse(content);

  parsedCache[fn.src.fullPath] = data;
}

function compile(fn: tFileNaming, ctx: any) {
  _logInfo("\tCompiling LANG", fn.src.fullPath);

  return parsedCache[fn.src.fullPath];
}

export default {
  extension: "lang",
  persist: false,
  parse,
  precompile: NoOp,
  compile
} as tCompilerExport;