import path from 'path';
import crypto from 'crypto';
import { Stream } from 'stream';

import fse from 'fs-extra';

import { _logError, _logInfo } from "../libs/debug";
import { dynamolo } from '../libs/dynamolo';
import { tCompilerExport, tCompileType } from './parser/base';
import { IoResxManager, tFileNaming, persistFile, copyFile } from './resx';


const parsersSet: { [ext: string]: tCompilerExport } = {};

dynamolo<tCompilerExport>(
  path.join(__dirname, './parser/'),
  impCompiler => Array.isArray(impCompiler.extension) ?
    impCompiler.extension.forEach(ext => parsersSet[ext] = impCompiler) :
    parsersSet[impCompiler.extension] = impCompiler
);


export async function preparseFile(siteName: string, sourceFilePath: string, targetPath: string, outputPath: string) {
  const ext = path.extname(sourceFilePath).substring(1);
  let ctype: tCompileType = {
    isPartial: false,
    type: "site-resx" //TODO: set default (images etc...)
  };

  if (ext in parsersSet) {
    ctype = parsersSet[ext].preparse(sourceFilePath);
  }

  return await IoResxManager.instance.create(siteName, sourceFilePath, targetPath, outputPath, ctype);
}

export function parseFile(fn: tFileNaming): void {
  if (!fn.src.ext) {
    _logError("File without ext", fn.src.fullPath);
    return;
  }

  _logInfo(` PARSING: "${fn.src.fullPath}"`);

  const ext = fn.src.ext.substring(1);

  if (ext in parsersSet) {
    parsersSet[ext].parse(fn);
  }
}

export function precompileFile(fn: tFileNaming) {
  _logInfo(` PRE-COMPILING: "${fn.src.fullPath}"`);

  const ext = fn.src.ext.substring(1);

  if (ext in parsersSet) {
    parsersSet[ext].precompile(fn);
  }
}

function fnCtxMustBeCompiled(fn: tFileNaming): boolean {
  //TODO: may always want to compile some extensions (scss, etcc) -> type "build-resx"
  if (fn.stats.needsBuild) {
    return true;
  }

  //TODO: check all dependancies (lang, json, ... etc)

  return fn.relations && fn.relations
  .some(relation => fnCtxMustBeCompiled(relation.fn));
}

export async function compileFile(fn: tFileNaming, forceCompile: boolean = false) {
  _logInfo(` COMPILING: "${fn.src.fullPath}"`);

  if (!forceCompile && !fnCtxMustBeCompiled(fn)) {
    _logInfo("\t\tSkipped because existing not outdated!");
    return null;
  }

  const ext = fn.src.ext.substring(1);
  let content: string | null = null;

  if (ext in parsersSet) {
    const parser = parsersSet[ext];
    content = await parser.compile(fn);
  }

  return content;
}

export function aftercompile(fn: tFileNaming, content: string|Stream|null) { //TODO: string|Stream
  const ext = fn.src.ext.substring(1);
  let aftercompiledContent: string|Stream|null = null;

  if (ext in parsersSet) {
    const parser = parsersSet[ext];
    aftercompiledContent = parser.aftercompile(fn, content);
  }

  return (aftercompiledContent || content || "").toString();
}

export async function prepersist(fn: tFileNaming, content: string|Stream|null): Promise<void> {
  /*
  switch (fn.cType.type) {
    case "build-resx": break;
    case "site-resx":
    case "compilable":
      //const content = await fse.readFile(fn.out.fullPath);
      if (content) {
        fn.www.hash = crypto
        .createHash('md5')
        .update(content.toString())
        .digest("hex");
      }
      break;
  }*/
}
export async function persist(fn: tFileNaming, content: string|Stream|null): Promise<void> {
  switch (fn.cType.type) {
    case "compilable":
      if (content && !fn.cType.isPartial) {
        //TODO: accept Stream
        await persistFile(fn, content.toString());
      }
      break;
    case "site-resx":
      await copyFile(fn);
      break;
    case "build-resx": break;
  }
}
export async function afterpersist(fn: tFileNaming): Promise<void> {
  //TODO: improve this check
  if (fn.cType.type == "site-resx" || fn.cType.type == "compilable" && !fn.cType.isPartial) {
    const stats = await fse.stat(fn.out.fullPath);
    fn.stats.size = stats.size;

    const content = await fse.readFile(fn.out.fullPath);
    fn.www.hash = crypto
    .createHash('md5')
    .update(content)
    .digest("hex");
  }
}