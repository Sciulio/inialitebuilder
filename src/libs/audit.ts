import path from 'path';
import Datastore from 'nedb';
import { IoResxManager, tFileNaming } from '../compiler/resx';


export type baseDoc = {
  _id?: string;
}
export type docBuildAudit = baseDoc & {
  on: number;
  duration: number;
};
export type docFileAudit = baseDoc & {
  _on: number;
  srcFullPath: string;
  action: "created" | "edited" | "deleted";
  version: number;
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
    filename: path.join('cache', siteName + ".db")
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
    on: dbWrapper.on,
    duration: Date.now() - dbWrapper.on
  } as docBuildAudit);

  await Promise.all(
    IoResxManager.instance.items
    .filter(fn => fn.stats.needsNewVersion)
    .map(async fn => insertFileAudit(fn, dbWrapper.on))
  );
  //TODO: add deleted-file case

  delete dbs[siteName];
}

async function insertFileAudit(fn: tFileNaming, _on: number) {
  var db = dbs[fn.siteName].db;

  const lastAudit = await fileLastAudit(fn.siteName, fn.src.fullPath);

  return new Promise<docFileAudit>((res, rej) => {
    db.insert<docFileAudit>({
      _on,
      action: lastAudit ? "edited" : "created",
      srcFullPath: fn.src.fullPath,
      version: fn.stats.version
    }, (err, doc) => {
      if (err) {
        rej(doc);
      } else {
        res(doc);
      }
    });
  });
}

export async function fileLastAudit(siteName: string, srcFullPath: string): Promise<tFileAudit> {
  const db = dbs[siteName].db;

  return new Promise<tFileAudit>((res, rej) => {
    db.findOne({
      type: "fileinfo",
      srcFullPath
    }, async (err, doc: docFileAudit) => {
      if (err) {
        rej(err);
      } else {
        res(await convertObjToFileInfo(siteName, doc));
      }
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
      if (err) {
        rej(err);
      } else {
        //delete doc.type;
        const ff = convertObjToBuildInfo(doc[0]);
        res();
      }
    });
  });
}

async function getBuildInfo(siteName: string, on: number): Promise<tBuildAudit> {
  const db = dbs[siteName].db;

  return new Promise<tBuildAudit>((res, rej) => {
    db.findOne({
      type: "buildinfo",
    }, (err, doc) => {
      if (err) {
        rej(err);
      } else {
        //delete doc.type;
        res(convertObjToBuildInfo((doc as docBuildAudit)));
      }
    });
  });
}

function convertObjToBuildInfo(obj: docBuildAudit): tBuildAudit {
  if (obj) {
    return obj as tBuildAudit;
  }
  
  return {
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