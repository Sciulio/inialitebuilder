import fs from 'fs';

import { _logInfo } from "../../../libs/debug";
import { tFileNaming } from '../../resx';
import { NoOp, tCompilerExport, tCompileType, tCompilerExportContent } from '../base';


const parsedCache: {[srcFullPath: string]: {}} = {};

function preparse(sourceFilePath: string): tCompileType {
  return {
    isPartial: false,
    type: "build-resx"
  };
};
function parse(fn: tFileNaming) {
  _logInfo("\tParsing LANG"); //, fn.srcFullPath);

  if (fn.src.fullPath in parsedCache) {
    return;
  }

  const content = fs.readFileSync(fn.src.fullPath).toString();
  const data = JSON.parse(content);

  parsedCache[fn.src.fullPath] = data;
}

async function compile(fn: tFileNaming, ctx: any): Promise<tCompilerExportContent> {
  _logInfo("\tCompiling LANG", fn.src.fullPath);

  return Promise.resolve(parsedCache[fn.src.fullPath]);
}

export default {
  extension: "lang",
  //persist: false,
  preparse,
  parse,
  precompile: NoOp,
  compile,
  aftercompile: NoOp
} as tCompilerExport;