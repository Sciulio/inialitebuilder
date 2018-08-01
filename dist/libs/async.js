"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Array.prototype.mapAsync = function (cback, defaultValueOrCatchHandler) {
    return __awaiter(this, void 0, void 0, function* () {
        if (defaultValueOrCatchHandler) {
            return yield Promise.all(this.map((item, idx) => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield cback(item, idx);
                }
                catch (e) {
                    if (typeof defaultValueOrCatchHandler == "function") {
                        return defaultValueOrCatchHandler(e, item, idx);
                    }
                }
                return defaultValueOrCatchHandler;
            })));
        }
        else {
            //return await Promise.all(this.map(async (item, idx) => await cback(item, idx)));
            return yield Promise.all(this.map(yield cback));
        }
    });
};
Array.prototype.forEachAsync = function (cback, catchHandler) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.mapAsync(cback, catchHandler);
    });
};
Array.prototype.filterAsync = function (cback, defaultValueOrCatchHandler) {
    return __awaiter(this, void 0, void 0, function* () {
        const clone = this.slice(0);
        const indices = [];
        if (defaultValueOrCatchHandler) {
            yield this.mapAsync((item, idx) => __awaiter(this, void 0, void 0, function* () {
                if (!(yield cback(item, idx))) {
                    indices.push(idx);
                }
            }), (err, item, idx) => {
                if (typeof defaultValueOrCatchHandler == "function" ?
                    defaultValueOrCatchHandler(err, item, idx) :
                    defaultValueOrCatchHandler) {
                    indices.push(idx);
                }
            });
        }
        else {
            yield this.mapAsync((item, idx) => __awaiter(this, void 0, void 0, function* () {
                if (!(yield cback(item, idx))) {
                    indices.push(idx);
                }
            }));
        }
        return clone.filter((item, idx) => !indices.some(id => id == idx));
    });
};
//# sourceMappingURL=async.js.map