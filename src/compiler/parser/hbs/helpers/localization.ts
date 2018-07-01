import * as handlebars from "handlebars";
import { _logWarn } from "../../../../libs/debug";


handlebars.registerHelper("localize", function(key) {
  const locale = ":en";
  console.log("localize", key)
  if (locale in key) {
    return key[locale];
  }
  _logWarn("Localization missing:", key, locale);
  return "";
});