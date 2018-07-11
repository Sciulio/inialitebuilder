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
const nedb_1 = __importDefault(require("nedb"));
const dbs = {};
function initDb(siteName) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = new nedb_1.default({
            filename: path_1.default.join('cache', siteName + ".db")
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
    const dbWrapper = dbs[siteName];
    const db = dbWrapper.db;
    db.insert({
        on: dbWrapper.on,
        duration: Date.now() - dbWrapper.on
    });
    delete dbs[siteName];
}
exports.disposeDb = disposeDb;
function fileLastAudit(siteName, srcFullPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = dbs[siteName].db;
        return new Promise((res, rej) => {
            db.findOne({
                type: "fileinfo",
                srcFullPath
            }, (err, doc) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    rej(err);
                }
                else {
                    res(yield convertObjToFileInfo(siteName, doc));
                }
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
                if (err) {
                    rej(err);
                }
                else {
                    //delete doc.type;
                    const ff = convertObjToBuildInfo(doc[0]);
                    res();
                }
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
                if (err) {
                    rej(err);
                }
                else {
                    //delete doc.type;
                    res(convertObjToBuildInfo(doc));
                }
            });
        });
    });
}
function convertObjToBuildInfo(obj) {
    if (obj) {
        return obj;
    }
    return {
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
//# sourceMappingURL=db.js.map