import path from 'path';
import fs from 'fs';

import mkpath from 'mkpath';

import { _logInfo, _logError, _log } from '../libs/debug';
import { CompilerManager } from './main';
import { tCompileType } from './parser/base';


export type tFileInfo = {
  fileName: string;
  ext: string;
  path: string;
  fullPath: string;
  fullPathNoExt: string;
  //lastChangedOn: number;
  root: string;
}
export type tFileNaming = {
  fileName: string;
  relPath: string;
  cType: tCompileType;
  stats: {
    needsBuild: boolean;
    version: number;
  };
  src: tFileInfo;
  out: tFileInfo;
  www: {
    isPartial: boolean;
    url: string;
  };
}

const converter: {[ext: string]: string} = {
  ".hbs": ".html",
  ".md": ".html"
}


export function toFileNaming(src_fullPath: string, targetPath: string, outputPath: string, cType: tCompileType): tFileNaming {
  src_fullPath = path.normalize(src_fullPath);

  const srcFileName = path.basename(src_fullPath);
  const fileName = srcFileName.substring(0, srcFileName.indexOf("."));
  const srcPath = path.dirname(src_fullPath);
  const srcExt = path.extname(srcFileName);

  const relPath = path.relative(targetPath, src_fullPath);

  const outFileName = srcExt in converter ?
    srcFileName.replace(srcExt, converter[srcExt]) :
    srcFileName; //TODO
  
  //const outPath = path.join(config.output.path, srcPath);
  const srcAbsolutePath = path.relative(targetPath, srcPath);
  const outPath = path.join(outputPath, srcAbsolutePath);

  const out_fullPath = path.join(outPath, outFileName);
  const out_fullPathNoExt = path.join(outPath, fileName);

  const needsBuildAndVersion = fnMustBeCompiled(out_fullPath, src_fullPath, cType);
  const needsBuild = !!needsBuildAndVersion || needsBuildAndVersion == null;
  const needsVersion = !!needsBuildAndVersion;
  const fileStats = CompilerManager.instance.updateFileVersion(targetPath, relPath, needsVersion);

  _log(src_fullPath, targetPath, outputPath, outPath)

  const tfnRes: tFileNaming = {
    fileName,
    relPath,
    cType,
    stats: {
      needsBuild,
      version: fileStats.version
    },
    src: {
      fileName: srcFileName,
      ext: srcExt,
      path: srcPath,
      fullPath: src_fullPath,
      fullPathNoExt: path.join(srcPath, fileName),
      root: targetPath
    },
    out: {
      fileName: outFileName,
      ext: path.extname(outFileName),
      path: outPath,
      fullPath: out_fullPath,
      fullPathNoExt: out_fullPathNoExt,
      root: outputPath
    },
    www: {
      isPartial: cType.isPartial,
      url: "/" + encodeURI(path.relative(outPath, out_fullPathNoExt))
    }
  };

  _log(tfnRes)

  return tfnRes;
}

export function fnMustBeCompiled(out_fullPath: string, src_fullPath: string, ctype: tCompileType): boolean|null {
  //const outExists = fs.existsSync(fn.out.fullPath);
  const outExists = fs.existsSync(out_fullPath);

  /*if (!ctype.isPartial && !outExists) {
    return true;
  }*/

  //const srcStats = fs.statSync(fn.src.fullPath);
  const srcStats = fs.statSync(src_fullPath);
  const srcLastEditTime = srcStats.mtimeMs || srcStats.ctimeMs;
  let outLastEditTime: number = 0;
  
  if (outExists) {
    //const outStats = fs.statSync(fn.out.fullPath);
    const outStats = fs.statSync(out_fullPath);
    outLastEditTime = outStats.mtimeMs || outStats.ctimeMs;
  } else {
    outLastEditTime = CompilerManager.instance.stats.previous.finished;
  }

  if (ctype.type == "build-resx") {
    // needs build but new version only if edited, otherwise no new version
    return srcLastEditTime > outLastEditTime || null;
  }
  return srcLastEditTime > outLastEditTime;
}


export function persistFile(fn: tFileNaming, content: string) {
  _logInfo("\tPersisting:", fn.src.fullPath);

  mkpath.sync(fn.out.path);
  fs.writeFileSync(fn.out.fullPath, content);
}

export function copyFile(fn: tFileNaming) {
  _logInfo("\tCopying:", fn.src.fullPath);

  mkpath.sync(fn.out.path);
  fs.copyFileSync(fn.src.fullPath, fn.out.fullPath);
}

export function toRootRelPath(fn: tFileNaming, relPath: string) {
  const absPath = path.resolve(fn.src.path, relPath);
  return path.relative(process.cwd(), absPath);
}

export type tIoResxItem = {
  fn: tFileNaming
  layout?: string
  partials?: string[]
};

export class IoResxManager {
  items: tIoResxItem[] = [];

  static readonly _instance: IoResxManager = new IoResxManager();
  static get instance() :IoResxManager {
    return IoResxManager._instance;
  }
  private constructor() {}

  add(fn: tFileNaming) {
    this.items.push({fn});
  }

  fnItem(filter: (fn: tFileNaming) => boolean = () => true) {
    return this.fnList(filter)[0];
  }
  fnList(filter: (fn: tFileNaming) => boolean = () => true) {
    return this.items
    .map(item => item.fn)
    .filter(filter);
  }

  fnItemByExt(ext: string, filter: (fn: tFileNaming) => boolean = () => true) {
    return this.fnListByExt(ext, filter)[0];
  }
  fnListByExt(ext: string, filter: (fn: tFileNaming) => boolean = () => true) {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }

    return this.items
    .filter(item => item.fn.src.ext == ext)
    .map(item => item.fn)
    .filter(filter);
  }

  getCtxByFn(fn: tFileNaming) {
    return this.items.filter(ctx => ctx.fn == fn)[0];
  }
  
  addLayoutTo(fn: tFileNaming, scrFullPath: string) {
    const ctx = this.getCtxByFn(fn);

    if (ctx) {
      ctx.layout = scrFullPath;
    } else {
      _logError("Not found context for:", fn.src.fullPath, scrFullPath)
    }
  }
  addPartialTo(fn: tFileNaming, scrFullPath: string) {
    const ctx = this.getCtxByFn(fn);

    if (ctx) {
      (ctx.partials || (ctx.partials = [])).push(scrFullPath);
    } else {
      _logError("Not found context for:", fn.src.fullPath, scrFullPath)
    }
  }
}