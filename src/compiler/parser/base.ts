import { tFileNaming } from "../resx";


export type tCompileType = {
  isPartial: boolean;
  type: "build-resx" | "site-resx" | "compilable";
  //persist: "persist" | "copy" | false;
};
export type tCompilerExport = {
  extension: string|string[];
  //persist: boolean;
  preparse: (sourceFilePath: string) => tCompileType;
  parse: (fn: tFileNaming) => void;
  precompile(fn: tFileNaming): void;
  compile: (fn: tFileNaming) => string;
}

export const NoOp = (...args: any[]) => null as any;