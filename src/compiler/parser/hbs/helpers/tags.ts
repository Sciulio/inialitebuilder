import * as handlebars from "handlebars";


function _setVersionParam(url: string) {
  return url;
  /*
  const fileStats = CompilerManager.instance.fileStats(url);
  const version = fileStats ? fileStats.version : "0";

  if (url.indexOf("?") > 0) {
    url += "&";
  } else {
    url += "?";
  }
  
  return url + "_v=" + version;
  */
}
handlebars.registerHelper("script", function(src) {
  return new handlebars.SafeString(
    `<script src="${_setVersionParam(src)}"></script>`
  );
});
handlebars.registerHelper("style", function(src) {
  return new handlebars.SafeString(
    `<link rel="stylesheet" href="${_setVersionParam(src)}"/>`
  );
});

handlebars.registerHelper("attributes", function(data) {
  return Object.keys(data)
  .reduce((prev, key) => prev += ` ${key}="${data[key]}" `, "");
});