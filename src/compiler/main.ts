import path from 'path';
import fs from 'fs';

import { _logError, _logInfo } from "../libs/debug";

import { tFileNaming, copyFile, persistFile, IoResxManager } from './resx';
import { tCompilerExport } from './parser/base';
import { dynamolo } from '../libs/dynamolo';


const parsersSet: { [ext: string]: tCompilerExport } = {};

dynamolo<tCompilerExport>(path.join(__dirname, './parser/'), impCompiler => parsersSet[impCompiler.extension] = impCompiler);

export function parseFN(fn: tFileNaming): void {
  if (!fn.src.ext) {
    _logError("File without ext", fn.src.fullPath);
    return;
  }

  _logInfo(` PARSING: "${fn.src.fullPath}"`);

  const ext = fn.src.ext.substring(1);

  IoResxManager.instance.add(fn);

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

function fnCtxMustBeCompiled(fn: tFileNaming) {
  //TODO: may want to compile some extensions always (scss, etcc)
  //if (fnMustBeCompiled(fn)) {
  if (fn.stats.needsBuild) {
    return true;
  }

  //TODO: check all dependancies (lang, json, ... etc)

  const fnCtx = IoResxManager.instance.getCtxByFn(fn);
  if (fnCtx.layout) {
    const fnLayout = IoResxManager.instance.fnItem(fn => fn.src.fullPathNoExt == fnCtx.layout);

    if (fnLayout && fnCtxMustBeCompiled(fnLayout)) {
      return true;
    }
  }

  if (fnCtx.partials) {
    if (fnCtx.partials.some(_partial => {
      const fnPartial = IoResxManager.instance.fnItem(fn => fn.src.fullPathNoExt == _partial);

      return fnPartial && fnCtxMustBeCompiled(fnPartial);
    })) {
      return true;
    }
  }

  return false;
}

export function compileFile(fn: tFileNaming, forceCompile: boolean = false) {
  _logInfo(` COMPILING: "${fn.src.fullPath}"`);

  if (!forceCompile && !fnCtxMustBeCompiled(fn)) {
    _logInfo("\t\tSkipped because existing not outdated!");
    return false;
  }

  const ext = fn.src.ext.substring(1);
  let content: string | null = null;

  if (ext in parsersSet) {
    const parser = parsersSet[ext];
    content = parser.compile(fn);

    if (parser.persist) {
      persistFile(fn, content);
    }
  } else {
    copyFile(fn);
  }

  return content;
}


export type tCompilationStats = {
  previous: {
    started: number;
    finished: number;
    build: number;
    files: {[srcFullPath: string]: number};
  };
  current: {
    started: number;
    finished: number;
    build: number;
    files: {[srcFullPath: string]: number};
  };
}

export class CompilerManager {
  static readonly _instance: CompilerManager = new CompilerManager();
  static get instance(): CompilerManager {
    return CompilerManager._instance;
  }
  private constructor() {}

  private _stats?: tCompilationStats;
  get stats(): tCompilationStats {
    return this._stats as any;
  }

  start(outputRoot: string) {
    const compilationStatsPath = path.join(outputRoot, "compilationStats.json");

    const _stats = this._stats = {} as tCompilationStats;

    if (fs.existsSync(compilationStatsPath)) {
      _stats.previous = JSON.parse(fs.readFileSync(compilationStatsPath).toString()) as any;
    } else {
      _stats.previous = {} as any;
    }
    _stats.previous.build = _stats.previous.build || 0;
    _stats.previous.started = _stats.previous.started || 0;
    _stats.previous.finished = _stats.previous.finished || 0;
    _stats.previous.files = _stats.previous.files || {};

    _stats.current = {
      build: _stats.previous.build + 1,
      started: Date.now(),
      finished: 0,
      files: {}
    };
  }

  stop(outputRoot: string) {
    const compilationStatsPath = path.join(outputRoot, "compilationStats.json");

    const _stats = this._stats as tCompilationStats;

    _stats.current.finished = Date.now();
    _stats.current.files = {};

    IoResxManager.instance.fnList()
    .forEach(fn => _stats.current.files[fn.src.fullPath] = fn.stats.version);

    const content = JSON.stringify(_stats.current, null, 2);
    fs.writeFileSync(compilationStatsPath, content);
  }
}