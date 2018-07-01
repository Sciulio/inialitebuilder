import * as handlebars from "handlebars";


handlebars.registerHelper('compare', function (this: any, v1, operator, v2, options) {
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