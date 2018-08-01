import fs from 'fs';
import path from 'path';

import { minify } from "html-minifier";

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

async function compile(fn: tFileNaming) {
  _logInfo("\tCompiling HTML"); //, fn.src.fullPath);

  return parsedCache[fn.src.fullPath];
}

function aftercompile(fn: tFileNaming, content: string) {
  //TODO: load config

  return minify(content, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    preserveLineBreaks: true,
    removeComments: true
  });
}

export default {
  extension: "html",
  //persist: true,
  preparse,
  parse,
  precompile: NoOp,
  compile,
  aftercompile
} as tCompilerExport;