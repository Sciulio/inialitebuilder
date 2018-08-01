/// <reference types="node" />
import { tFileNaming } from "../resx";
import { Stream } from "stream";
export interface ICompileExecutor {
    extension: string | string[];
    preparse(sourceFilePath: string): tCompileType;
    parse(fn: tFileNaming): Promise<void>;
    precompile(fn: tFileNaming): Promise<void>;
    compile(fn: tFileNaming): Promise<string | Stream>;
    aftercompile(fn: tFileNaming, content: string): Promise<string | Stream>;
}
export declare type tCompileType = {
    isPartial: boolean;
    type: "build-resx" | "site-resx" | "compilable";
};
export declare type tCompilerExport = {
    extension: string | string[];
    preparse: (sourceFilePath: string) => tCompileType;
    parse: (fn: tFileNaming) => void;
    precompile(fn: tFileNaming): void;
    compile: (fn: tFileNaming) => Promise<string>;
    aftercompile: (fn: tFileNaming, content: string | Stream | null) => string;
};
export declare const NoOp: (...args: any[]) => any;
