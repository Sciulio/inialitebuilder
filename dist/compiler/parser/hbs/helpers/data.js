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
handlebars.registerHelper('capitalize', function (value) {
    return new handlebars.SafeString(value[0].toUpperCase() + value.substr(1).toLowerCase());
});
handlebars.registerHelper('numberize', function (value) {
    var parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
});
handlebars.registerHelper('concat', function () {
    return [...arguments].join("");
});
handlebars.registerHelper("reverse", function (array) {
    return array.slice().reverse();
});
handlebars.registerHelper('leftarrayhalf', function (value) {
    const halfLength = Math.floor(value.length / 2);
    return value.filter((item, idx) => idx < halfLength);
});
handlebars.registerHelper('rightarrayhalf', function (value) {
    const halfLength = Math.floor(value.length / 2);
    return value.filter((item, idx) => idx >= halfLength);
});
//# sourceMappingURL=data.js.map