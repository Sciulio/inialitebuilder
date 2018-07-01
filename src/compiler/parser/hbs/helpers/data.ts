import * as handlebars from "handlebars";


handlebars.registerHelper('capitalize', function(value: string) {
  return new handlebars.SafeString(value[0].toUpperCase() + value.substr(1).toLowerCase());
});

handlebars.registerHelper('numberize', function(value: string) {
  var parts = value.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
});

handlebars.registerHelper('concat', function() {
  return [...arguments].join("");
});

handlebars.registerHelper("reverse", function(array) {
  return array.slice().reverse();
});


handlebars.registerHelper('leftarrayhalf', function(value: any[]) {
  const halfLength = Math.floor(value.length / 2);
  return value.filter((item, idx) => idx < halfLength);
});
handlebars.registerHelper('rightarrayhalf', function(value: any[]) {
  const halfLength = Math.floor(value.length / 2);
  return value.filter((item, idx) => idx >= halfLength);
});