import { tCompileType, tCompilerExportContent } from './parser/base';
export declare const oMergeResx: {
    json: {
        ext: string;
        keyProp: string;
    };
    lang: {
        ext: string;
        keyProp: string;
    };
};
export declare type tFileNamingInfo = {
    fileName: string;
    ext: string;
    path: string;
    fullPath: string;
    fullPathNoExt: string;
    root: string;
};
export declare type tFileNaming = {
    siteName: string;
    fileName: string;
    relPath: string;
    cType: tCompileType;
    stats: {
        built: boolean;
        needsBuild: boolean;
        needsNewVersion: boolean;
        version: number;
        size?: number;
    };
    relations: {
        type: "layout" | "partial" | "build-resx";
        fn: tFileNaming;
    }[];
    src: tFileNamingInfo;
    out: tFileNamingInfo;
    www: {
        isPartial: boolean;
        url: string;
        hash?: string;
        has: {
            [key: string]: boolean;
        };
        type: string;
        charset: "" | "utf-8";
        lastModified: number;
    };
};
export declare function multiLanguageFileNameStrategy(fullPath: string, locale: string): string;
export declare function persistCompilerExportContent(fn: tFileNaming, cExpcExpContent: tCompilerExportContent): Promise<void>;
export declare function copyCompilerExportContent(fn: tFileNaming): Promise<void>;
export declare function toRootRelPath(fn: tFileNaming, relPath: string): string;
export declare class IoResxManager {
    items: tFileNaming[];
    static readonly _instance: IoResxManager;
    static readonly instance: IoResxManager;
    private constructor();
    create(siteName: string, src_fullPath: string, targetPath: string, outputPath: string, cType: tCompileType): Promise<tFileNaming>;
    add(fn: tFileNaming): tFileNaming;
    fnItem(filter?: (fn: tFileNaming) => boolean): tFileNaming;
    fnList(filter?: (fn: tFileNaming) => boolean): tFileNaming[];
    fnItemByExt(ext: string, filter?: (fn: tFileNaming) => boolean): tFileNaming;
    fnListByExt(ext: string, filter?: (fn: tFileNaming) => boolean): tFileNaming[];
}
