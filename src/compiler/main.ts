import path from 'path';
import { _logError, _logInfo } from "../libs/debug";
import { dynamolo } from '../libs/dynamolo';
import { tCompilerExport, tCompileType } from './parser/base';
import { IoResxManager, tFileNaming } from './resx';


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

export function compileFile(fn: tFileNaming, forceCompile: boolean = false) {
  _logInfo(` COMPILING: "${fn.src.fullPath}"`);

  if (!forceCompile && !fnCtxMustBeCompiled(fn)) {
    _logInfo("\t\tSkipped because existing not outdated!");
    return null;
  }

  const ext = fn.src.ext.substring(1);
  let content: string | null = null;

  if (ext in parsersSet) {
    const parser = parsersSet[ext];
    content = parser.compile(fn);
  }

  return content;
}