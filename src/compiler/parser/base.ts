import { tFileNaming } from "../resx";
import { Stream } from "stream";


// singleton type???
export interface ICompileExecutor {
  extension: string|string[];

  preparse(sourceFilePath: string): tCompileType;
  parse(fn: tFileNaming): Promise<void>;
  precompile(fn: tFileNaming): Promise<void>;
  compile(fn: tFileNaming): Promise<string|Stream>;
  aftercompile(fn: tFileNaming, content: string): Promise<string|Stream>;
}

export type tCompileType = {
  isPartial: boolean;
  type: "build-resx" | "site-resx" | "compilable";
  //persist: "persist" | "copy" | false;
};
export type tCompilerExportContent = string|Stream|{}|(string|Stream|{})[]|null;
//export type tCompilerExportContent = (string|Stream|{})[];
export type tCompilerExport = {
  extension: string|string[];
  //persist: boolean;
  preparse: (sourceFilePath: string) => tCompileType;
  parse: (fn: tFileNaming) => void;
  precompile(fn: tFileNaming): void;
  compile: (fn: tFileNaming) => Promise<tCompilerExportContent>;
  aftercompile: (fn: tFileNaming, content: tCompilerExportContent) => tCompilerExportContent;
}

export const NoOp = (...args: any[]) => null as any;