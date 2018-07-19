"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const nedb_1 = __importDefault(require("nedb"));
const resx_1 = require("../compiler/resx");
const config_1 = require("./config");
require("./async");
const config = config_1.loadConfiguration();
const dbs = {};
function initDb(siteName) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = new nedb_1.default({
            filename: path_1.default.join(config.output.root, siteName + ".db")
        });
        dbs[siteName] = {
            db,
            on: Date.now()
        };
        return new Promise((res, rej) => {
            db.loadDatabase((err) => {
                if (err) {
                    rej(err);
                }
                else {
                    res();
                }
            });
        });
    });
}
exports.initDb = initDb;
function disposeDb(siteName) {
    return __awaiter(this, void 0, void 0, function* () {
        const dbWrapper = dbs[siteName];
        const db = dbWrapper.db;
        db.insert({
            type: "buildinfo",
            on: dbWrapper.on,
            duration: Date.now() - dbWrapper.on
        });
        yield (yield Promise.all(yield resx_1.IoResxManager.instance.items
            .filterAsync((fn) => __awaiter(this, void 0, void 0, function* () { return fn.stats.needsNewVersion || !(yield fileLastAudit(siteName, fn.relPath)); }))))
            .forEachAsync((fn) => __awaiter(this, void 0, void 0, function* () { yield insertFileAudit(fn, dbWrapper.on); }));
<<<<<<< HEAD
=======
        //TODO save file with files hashes for ws and etags
        const wsItems = yield resx_1.IoResxManager.instance.items
            .mapAsync((fn) => __awaiter(this, void 0, void 0, function* () {
            return {
                url: fn.www.url,
                hash: fn.www.hash
            };
        }));
        yield fs_extra_1.default.writeJson(path_1.default.join(config.output.root, siteName + ".json"), wsItems);
        /*
        const filteredItems = await IoResxManager.instance.items
        .filterAsync(async fn => fn.stats.needsNewVersion || !(await fileLastAudit(siteName, fn.relPath)));
        await Promise.all(
          filteredItems.map(async fn => await insertFileAudit(fn, dbWrapper.on))
        );
        */
        /*const filteredItems = await Promise.all(
          IoResxManager.instance.items
          //.filter(async fn => fn.stats.needsNewVersion || !(await fileLastAudit(siteName, fn.relPath)))
          .map(async fn => fn.stats.needsNewVersion || !(await fileLastAudit(siteName, fn.relPath)))
        );
        await Promise.all(
          .map(async fn => await insertFileAudit(fn, dbWrapper.on))
        );*/
>>>>>>> c71408a9c4f8ed215051aa2acf3098f0f59a40b7
        //TODO: add deleted-file case
        delete dbs[siteName];
    });
}
exports.disposeDb = disposeDb;
function insertFileAudit(fn, _on) {
    return __awaiter(this, void 0, void 0, function* () {
        var db = dbs[fn.siteName].db;
        const lastAudit = yield fileLastAudit(fn.siteName, fn.src.fullPath);
        return new Promise((res, rej) => {
            db.insert({
                type: "fileinfo",
                _on,
                action: lastAudit ? "edited" : "created",
                relPath: fn.relPath,
                version: fn.stats.version
            }, (err, doc) => {
                err ? rej(err) : res(doc);
            });
        });
    });
}
function fileLastAudit(siteName, relPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = dbs[siteName].db;
        return new Promise((res, rej) => {
            db.findOne({
                type: "fileinfo",
                relPath
            }, (err, doc) => __awaiter(this, void 0, void 0, function* () {
                err ? rej(err) : res(yield convertObjToFileInfo(siteName, doc));
            }));
        });
    });
}
exports.fileLastAudit = fileLastAudit;
function lastBuildInfo(siteName) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = dbs[siteName].db;
        return new Promise((res, rej) => {
            db.find({
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
    });
}
exports.lastBuildInfo = lastBuildInfo;
function getBuildInfo(siteName, on) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = dbs[siteName].db;
        return new Promise((res, rej) => {
            db.findOne({
                type: "buildinfo",
            }, (err, doc) => {
                err ? rej(err) : res(convertObjToBuildInfo(doc));
            });
        });
    });
}
function convertObjToBuildInfo(obj) {
    if (obj) {
        return obj;
    }
    return {
        type: "buildinfo",
        on: 0,
        duration: 0
    };
}
function convertObjToFileInfo(siteName, docFile) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!docFile) {
            return docFile;
        }
        const buildInfo = (yield getBuildInfo(siteName, docFile._on));
        //TODO: clone
        docFile.buildInfo = buildInfo;
        return docFile;
    });
}
//# sourceMappingURL=audit.js.map