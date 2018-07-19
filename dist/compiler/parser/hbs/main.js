"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const debug_1 = require("../../../libs/debug");
const lodash_1 = __importDefault(require("lodash"));
const handlebars_1 = __importDefault(require("handlebars"));
require("./helpers/main");
const html_minifier_1 = require("html-minifier");
const resx_1 = require("../../resx");
const main_1 = require("../../main");
var layouts = require('handlebars-layouts');
handlebars_1.default.registerHelper(layouts(handlebars_1.default));
exports.parsers = {
    handlebars: handlebars_1.default
};
const contentCache = {};
const templateCache = {};
function parseToAbsPath(isLayout, fn, content) {
    let extRegexp;
    let convertContent;
    //TODO: improve regex for '..."}}'
    if (isLayout) {
        extRegexp = /{{\s*#extend\s+"(.*?)"/ig;
        convertContent = (rootRelPathNoExt) => '{{#extend "' + rootRelPathNoExt + '"';
    }
    else {
        extRegexp = /{{\s*>\s+"??(.*?)\s+"??/ig;
        convertContent = (rootRelPath) => '{{> "' + rootRelPath + '"';
    }
    //TODO: block tag
    let match;
    while ((match = extRegexp.exec(content))) {
        const strip = match[0];
        const relPath = match[1].replace(/"/g, "");
        const rootRelPathNoExt = resx_1.toRootRelPath(fn, relPath);
        const rootRelPath = rootRelPathNoExt + ".hbs";
        content = content.replace(strip, convertContent(rootRelPathNoExt));
        fn.relations.push({
            type: isLayout ? "layout" : "partial",
            fn: resx_1.IoResxManager.instance.fnItem(fn => fn.src.fullPath == rootRelPath)
        });
    }
    return content;
}
function preparse(sourceFilePath) {
    return {
        isPartial: path_1.default.basename(sourceFilePath)[0] == '_',
        type: "compilable"
    };
}
;
function parse(fn) {
    debug_1._logInfo("\tParsing HBS"); //, fn.src.fullPath);
    let content = fs_1.default.readFileSync(fn.src.fullPath).toString();
    content = parseToAbsPath(true, fn, content);
    content = parseToAbsPath(false, fn, content);
    contentCache[fn.src.fullPath] = content;
}
function precompile(fn) {
    debug_1._logInfo("\tPrecompile HBS");
    let content = contentCache[fn.src.fullPath];
    if (fn.src.fileName[0] == '_') { // is partial
        const partialName = fn.fileName[0] == "_" ?
            fn.src.fullPathNoExt :
            fn.fileName;
        if (fn.fileName == "_layout" || fn.fileName.indexOf("_layout_") == 0) {
            debug_1._logInfo(`\t\tRegistering layout: on "${fn.src.fullPath}" as '${partialName}'`);
        }
        else {
            debug_1._logInfo(`\t\tRegistering partial: on "${fn.src.fullPath}" as '${partialName}'`);
        }
        exports.parsers.handlebars.registerPartial(partialName, content);
    }
    else {
        const template = exports.parsers.handlebars.compile(content);
        templateCache[fn.src.fullPath] = template;
    }
}
const mergeResx = {
    json: {
        ext: "json",
        keyProp: "data"
    },
    lang: {
        ext: "lang",
        keyProp: "locale"
    }
};
function mergeResxData(fn, ctx, mR) {
    const fnResx = resx_1.IoResxManager.instance.fnItemByExt(mR.ext, fn_resx => fn_resx.src.path == fn.src.path && fn_resx.fileName == fn.fileName);
    if (fnResx) {
        debug_1._logWarn("\t\t\t\tmerging content for", fn.src.fullPath, "from", fnResx.src.fullPath);
        let cCtx = main_1.compileFile(fnResx, true);
        ctx[mR.keyProp] = lodash_1.default.merge(ctx[mR.keyProp] || {}, cCtx);
    }
}
function prepareRelatedResxDate(srcFullPathNoExt, ctx) {
    const fnRelated = resx_1.IoResxManager.instance.fnItem(_fnItem => _fnItem.src.fullPathNoExt == srcFullPathNoExt);
    mergeResxData(fnRelated, ctx, mergeResx.json);
    mergeResxData(fnRelated, ctx, mergeResx.lang);
    ctx = prepareResxData(fnRelated, ctx);
}
function prepareResxData(fn, ctx = {}) {
    const fnRelLayout = fn.relations.filter(rel => rel.type == "layout")[0];
    if (fnRelLayout) {
        debug_1._logWarn("\t\t\textLayoutContext", fnRelLayout.fn.src.fullPath);
        prepareRelatedResxDate(fnRelLayout.fn.src.fullPathNoExt, ctx);
    }
    fn.relations
        .filter(fn => fn.type == "partial")
        .forEach(fnRelPartial => {
        debug_1._logWarn("\t\t\textPartialContext", fnRelPartial.fn.src.fullPath);
        prepareRelatedResxDate(fnRelPartial.fn.src.fullPathNoExt, ctx);
    });
    return ctx;
}
function compile(fn) {
    debug_1._logInfo("\tCompiling HBS"); //, fn.src.fullPath);
    const template = templateCache[fn.src.fullPath];
    if (template) {
        let ctx = prepareResxData(fn);
        mergeResxData(fn, ctx, mergeResx.json);
        mergeResxData(fn, ctx, mergeResx.lang);
        ctx["links"] = {
            isPartial: fn.www.isPartial,
            url: fn.www.url
        };
        return template(ctx);
    }
    return null;
}
function aftercompile(fn, content) {
    //TODO: load config
    return html_minifier_1.minify(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        preserveLineBreaks: true,
        removeComments: true
    });
}
exports.default = {
    extension: "hbs",
    //persist: true,
    preparse,
    parse,
    precompile,
    compile,
    aftercompile
};
//# sourceMappingURL=main.js.map