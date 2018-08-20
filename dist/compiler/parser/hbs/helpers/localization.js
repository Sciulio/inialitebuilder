"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars = __importStar(require("handlebars"));
const debug_1 = require("../../../../libs/debug");
const __1 = require("../../../..");
const resx_1 = require("../../../resx");
handlebars.registerHelper("localize", function (key) {
    const bCtx = __1.currentBuildingContext();
    const locale = ":" + bCtx.data[resx_1.oMergeResx.lang.keyProp];
    console.log("localize", locale, key);
    if (locale in key) {
        return key[locale];
    }
    debug_1._logWarn("Localization missing:", key, locale);
    return "";
});
//# sourceMappingURL=localization.js.map