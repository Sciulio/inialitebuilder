import fs from 'fs';

import { _logInfo } from "../../../libs/debug";
import { tFileNaming } from '../../resx';
import { NoOp, tCompilerExport, tCompileType, tCompilerExportContent } from '../base';
import sass from 'node-sass';
import CleanCss from 'clean-css';


const ccss = new CleanCss({
  inliner: true,
});

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

async function compile(fn: tFileNaming) {
  _logInfo("\tCompiling SASS/SCSS");

  return parsedCache[fn.src.fullPath].css.toString();
}

function aftercompile(fn: tFileNaming, cExpContent: tCompilerExportContent): tCompilerExportContent {
  if (!cExpContent) {
    return cExpContent;
  }
  if (Array.isArray(cExpContent)) {
    return cExpContent
    .map(content => ccss.minify(content).styles);
  }
  return ccss.minify(cExpContent).styles;
}

export default {
  extension: ["sass", "scss"],
  //persist: false,
  preparse,
  parse,
  precompile: NoOp,
  compile,
  aftercompile
} as tCompilerExport;