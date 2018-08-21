export declare type baseDoc = {
    _id?: string;
};
export declare type docBuildAudit = baseDoc & {
    _type: "buildinfo";
    on: number;
    duration: number;
};
export declare type docFileAudit = baseDoc & {
    _type: "fileinfo";
    _on: number;
    path: string;
    url: string;
    audit: {
        action: "created" | "edited" | "deleted";
        version: number;
    };
    stats: {
        hash: string;
        size: number;
    };
    content: {
        type: string;
        visibility: "public" | "private";
    };
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
