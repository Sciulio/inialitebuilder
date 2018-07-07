import { tFileNaming } from "../resx";
export declare type tCompileType = {
    isPartial: boolean;
    type: "build-resx" | "site-resx" | "compilable";
};
export declare type tCompilerExport = {
    extension: string | string[];
    preparse: (sourceFilePath: string) => tCompileType;
    parse: (fn: tFileNaming) => void;
    precompile(fn: tFileNaming): void;
    compile: (fn: tFileNaming) => string;
};
export declare const NoOp: (...args: any[]) => any;
