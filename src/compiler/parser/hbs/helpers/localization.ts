import * as handlebars from "handlebars";
import { _logWarn } from "../../../../libs/debug";
import { currentBuildingContext } from "../../../..";
import { oMergeResx } from "../../../resx";


handlebars.registerHelper("localize", function(key) {
  const bCtx = currentBuildingContext();
  const locale = ":" + bCtx.data[oMergeResx.lang.keyProp];

  console.log("localize", locale, key)

  if (locale in key) {
    return key[locale];
  }

  _logWarn("Localization missing:", key, locale);
  return "";
});