import fs from 'fs';

import { _logInfo } from "../../../libs/debug";
import { tFileNaming } from '../../resx';
import { NoOp, tCompilerExport, tCompileType } from '../base';
import CleanCss from 'clean-css';


const parsedCache: {[srcFullPath: string]: string} = {};

function preparse(sourceFilePath: string): tCompileType {
  return {
    isPartial: false,
    type: "compilable"
  };
};
function parse(fn: tFileNaming) {
  _logInfo("\tParsing CSS"); //, fn.src.fullPath);

  if (fn.src.fullPath in parsedCache) {
    return;
  }
  
  const content = fs.readFileSync(fn.src.fullPath).toString();
  parsedCache[fn.src.fullPath] = content;
}

async function compile(fn: tFileNaming) {
  _logInfo("\tCompiling SASS/SCSS");

  return parsedCache[fn.src.fullPath].toString();
}

const ccss = new CleanCss({
  inliner: true,
});
function aftercompile(fn: tFileNaming, content: string) {
  return ccss.minify(content).styles;
}

export default {
  extension: "css",
  //persist: false,
  preparse,
  parse,
  precompile: NoOp,
  compile,
  aftercompile
} as tCompilerExport;