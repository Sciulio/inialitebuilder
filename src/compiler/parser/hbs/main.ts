import fs from 'fs';
import path from 'path';

import { _logInfo, _logWarn } from '../../../libs/debug';

import lodash from 'lodash';

import handlebars from "handlebars";
import './helpers/main';
import { TemplateDelegate } from 'handlebars';
import { tFileNaming, toRootRelPath, IoResxManager } from '../../resx';
import { tCompilerExport, tCompileType } from '../../parser/base';
import { compileFile } from '../../main';


var layouts = require('handlebars-layouts');
handlebars.registerHelper(layouts(handlebars));


export const parsers = {
  handlebars
};


const contentCache: {[srcFullPath: string]: string} = {};
const templateCache: {[srcFullPath: string]: TemplateDelegate} = {};


function parseToAbsPath(isLayout: boolean, fn: tFileNaming, content: string): string {
  let extRegexp: RegExp;
  let convertContent: (path: string) => string;

  //TODO: improve regex for '..."}}'
  if (isLayout) {
    extRegexp = /{{\s*#extend\s+"(.*?)"/ig;
    convertContent = (rootRelPath) => '{{#extend "' + rootRelPath + '"';
  } else {
    extRegexp = /{{\s*>\s+"??(.*?)\s+"??/ig;
    convertContent = (rootRelPath) => '{{> "' + rootRelPath + '"';
  }
  //TODO: block tag

  let match;
  while ((match = extRegexp.exec(content))) {
    const strip = match[0];
    const relPath = match[1].replace(/"/g, "");
    const rootRelPath = toRootRelPath(fn, relPath);
    
    content = content.replace(strip, convertContent(rootRelPath));

    if (isLayout) {
      IoResxManager.instance.addLayoutTo(fn, rootRelPath);
    } else {
      IoResxManager.instance.addPartialTo(fn, rootRelPath);
    }
  }

  return content;
}

function preparse(sourceFilePath: string): tCompileType {
  return {
    isPartial: path.basename(sourceFilePath)[0] == '_',
    type: "compilable"
  };
};
function parse(fn: tFileNaming) {
  _logInfo("\tParsing HBS"); //, fn.src.fullPath);

  let content = fs.readFileSync(fn.src.fullPath).toString();

  content = parseToAbsPath(true, fn, content);
  content = parseToAbsPath(false, fn, content);

  contentCache[fn.src.fullPath] = content;
}

function precompile(fn: tFileNaming) {
  _logInfo("\tPrecompile HBS");

  let content = contentCache[fn.src.fullPath];

  if (fn.src.fileName[0] == '_') { // is partial
    const partialName = fn.fileName[0] == "_" ?
      fn.src.fullPathNoExt :
      fn.fileName;
    
    if (fn.fileName == "_layout" || fn.fileName.indexOf("_layout_") == 0) {
      _logInfo(`\t\tRegistering layout: on "${fn.src.fullPath}" as '${partialName}'`);
    } else {
      _logInfo(`\t\tRegistering partial: on "${fn.src.fullPath}" as '${partialName}'`);
    }

    parsers.handlebars.registerPartial(partialName, content);
  } else {
    const template = parsers.handlebars.compile(content);
    templateCache[fn.src.fullPath] = template;
  }
}

const mergeResx = {
  json: {
    ext: "json",
    keyProp: "data"
  },
  lang: {
    ext: "lang",
    keyProp: "locale"
  }
}

function mergeResxData(fn: tFileNaming, ctx: any, mR: {ext: string, keyProp: string}) {
  const fnResx = IoResxManager.instance.fnItemByExt(
    mR.ext,
    fn_resx => fn_resx.src.path == fn.src.path && fn_resx.fileName == fn.fileName
  );
  if (fnResx) {
    _logWarn("\t\t\t\tmerging content for", fn.src.fullPath, "from", fnResx.src.fullPath);

    let cCtx = compileFile(fnResx, true);
    ctx[mR.keyProp] = lodash.merge(ctx[mR.keyProp] || {}, cCtx);
  }
}

function prepareRelateResxDate(srcFullPathNoExt: string, ctx: any) {
  const fnRelated = IoResxManager.instance.fnItem(_fnItem => _fnItem.src.fullPathNoExt == srcFullPathNoExt)
  
  mergeResxData(fnRelated, ctx, mergeResx.json);
  mergeResxData(fnRelated, ctx, mergeResx.lang);

  ctx = prepareResxData(fnRelated, ctx);
}

function prepareResxData(fn: tFileNaming, ctx = {}): any {
  const fnItem = IoResxManager.instance.getCtxByFn(fn);

  if (fnItem.layout) {
    _logWarn("\t\t\textLayoutContext", fnItem.layout);
    
    prepareRelateResxDate(fnItem.layout, ctx);
  }

  if (fnItem.partials) {
    fnItem.partials
    .forEach(partials => {
      _logWarn("\t\t\textPartialContext", partials);

      prepareRelateResxDate(partials, ctx);
    });
  }

  return ctx;
}

function compile(fn: tFileNaming) {
  _logInfo("\tCompiling HBS"); //, fn.src.fullPath);

  const template = templateCache[fn.src.fullPath];

  if (template) {
    let ctx = prepareResxData(fn);
    
    mergeResxData(fn, ctx, mergeResx.json);
    mergeResxData(fn, ctx, mergeResx.lang);
    
    ctx["links"] = {
      isPartial: fn.www.isPartial,
      url: fn.www.url
    };

    return template(ctx);
  }
  return null;
}

export default {
  extension: "hbs",
  //persist: true,
  preparse,
  parse,
  precompile,
  compile
} as tCompilerExport;