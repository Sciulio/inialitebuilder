import * as handlebars from "handlebars";


function _setVersionParam(url: string) {
  const version = "0.0.0";

  if (url.indexOf("?") > 0) {
    url += "&";
  } else {
    url += "?";
  }
  
  return url + "_v=" + version;
}
handlebars.registerHelper("script", function(src) {
  return new Handlebars.SafeString(
    `<script src="${_setVersionParam(src)}"></script>`
  );
});
handlebars.registerHelper("style", function(src) {
  return new Handlebars.SafeString(
    `<link rel="stylesheet" href="${_setVersionParam(src)}"/>`
  );
});

handlebars.registerHelper("attributes", function(data) {
  return Object.keys(data)
  .reduce((prev, key) => prev += ` ${key}="${data[key]}" `, "");
});