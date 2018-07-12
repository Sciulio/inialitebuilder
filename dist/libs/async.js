"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Array.prototype.mapAsync = function (cback) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(this.map((item, idx) => __awaiter(this, void 0, void 0, function* () { return yield cback(item, idx); })));
    });
};
Array.prototype.forEachAsync = function (cback) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.mapAsync(cback);
    });
};
//TODO: preserve sort
Array.prototype.filterAsync = function (cback) {
    return __awaiter(this, void 0, void 0, function* () {
        const clone = this.slice(0);
        const indices = [];
        //const resArray: T[] = [];
        yield this.mapAsync((item, idx) => __awaiter(this, void 0, void 0, function* () {
            if (!(yield cback(item, idx))) {
                indices.push(idx);
                //resArray.push(item);
            }
        }));
        return clone.filter((item, idx) => !indices.some(id => id == idx));
    });
};
//# sourceMappingURL=async.js.map