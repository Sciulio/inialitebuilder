import fs from 'fs';

import { _logInfo } from "../../../libs/debug";
import { tFileNaming } from '../../resx';
import { NoOp, tCompilerExport, tCompileType } from '../base';
import sass from 'node-sass';


const parsedCache: {[srcFullPath: string]: sass.Result} = {};

function preparse(sourceFilePath: string): tCompileType {
  return {
    isPartial: false,
    type: "compilable"
  };
};
function parse(fn: tFileNaming) {
  _logInfo("\tParsing SASS/SCSS"); //, fn.src.fullPath);

  if (fn.src.fullPath in parsedCache) {
    return;
  }

  const template = sass.renderSync({
    file: fn.src.fullPath,
  });

  parsedCache[fn.src.fullPath] = template;
}

function compile(fn: tFileNaming, ctx: any) {
  _logInfo("\tCompiling SASS/SCSS");

  return parsedCache[fn.src.fullPath].css.toString();
}

export default {
  extension: ["sass", "scss"],
  //persist: false,
  preparse,
  parse,
  precompile: NoOp,
  compile
} as tCompilerExport;