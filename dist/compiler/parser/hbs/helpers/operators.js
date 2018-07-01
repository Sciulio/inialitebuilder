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
handlebars.registerHelper('compare', function (v1, operator, v2, options) {
    const ctx = this;
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(ctx) : options.inverse(ctx);
        case '===':
            return (v1 === v2) ? options.fn(ctx) : options.inverse(ctx);
        case '!=':
            return (v1 != v2) ? options.fn(ctx) : options.inverse(ctx);
        case '!==':
            return (v1 !== v2) ? options.fn(ctx) : options.inverse(ctx);
        case '<':
            return (v1 < v2) ? options.fn(ctx) : options.inverse(ctx);
        case '<=':
            return (v1 <= v2) ? options.fn(ctx) : options.inverse(ctx);
        case '>':
            return (v1 > v2) ? options.fn(ctx) : options.inverse(ctx);
        case '>=':
            return (v1 >= v2) ? options.fn(ctx) : options.inverse(ctx);
        case '&&':
            return (v1 && v2) ? options.fn(ctx) : options.inverse(ctx);
        case '||':
            return (v1 || v2) ? options.fn(ctx) : options.inverse(ctx);
        default:
            return options.inverse(ctx);
    }
});
//# sourceMappingURL=operators.js.map