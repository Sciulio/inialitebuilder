import * as handlebars from "handlebars";


function checkUrl(thisLink: string, checkLink: string): boolean {
  if (checkLink == '/' || checkLink == '/index'  || checkLink == '/index.html') {
    checkLink = '/index.html';
  }
  if (thisLink == '/' || thisLink == '/index'  || thisLink == '/index.html') {
    thisLink = '/index.html';
  }

  if (checkLink.split(".").length == 1 || thisLink.split(".").length == 1) {
    checkLink = checkLink.split(".")[0];
    thisLink = thisLink.split(".")[0];
  }

  return thisLink == checkLink;
}
handlebars.registerHelper('iscurrentlink', function (this: any, thisLink, checkLink, options) {
  const ctx = this;

  if (checkUrl(thisLink, checkLink)) {
    return options.fn(ctx);
  }
  return options.inverse(ctx);
});
handlebars.registerHelper('link', function(text: string, url: string, links: any) {
  url = handlebars.escapeExpression(url);
  text = handlebars.escapeExpression(text);

  return new handlebars.SafeString(
    `<a href="${url}" class="${checkUrl(links.url, url) ? "current" : ""}">${text}</a>`
  );
});