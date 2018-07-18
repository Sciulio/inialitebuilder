import path from 'path';
import crypto from 'crypto';

import { _log, _logSeparator, _logInfo, _logError } from "./libs/debug";
import { getFilesRecusively } from "./libs/io";

import { parseFile, precompileFile, compileFile, preparseFile } from './compiler/main';
import { persistFile, copyFile } from './compiler/resx';
import { loadConfiguration, tConfig } from './libs/config';
import { initDb, disposeDb } from './libs/audit';


function start() {
  const config = loadConfiguration();

  _log("Configs:");
  _log(config);
  _logSeparator();

  //CompilerManager.instance.start(config.output.root);

  return config;
}
function end(config: tConfig) {
  //CompilerManager.instance.stop(config.output.root);
}

export function doPhase(phaseName: string, siteName: string) {
  const config = start();

  if (!(phaseName in config.phases)) {
    _logError(`Phase passed "${phaseName}" is not existent!`);
    return;
  }

  const phase = config.phases[phaseName];

  end(config);
}

export async function build(outputPhase: string) {
  const config = start();

  const promises = config.target.sites
  .map(async siteName => {
    //CompilerManager.instance.building(siteName);
    await initDb(siteName);

    const targetPath = path.join(config.target.root, siteName);
    const outputPath = path.join(config.output.root, siteName);

    _log(siteName, targetPath, outputPath);
    _logSeparator();

    const sourceFileSet = await getFilesRecusively(targetPath);

    _log(sourceFileSet);

    _logInfo("PreParsing FileSet -----------------------------------------------------");
    const namedFileSet = await Promise.all(
      sourceFileSet
      .map(sourceFilePath => preparseFile(siteName, sourceFilePath, targetPath, outputPath))
    );

    _logInfo("Parsing FileSet -----------------------------------------------------");
    namedFileSet
    .map(parseFile);

    _logInfo("Precompile FileSet -----------------------------------------------------");
    namedFileSet
    .forEach(precompileFile);

    _logInfo("Compile FileSet -----------------------------------------------------");
    const compiledSet = namedFileSet
    .filter(fn => fn.fileName[0] != '_')
    .map(fn => {
      const content = compileFile(fn) || "";
      fn.www.hash = crypto
      .createHash('md5')
      .update(content)
      .digest("hex");

      return {
        fn,
        content
      };
    });

    _logInfo("Persisting FileSet -----------------------------------------------------");
    compiledSet
    .forEach(async cItem => {
      switch (cItem.fn.cType.type) {
        case "compilable":
          if (cItem.content) {
            await persistFile(cItem.fn, cItem.content);
          }
          break;
        case "site-resx":
          await copyFile(cItem.fn);
          break;
        case "build-resx": break;
      }
    });
    
    await disposeDb(siteName);
  });
  await Promise.all(promises);

  end(config);
};