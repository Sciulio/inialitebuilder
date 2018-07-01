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
function checkUrl(thisLink, checkLink) {
    if (checkLink == '/' || checkLink == '/index' || checkLink == '/index.html') {
        checkLink = '/index.html';
    }
    if (thisLink == '/' || thisLink == '/index' || thisLink == '/index.html') {
        thisLink = '/index.html';
    }
    if (checkLink.split(".").length == 1 || thisLink.split(".").length == 1) {
        checkLink = checkLink.split(".")[0];
        thisLink = thisLink.split(".")[0];
    }
    return thisLink == checkLink;
}
handlebars.registerHelper('iscurrentlink', function (thisLink, checkLink, options) {
    const ctx = this;
    if (checkUrl(thisLink, checkLink)) {
        return options.fn(ctx);
    }
    return options.inverse(ctx);
});
handlebars.registerHelper('link', function (text, url, links) {
    url = handlebars.escapeExpression(url);
    text = handlebars.escapeExpression(text);
    return new handlebars.SafeString(`<a href="${url}" class="${checkUrl(links.url, url) ? "current" : ""}">${text}</a>`);
});
//# sourceMappingURL=www.js.map