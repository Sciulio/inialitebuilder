import path from 'path';

import 'async-extensions';

import { _log, _logSeparator, _logInfo, _logError } from "./libs/debug";
import { getFilesRecusively } from "./libs/io";

import { parseFile, precompileFile, compileFile, preparseFile, aftercompile, prepersist, afterpersist, persist } from './compiler/main';
import { tFileNaming } from './compiler/resx';
import { loadConfiguration, tConfig, tSiteConfig } from './libs/config';
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
  try {
    const config = start();

    await config.target.sites
    .mapAsync(async siteConfig => await _build(siteConfig));

    end(config);
  } catch (e) {
    _logError(e);
  }
}

function _logException<T, W>(err: Error, item: T, idx: number): W {
  _logError(idx, (item as any as tFileNaming).src ? (item as any as tFileNaming).src.fullPath : item, err);

  return null as any;

  // throw => to end execution
}

//TODO: add a building context
let _buildingContext: {
  siteConfig: tSiteConfig;
  data: {[key: string]: any}
};
export function currentBuildingContext() {
  return _buildingContext;
}

async function _build(siteConfig: tSiteConfig) {
  _buildingContext = {
    siteConfig,
    data: {}
  };

  const config = loadConfiguration();

  //CompilerManager.instance.building(siteName);
  await initDb(siteConfig.siteName);

  const targetPath = path.join(config.target.root, siteConfig.siteName);
  const outputPath = path.join(config.output.root, siteConfig.siteName);

  _log(siteConfig.siteName, targetPath, outputPath);
  _logSeparator();

  const sourceFileSet = await getFilesRecusively(targetPath);

  _log(sourceFileSet);

  _logInfo("PreParsing FileSet -----------------------------------------------------");
  const namedFileSet = await sourceFileSet
  .mapAsync(
    async sourceFilePath => await preparseFile(siteConfig.siteName, sourceFilePath, targetPath, outputPath),
    _logException as any
  );

  _logInfo("Parsing FileSet -----------------------------------------------------");
  namedFileSet
  .map(parseFile);

  _logInfo("Precompile FileSet -----------------------------------------------------");
  namedFileSet
  .forEach(precompileFile);
  
  //TODO: use streams where possible for compiled content
  _logInfo("Compile FileSet -----------------------------------------------------");
  const compiledSet = await namedFileSet
  .filter(fn => fn.fileName[0] != '_')
  .mapAsync(async fn => {
    let content = await compileFile(fn);

    // update lastmodified if file does not need to be built but has been built because of related resources
    if (fn.stats.built && !fn.stats.needsBuild) {
      fn.www.lastModified = Date.now();
    }

    return {
      fn,
      content
    };
  }, _logException as any);

  _logInfo("Aftercompile -----------------------------------------------------");
  await compiledSet
  .forEachAsync(async cItem => {
    cItem.content = aftercompile(cItem.fn, cItem.content);
  });

  _logInfo("Prepersisting and Persisting FileSet -----------------------------------------------------");
  await compiledSet
  .forEachAsync(async cItem => {
    await prepersist(cItem.fn, cItem.content);

    await persist(cItem.fn, cItem.content);

    await afterpersist(cItem.fn);
  });

  await disposeDb(siteConfig.siteName);
};