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
function _setVersionParam(url) {
    const version = "0.0.0";
    if (url.indexOf("?") > 0) {
        url += "&";
    }
    else {
        url += "?";
    }
    return url + "_v=" + version;
}
handlebars.registerHelper("script", function (src) {
    return `<script src="${_setVersionParam(src)}"></script>`;
});
handlebars.registerHelper("style", function (src) {
    return `<link rel="stylesheet" href="${_setVersionParam(src)}"/>`;
});
handlebars.registerHelper("attributes", function (data) {
    return Object.keys(data)
        .reduce((prev, key) => prev += ` ${key}="${data[key]}" `, "");
});
//# sourceMappingURL=tags.js.map