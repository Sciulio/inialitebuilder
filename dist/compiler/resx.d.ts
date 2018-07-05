import { tCompileType } from './parser/base';
export declare type tFileInfo = {
    fileName: string;
    ext: string;
    path: string;
    fullPath: string;
    fullPathNoExt: string;
    root: string;
};
export declare type tFileNaming = {
    fileName: string;
    relPath: string;
    cType: tCompileType;
    stats: {
        needsBuild: boolean;
        version: number;
    };
    src: tFileInfo;
    out: tFileInfo;
    www: {
        isPartial: boolean;
        url: string;
    };
};
export declare function toFileNaming(src_fullPath: string, targetPath: string, outputPath: string, cType: tCompileType): tFileNaming;
export declare function fnMustBeCompiled(out_fullPath: string, src_fullPath: string, ctype: tCompileType): boolean | null;
export declare function persistFile(fn: tFileNaming, content: string): void;
export declare function copyFile(fn: tFileNaming): void;
export declare function toRootRelPath(fn: tFileNaming, relPath: string): string;
export declare type tIoResxItem = {
    fn: tFileNaming;
    layout?: string;
    partials?: string[];
};
export declare class IoResxManager {
    items: tIoResxItem[];
    static readonly _instance: IoResxManager;
    static readonly instance: IoResxManager;
    private constructor();
    add(fn: tFileNaming): void;
    fnItem(filter?: (fn: tFileNaming) => boolean): tFileNaming;
    fnList(filter?: (fn: tFileNaming) => boolean): tFileNaming[];
    fnItemByExt(ext: string, filter?: (fn: tFileNaming) => boolean): tFileNaming;
    fnListByExt(ext: string, filter?: (fn: tFileNaming) => boolean): tFileNaming[];
    getCtxByFn(fn: tFileNaming): tIoResxItem;
    addLayoutTo(fn: tFileNaming, scrFullPath: string): void;
    addPartialTo(fn: tFileNaming, scrFullPath: string): void;
}
