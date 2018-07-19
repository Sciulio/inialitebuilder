/// <reference types="node" />
import { tFileNaming } from './resx';
import { Stream } from 'stream';
export declare function preparseFile(siteName: string, sourceFilePath: string, targetPath: string, outputPath: string): Promise<tFileNaming>;
export declare function parseFile(fn: tFileNaming): void;
export declare function precompileFile(fn: tFileNaming): void;
export declare function compileFile(fn: tFileNaming, forceCompile?: boolean): string | null;
export declare function aftercompile(fn: tFileNaming, content: string | Stream | null): string;
