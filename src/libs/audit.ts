import path from 'path';
import fse from 'fs-extra';
import Datastore from 'nedb';
import { IoResxManager, tFileNaming } from '../compiler/resx';
import { loadConfiguration } from './config';


const config = loadConfiguration();

export type baseDoc = {
  _id?: string;
}
export type docBuildAudit = baseDoc & {
  _type: "buildinfo",
  on: number;
  duration: number;
};
export type docFileAudit = baseDoc & {
  _type: "fileinfo",
  _on: number;
  path: string;
  url: string;
  audit: {
    action: "created" | "edited" | "deleted";
    version: number;
  };
  stats: {
    hash: string;
    size: number;
  };
  content: {
    type: string;
    charset: string;
    visibility: "public" | "private";
    lastModified: string;
  };
  has: {[keyProp: string]: boolean};
};

export type tBuildAudit = docBuildAudit & {
};
export type tFileAudit = docFileAudit & {
  buildInfo: tBuildAudit;
};

const dbs: {[key: string]: {
  db: Datastore,
  on: number
}} = {};

export async function initDb(siteName: string) {
  const db = new Datastore({
    filename: path.join(config.output.root, siteName + ".db")
  });
  
  dbs[siteName] = {
    db,
    on: Date.now()
  };

  return new Promise((res, rej) => {
    db.loadDatabase((err) => {
      if (err) {
        rej(err)
      } else {
        res();
      }
    });
  });
}
export async function disposeDb(siteName: string) {
  const dbWrapper = dbs[siteName];
  const db = dbWrapper.db;

  const docBuild = {
    _type: "buildinfo",
    on: dbWrapper.on,
    duration: Date.now() - dbWrapper.on
  } as docBuildAudit;

  db.insert(docBuild);

  await (await Promise.all(
    await IoResxManager.instance.items
    .filterAsync(async fn => fn.stats.needsNewVersion || !(await fileLastAudit(siteName, fn.relPath)))
  ))
  .filter(fn => fn.cType.type == "site-resx" || fn.cType.type == "compilable" && !fn.cType.isPartial)
  .forEachAsync(async fn => { await insertFileAudit(fn, dbWrapper.on); });
  
  //TODO save file with files hashes for ws and etags
  const wsItems = await IoResxManager.instance.items
  .mapAsync(async fn => {
    return {
      url: fn.www.url,
      hash: fn.www.hash
    };
  });
  await fse.writeJson(path.join(config.output.root, siteName + ".json"), wsItems);
  
  //TODO: add deleted-file case

  delete dbs[siteName];
}

async function insertFileAudit(fn: tFileNaming, _on: number) {
  const db = dbs[fn.siteName].db;
  const lastAudit = await fileLastAudit(fn.siteName, fn.src.fullPath);

  return new Promise<docFileAudit>((res, rej) => {
    db.insert<docFileAudit>({
      _type: "fileinfo",
      _on,
      path: fn.relPath,
      url: fn.www.url,
      audit: {
        action: lastAudit ? "edited" : "created",
        version: fn.stats.version,
      },
      stats: {
        hash: fn.www.hash || "",
        size: fn.stats.size || 0,
      },
      content: { //TODO
        type: fn.www.type,
        charset: fn.www.charset,
        visibility: "public",
        lastModified: new Date(fn.www.lastModified).toUTCString()
      },
      has: fn.www.has
    }, (err, doc) => {
      err ? rej(err) : res(doc);
    });
  });
}

export async function fileLastAudit(siteName: string, relPath: string): Promise<tFileAudit> {
  const db = dbs[siteName].db;

  return new Promise<tFileAudit>((res, rej) => {
    db.findOne({
      type: "fileinfo",
      relPath
    }, async (err, doc: docFileAudit) => {
      err ? rej(err) : res(await convertObjToFileInfo(siteName, doc));
    });
  });
}

export async function lastBuildInfo(siteName: string): Promise<tBuildAudit> {
  const db = dbs[siteName].db;

  return new Promise<tBuildAudit>((res, rej) => {
    db.find<tBuildAudit>({
      type: "buildinfo",
    })
    .sort({
      on: 1
    })
    .limit(1)
    .exec((err, doc) => {
      err ? rej(err) : res(convertObjToBuildInfo(doc[0]));
    });
  });
}

async function getBuildInfo(siteName: string, on: number): Promise<tBuildAudit> {
  const db = dbs[siteName].db;

  return new Promise<tBuildAudit>((res, rej) => {
    db.findOne({
      type: "buildinfo",
    }, (err, doc) => {
      err ? rej(err) : res(convertObjToBuildInfo(doc as docBuildAudit));
    });
  });
}

function convertObjToBuildInfo(obj: docBuildAudit): tBuildAudit {
  if (obj) {
    return obj as tBuildAudit;
  }
  
  return {
    _type: "buildinfo",
    on: 0,
    duration: 0
  };
}
async function convertObjToFileInfo(siteName: string, docFile: docFileAudit): Promise<tFileAudit> {
  if (!docFile) {
    return docFile;
  }
  const buildInfo = (await getBuildInfo(siteName, docFile._on));
  //TODO: clone
  (docFile as tFileAudit).buildInfo = buildInfo;
  return docFile as tFileAudit;
}