import { tFileNaming } from './resx';
export declare function parseFN(fn: tFileNaming): void;
export declare function precompileFile(fn: tFileNaming): void;
export declare function compileFile(fn: tFileNaming, forceCompile?: boolean): string | false | null;
export declare type tCompilationStats = {
    previous: {
        started: number;
        finished: number;
        build: number;
        files: {
            [srcFullPath: string]: number;
        };
    };
    current: {
        started: number;
        finished: number;
        build: number;
        files: {
            [srcFullPath: string]: number;
        };
    };
};
export declare class CompilerManager {
    static readonly _instance: CompilerManager;
    static readonly instance: CompilerManager;
    private constructor();
    private _stats?;
    readonly stats: tCompilationStats;
    start(outputRoot: string): void;
    stop(outputRoot: string): void;
}
