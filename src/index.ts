import path from 'path';

import { _log, _logSeparator, _logInfo, _logError } from "./libs/debug";
import { getFilesRecusively } from "./libs/io";

import { CompilerManager, parseFile, precompileFile, compileFile, preparseFile } from './compiler/main';
import { IoResxManager, persistFile, copyFile } from './compiler/resx';
import { loadConfiguration, tConfig } from './libs/config';


function start() {
  const config = loadConfiguration();

  _log("Configs:");
  _log(config);
  _logSeparator();

  CompilerManager.instance.start(config.output.root);

  return config;
}
function end(config: tConfig) {
  CompilerManager.instance.stop(config.output.root);
}

export function doPhase(phaseName: string, siteName: string) {
  const config = start();

  if (!(phaseName in config.phases)) {
    _logError(`Phase passed "${phaseName}" is not existent!`);
    return;
  }

  const phase = config.phases[phaseName];

  /*config.target.sites
  .filter(_siteName => !siteName || siteName == _siteName)
  .forEach(sitePath => {
    Object.keys(CompilerManager.instance.stats.current.files)
    .forEach(srcFileFullPath => {
      const srcFilePath = path.dirname(srcFileFullPath);

      mkdirSync(filePath);
      fs.copyFileSync(filePath, filePath);
    });
  });*/

  end(config);
}
export function build(outputPhase: string) {
  const config = start();

  config.target.sites
  .forEach(sitePath => {
    const targetPath = path.join(config.target.root, sitePath);
    const outputPath = path.join(config.output.root, sitePath);

    _log(sitePath, targetPath, outputPath);
    _logSeparator();

    const sourceFileSet = getFilesRecusively(targetPath);

    _log(sourceFileSet);

    _logInfo("PreParsing FileSet -----------------------------------------------------");
    const namedFileSet = sourceFileSet
    .map(sourceFilePath => preparseFile(sourceFilePath, targetPath, outputPath));

    //parseFileSet(namedFileSet);
    _logInfo("Parsing FileSet -----------------------------------------------------");
    namedFileSet
    .forEach(parseFile);

    //precompileFileSet();
    _logInfo("Precompile FileSet -----------------------------------------------------");
    IoResxManager.instance.fnList()
    .forEach(precompileFile);

    _logInfo("Compile FileSet -----------------------------------------------------");
    const compiledSet = IoResxManager.instance.fnList()
    .filter(fn => fn.fileName[0] != '_')
    .map(fn => {
      return {
        fn,
        content: compileFile(fn)
      };
    });

    _logInfo("Persisting FileSet -----------------------------------------------------");
    compiledSet
    .forEach(cItem => {
      switch (cItem.fn.cType.type) {
        case "compilable":
          if (cItem.content) {
            persistFile(cItem.fn, cItem.content);
          }
          break;
        case "site-resx":
          copyFile(cItem.fn);
          break;
        case "build-resx": break;
      }
    });
  });

  end(config);
};