import { tFileNaming } from './resx';
export declare function preparseFile(siteName: string, sourceFilePath: string, targetPath: string, outputPath: string): Promise<tFileNaming>;
export declare function parseFile(fn: tFileNaming): void;
export declare function precompileFile(fn: tFileNaming): void;
export declare function compileFile(fn: tFileNaming, forceCompile?: boolean): string | null;
