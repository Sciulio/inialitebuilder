import { tFileNaming } from "../resx";


export type tCompilerExport = {
  extension: string;
  persist: boolean;
  parse: (fn: tFileNaming) => void;
  precompile(fn: tFileNaming): void;
  compile: (fn: tFileNaming) => string;
}

export const NoOp = (...args: any[]) => null as any;