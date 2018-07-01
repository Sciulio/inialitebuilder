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
handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    switch (operator) {
        case "+":
            return lvalue + rvalue;
        case "-":
            return lvalue - rvalue;
        case "*":
            return lvalue * rvalue;
        case "/":
            return lvalue / rvalue;
        case "%":
            return lvalue % rvalue;
        default:
            throw Error("NO");
    }
});
handlebars.registerHelper("boolean", function (lvalue, operator, rvalue, options) {
    switch (operator) {
        case "||":
            return lvalue || rvalue;
        case "&&":
            return lvalue && rvalue;
        default:
            throw Error("NO");
    }
});
handlebars.registerHelper("mathFun", function (funcName) {
    var options = arguments[arguments.length - 1];
    const func = Math[funcName];
    if (func) {
        return func.apply(Math, Array.prototype.slice.call(arguments, 1, arguments.length - 1));
    }
    throw Error("NO");
});
//# sourceMappingURL=math.js.map