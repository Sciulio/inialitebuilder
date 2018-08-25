import path from 'path';
import crypto from 'crypto';

import fse from 'fs-extra';
import { load } from 'dynamolo';

import { _logError, _logInfo } from "../libs/debug";
import { tCompilerExport, tCompileType, tCompilerExportContent } from './parser/base';
import { IoResxManager, tFileNaming, persistCompilerExportContent, copyCompilerExportContent, oMergeResx, multiLanguageFileNameStrategy } from './resx';
import { currentBuildingContext } from '..';


const parsersSet: { [ext: string]: tCompilerExport } = {};

load<tCompilerExport>(
  path.join(__dirname, './parser/*/main.js'), //'./parser/*/main.js',
  impCompiler => Array.isArray(impCompiler.extension) ?
    impCompiler.extension.forEach(ext => parsersSet[ext] = impCompiler) :
    parsersSet[impCompiler.extension] = impCompiler, {
    exportDefault: true,
    //rootPath: __dirname,
    logInfo: _logInfo, // (...args: any[]) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
    logError: _logError // (...args: any[]) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
  }
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

  fn.stats.built = true;

  const srcExt = fn.src.ext.substring(1);
  if (srcExt in parsersSet) {
    const parser = parsersSet[srcExt];
    return await parser.compile(fn);
  }

  return null;
}

export function aftercompile(fn: tFileNaming, cExpContent: tCompilerExportContent): tCompilerExportContent {
  const ext = fn.src.ext.substring(1);
  let cExpContentAfter: tCompilerExportContent = null;

  if (ext in parsersSet) {
    const parser = parsersSet[ext];
    cExpContentAfter = parser.aftercompile(fn, cExpContent);
  }

  return cExpContentAfter || cExpContent;
}

export async function prepersist(fn: tFileNaming, cExpContent: tCompilerExportContent): Promise<void> {
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
export async function persist(fn: tFileNaming, cExpContent: tCompilerExportContent): Promise<void> {
  switch (fn.cType.type) {
    case "compilable":
      if (cExpContent && !fn.cType.isPartial) {
        //TODO: accept Stream
        await persistCompilerExportContent(fn, cExpContent);
      }
      break;
    case "site-resx":
      await copyCompilerExportContent(fn);
      break;
    case "build-resx": break;
  }
}

async function _afterpersist(fn: tFileNaming, locale?: string): Promise<void> {
  const fileFullPath = locale ? multiLanguageFileNameStrategy(fn.out.fullPath, locale) : fn.out.fullPath;
  const content = await fse.readFile(fileFullPath);

  fn.www.hash = crypto
  .createHash('md5')
  .update(content)
  .digest("hex");
}
export async function afterpersist(fn: tFileNaming): Promise<void> {
  //TODO: improve this check
  if (fn.cType.type == "site-resx" || fn.cType.type == "compilable" && !fn.cType.isPartial) {
    const stats = await fse.stat(fn.out.fullPath);
    fn.stats.size = stats.size;

    if (fn.www.has[oMergeResx.lang.keyProp]) {
      await currentBuildingContext().siteConfig.locale
      .forEachAsync(async locale => {
        await _afterpersist(fn, locale);
      });
    } else {
      await _afterpersist(fn);
    }
  }
}