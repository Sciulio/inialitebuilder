import fs from 'fs';
import path from 'path';

import { _logInfo, _logWarn } from '../../../libs/debug';

import lodash from 'lodash';

import handlebars from "handlebars";
import './helpers/main';
import { TemplateDelegate } from 'handlebars';
import { minify } from "html-minifier";

import { tFileNaming, toRootRelPath, IoResxManager } from '../../resx';
import { tCompilerExport, tCompileType } from '../base';
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
    convertContent = (rootRelPathNoExt) => '{{#extend "' + rootRelPathNoExt + '"';
  } else {
    extRegexp = /{{\s*>\s+"??(.*?)\s+"??/ig;
    convertContent = (rootRelPath) => '{{> "' + rootRelPath + '"';
  }
  //TODO: block tag

  let match;
  while ((match = extRegexp.exec(content))) {
    const strip = match[0];
    const relPath = match[1].replace(/"/g, "");
    const rootRelPathNoExt = toRootRelPath(fn, relPath);
    const rootRelPath = rootRelPathNoExt + ".hbs";
    
    content = content.replace(strip, convertContent(rootRelPathNoExt));
    
    fn.relations.push({
      type: isLayout ? "layout" : "partial",
      fn: IoResxManager.instance.fnItem(fn => fn.src.fullPath == rootRelPath)
    });
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

async function mergeResxData(fn: tFileNaming, ctx: any, mR: {ext: string, keyProp: string}) {
  const fnResx = IoResxManager.instance.fnItemByExt(
    mR.ext,
    fn_resx => fn_resx.src.path == fn.src.path && fn_resx.fileName == fn.fileName
  );
  if (fnResx) {
    _logWarn("\t\t\t\tmerging content for", fn.src.fullPath, "from", fnResx.src.fullPath);

    let cCtx = await compileFile(fnResx, true);
    ctx[mR.keyProp] = lodash.merge(ctx[mR.keyProp] || {}, cCtx);
  }
}

async function prepareRelatedResxDate(srcFullPathNoExt: string, ctx: any) {
  const fnRelated = IoResxManager.instance.fnItem(_fnItem => _fnItem.src.fullPathNoExt == srcFullPathNoExt);
  
  await Promise.all([
    mergeResxData(fnRelated, ctx, mergeResx.json),
    mergeResxData(fnRelated, ctx, mergeResx.lang)
  ]);
  //await mergeResxData(fnRelated, ctx, mergeResx.json);
  //await mergeResxData(fnRelated, ctx, mergeResx.lang);

  ctx = prepareResxData(fnRelated, ctx);
}

function prepareResxData(fn: tFileNaming, ctx = {}): any {
  const fnRelLayout = fn.relations.filter(rel => rel.type == "layout")[0];

  if (fnRelLayout) {
    _logWarn("\t\t\textLayoutContext", fnRelLayout.fn.src.fullPath);
    prepareRelatedResxDate(fnRelLayout.fn.src.fullPathNoExt, ctx);
  }

  fn.relations
  .filter(fn => fn.type == "partial")
  .forEach(fnRelPartial => {
    _logWarn("\t\t\textPartialContext", fnRelPartial.fn.src.fullPath);
    prepareRelatedResxDate(fnRelPartial.fn.src.fullPathNoExt, ctx);
  });

  return ctx;
}

async function compile(fn: tFileNaming) {
  _logInfo("\tCompiling HBS"); //, fn.src.fullPath);

  const template = templateCache[fn.src.fullPath];

  if (template) {
    let ctx = prepareResxData(fn);
    
    await Promise.all([
      mergeResxData(fn, ctx, mergeResx.json),
      mergeResxData(fn, ctx, mergeResx.lang)
    ]);
    
    ctx["links"] = {
      isPartial: fn.www.isPartial,
      url: fn.www.url
    };

    return template(ctx);
  }
  return null;
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
  extension: "hbs",
  //persist: true,
  preparse,
  parse,
  precompile,
  compile,
  aftercompile
} as tCompilerExport;