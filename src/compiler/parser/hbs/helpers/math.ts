import * as handlebars from "handlebars";


handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);
      
  switch(operator) {
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

handlebars.registerHelper("boolean", function(lvalue, operator, rvalue, options) {
  switch(operator) {
    case "||":
      return lvalue || rvalue;
    case "&&":
      return lvalue && rvalue;
    default:
      throw Error("NO");
  }
});

handlebars.registerHelper("mathFun", function(funcName) {
  var options = arguments[arguments.length - 1];
  
  const func = (<any>Math)[funcName];

  if (func) {
    return func.apply(Math, Array.prototype.slice.call(arguments, 1, arguments.length - 1));
  }
  
  throw Error("NO");
});