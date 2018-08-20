import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import mkpath from 'mkpath';
import { fileLastAudit } from '../libs/audit';
import { _logInfo } from '../libs/debug';
import { tCompileType, tCompilerExportContent } from './parser/base';
import { currentBuildingContext } from '..';


export const oMergeResx = {
  json: {
    ext: "json",
    keyProp: "data"
  },
  lang: {
    ext: "lang",
    keyProp: "locale"
  }
}

export type tFileNamingInfo = {
  fileName: string;
  ext: string;
  path: string;
  fullPath: string;
  fullPathNoExt: string;
  root: string;
}
export type tFileNaming = {
  siteName: string;
  fileName: string;
  relPath: string;
  cType: tCompileType;
  stats: {
    needsBuild: boolean;
    needsNewVersion: boolean;
    version: number;
    size?: number;
  };
  relations: {
    type: "layout" | "partial" | "build-resx",
    fn: tFileNaming
  }[];
  src: tFileNamingInfo;
  out: tFileNamingInfo;
  www: {
    isPartial: boolean;
    url: string;
    hash?: string;
    has: {[key: string]: boolean}
  };
}

//TODO: add this to compilers
const converter: {[ext: string]: string} = {
  ".hbs": ".html",
  ".md": ".html",
  ".sass": ".css",
  ".scss": ".css"
}


async function toFileNaming(siteName: string, src_fullPath: string, targetPath: string, outputPath: string, cType: tCompileType): Promise<tFileNaming> {
  src_fullPath = path.normalize(src_fullPath);

  const srcFileName = path.basename(src_fullPath);
  const fileName = srcFileName.substring(0, srcFileName.indexOf("."));
  const srcPath = path.dirname(src_fullPath);
  const srcExt = path.extname(srcFileName);

  const relPath = path.relative(targetPath, src_fullPath);

  const outFileName = srcExt in converter ?
    srcFileName.replace(srcExt, converter[srcExt]) :
    srcFileName; //TODO
  
  const srcAbsolutePath = path.relative(targetPath, srcPath);
  const outPath = path.join(outputPath, srcAbsolutePath);

  const out_fullPath = path.join(outPath, outFileName);
  const out_fullPathNoExt = path.join(outPath, fileName);

  const needsBuildAndVersion = (await fnMustBeCompiled(siteName, out_fullPath, src_fullPath, cType));
  const needsBuild = !!needsBuildAndVersion || needsBuildAndVersion == null;
  const needsNewVersion = !!needsBuildAndVersion;

  const fileAudit = await fileLastAudit(siteName, src_fullPath);
  const version = fileAudit ? fileAudit.version + (needsNewVersion ? 1 : 0) : 0;

  //_log(src_fullPath, targetPath, outputPath, outPath)
  
  const tfnRes: tFileNaming = {
    siteName,
    fileName,
    relPath,
    cType,
    stats: {
      needsBuild,
      needsNewVersion,
      version
    },
    relations: [],
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
      url: "/" + encodeURI(path.relative(outputPath, out_fullPath).replace(/\\/g, '/')),
      has: {}
    }
  };

  return tfnRes;
}

async function fnMustBeCompiled(siteName: string, out_fullPath: string, src_fullPath: string, ctype: tCompileType): Promise<boolean|null> {
  const outExists = fs.existsSync(out_fullPath);
  //const outExists = (await fse.ex.ensureFile(.exists(out_fullPath));
  
  //const srcStats = fs.statSync(src_fullPath);
  const srcStats = (await fse.stat(src_fullPath));
  const srcLastEditTime = srcStats.mtimeMs || srcStats.ctimeMs;
  let outLastEditTime: number = 0;
  
  if (outExists) {
    const outStats = (await fse.stat(out_fullPath));
    outLastEditTime = outStats.mtimeMs || outStats.ctimeMs;
  } else {
    const lastFileAudit = await fileLastAudit(siteName, src_fullPath);
    outLastEditTime = lastFileAudit ? lastFileAudit._on : 0;
  }

  if (ctype.type == "build-resx") {
    // needs build but new version only if edited, otherwise no new version
    return (srcLastEditTime > outLastEditTime) || null;
  }
  return srcLastEditTime > outLastEditTime;
}

export function multiLanguageFileNameStrategy(fullPath: string, locale: string) {
  const bCtx = currentBuildingContext();
  const isDefaultLocale = bCtx.siteConfig.locale[0] == locale;
  
  if (isDefaultLocale) {
    return fullPath;
  }
  return fullPath + "." + locale;
}
//TODO: localized filename strategy
export async function persistCompilerExportContent(fn: tFileNaming, cExpcExpContent: tCompilerExportContent): Promise<void> {
  _logInfo("\tPersisting:", fn.src.fullPath);

  mkpath.sync(fn.out.path);

  if (Array.isArray(cExpcExpContent)) {
    // localizable content
    await currentBuildingContext().siteConfig.locale
    .forEachAsync(async (locale, idx) => await fse.writeFile(multiLanguageFileNameStrategy(fn.out.fullPath, locale), cExpcExpContent[idx]));
  } else {
    await fse.writeFile(fn.out.fullPath, cExpcExpContent);
  }
}

export async function copyCompilerExportContent(fn: tFileNaming): Promise<void> {
  _logInfo("\tCopying:", fn.src.fullPath);

  mkpath.sync(fn.out.path);

  if (fn.www.has[oMergeResx.lang.keyProp]) {
    // localizable content
    await currentBuildingContext().siteConfig.locale
    .forEachAsync(async (locale, idx) => fse.copy(fn.src.fullPath, multiLanguageFileNameStrategy(fn.out.fullPath, locale)));
  } else {
    await fse.copy(fn.src.fullPath, fn.out.fullPath);
  }
}

export function toRootRelPath(fn: tFileNaming, relPath: string) {
  const absPath = path.resolve(fn.src.path, relPath);
  return path.relative(process.cwd(), absPath);
}

//export class LocalizationManager {}
export class IoResxManager {
  items: tFileNaming[] = [];

  static readonly _instance: IoResxManager = new IoResxManager();
  static get instance() :IoResxManager {
    return IoResxManager._instance;
  }
  private constructor() {}

  async create(siteName: string, src_fullPath: string, targetPath: string, outputPath: string, cType: tCompileType) {
    return this.add(await toFileNaming(siteName, src_fullPath, targetPath, outputPath, cType));
  }
  add(fn: tFileNaming) {
    this.items.push(fn);
    return fn;
  }

  fnItem(filter: (fn: tFileNaming) => boolean = () => true) {
    return this.fnList(filter)[0];
  }
  fnList(filter: (fn: tFileNaming) => boolean = () => true) {
    return this.items
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
    .filter(fn => fn.src.ext == ext)
    .filter(filter);
  }
}