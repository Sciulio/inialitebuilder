/// <reference types="node" />
import { Stream } from 'stream';
import { tFileNaming } from './resx';
export declare function preparseFile(siteName: string, sourceFilePath: string, targetPath: string, outputPath: string): Promise<tFileNaming>;
export declare function parseFile(fn: tFileNaming): void;
export declare function precompileFile(fn: tFileNaming): void;
export declare function compileFile(fn: tFileNaming, forceCompile?: boolean): Promise<string | null>;
export declare function aftercompile(fn: tFileNaming, content: string | Stream | null): string;
export declare function prepersist(fn: tFileNaming, content: string | Stream | null): void;
