import path from 'path';
import fs from 'fs';

import mkpath from 'mkpath';

import { _log, _logSeparator, _logInfo } from "./libs/debug";
import { getFilesRecusively } from "./libs/io";

import { CompilerManager, parseFN, precompileFile, compileFile } from './compiler/main';
import { toFileNamingSet, IoResxManager, persistFile } from './compiler/resx';

type tConfig = {
  target: {
    root: string,
    sites: string[]
  },
  output: {
    root: string
  }
}

export function build() {
  //(require as any).main.filename
  const config = require(path.join(process.cwd(), "inia-config.json")) as tConfig;
  _log("Configs:");
  _log(config);
  _logSeparator();

  CompilerManager.instance.start(config.output.root);

  config.target.sites
  .forEach(sitePath => {
    const targetPath = path.join(config.target.root, sitePath);
    const outputPath = path.join(config.output.root, sitePath);

    _log(sitePath, targetPath, outputPath);
    _logSeparator();

    const sourceFileSet = getFilesRecusively(targetPath);

    _log(sourceFileSet);

    const namedFileSet = toFileNamingSet(sourceFileSet, targetPath, outputPath);

    //parseFileSet(namedFileSet);
    _logInfo("Parsing FileSet -----------------------------------------------------");
    namedFileSet.forEach(parseFN);

    //precompileFileSet();
    _logInfo("Precompile FileSet -----------------------------------------------------");
    IoResxManager.instance.fnList().forEach(precompileFile);

    _logInfo("Compile FileSet -----------------------------------------------------");
    IoResxManager.instance.fnList()
    .filter(fn => fn.fileName[0] != '_')
    .map(fn => compileFile(fn));
  });

  CompilerManager.instance.stop(config.output.root);
};