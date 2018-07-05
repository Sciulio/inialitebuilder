import { tFileNaming } from './resx';
export declare function preparseFile(sourceFilePath: string, targetPath: string, outputPath: string): tFileNaming;
export declare function parseFile(fn: tFileNaming): void;
export declare function precompileFile(fn: tFileNaming): void;
export declare function compileFile(fn: tFileNaming, forceCompile?: boolean): string | null;
export declare type tCompilationStatsItemSiteItem = {
    version: number;
    compiledOnLastBuild?: boolean;
};
export declare type tCompilationStatsItemSite = {
    [relPath: string]: tCompilationStatsItemSiteItem;
};
export declare type tCompilationStatsItem = {
    started: number;
    finished: number;
    build: number;
    sites: {
        [siteRoot: string]: tCompilationStatsItemSite;
    };
};
export declare type tCompilationStats = {
    previous: tCompilationStatsItem;
    current: tCompilationStatsItem;
};
export declare class CompilerManager {
    static readonly _instance: CompilerManager;
    static readonly instance: CompilerManager;
    private constructor();
    private _stats?;
    readonly stats: tCompilationStats;
    updateFileVersion(srcRoot: string, relPath: string, needsNewVersion: boolean): tCompilationStatsItemSiteItem;
    start(outputRoot: string): void;
    stop(outputRoot: string): void;
}
