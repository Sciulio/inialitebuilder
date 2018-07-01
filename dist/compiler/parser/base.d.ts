import { tFileNaming } from "../resx";
export declare type tCompilerExport = {
    extension: string;
    persist: boolean;
    parse: (fn: tFileNaming) => void;
    precompile(fn: tFileNaming): void;
    compile: (fn: tFileNaming) => string;
};
export declare const NoOp: (...args: any[]) => any;
