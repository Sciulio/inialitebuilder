export declare type baseDoc = {
    _id?: string;
};
export declare type docBuildAudit = baseDoc & {
    type: "buildinfo";
    on: number;
    duration: number;
};
export declare type docFileAudit = baseDoc & {
    type: "fileinfo";
    _on: number;
    path: string;
    url: string;
    action: "created" | "edited" | "deleted";
    version: number;
    hash: string;
    size: number;
    has: {
        [keyProp: string]: boolean;
    };
};
export declare type tBuildAudit = docBuildAudit & {};
export declare type tFileAudit = docFileAudit & {
    buildInfo: tBuildAudit;
};
export declare function initDb(siteName: string): Promise<{}>;
export declare function disposeDb(siteName: string): Promise<void>;
export declare function fileLastAudit(siteName: string, relPath: string): Promise<tFileAudit>;
export declare function lastBuildInfo(siteName: string): Promise<tBuildAudit>;
