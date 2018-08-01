import path from 'path';
import fse from 'fs-extra';
import Datastore from 'nedb';
import { IoResxManager, tFileNaming } from '../compiler/resx';
import { loadConfiguration } from './config';
import "./async";


const config = loadConfiguration();

export type baseDoc = {
  _id?: string;
}
export type docBuildAudit = baseDoc & {
  type: "buildinfo",
  on: number;
  duration: number;
};
export type docFileAudit = baseDoc & {
  type: "fileinfo",
  _on: number;
  relPath: string;
  url: string;
  action: "created" | "edited" | "deleted";
  version: number;
  hash: string;
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

  db.insert({
    type: "buildinfo",
    on: dbWrapper.on,
    duration: Date.now() - dbWrapper.on
  } as docBuildAudit);

  await (await Promise.all(
    await IoResxManager.instance.items
    .filterAsync(async fn => fn.stats.needsNewVersion || !(await fileLastAudit(siteName, fn.relPath)))
  ))
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
  var db = dbs[fn.siteName].db;

  const lastAudit = await fileLastAudit(fn.siteName, fn.src.fullPath);

  return new Promise<docFileAudit>((res, rej) => {
    db.insert<docFileAudit>({
      type: "fileinfo",
      _on,
      action: lastAudit ? "edited" : "created",
      relPath: fn.relPath,
      url: fn.www.url,
      version: fn.stats.version,
      hash: fn.www.hash || ""
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
    type: "buildinfo",
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