export declare type docBuildAudit = {
    on: number;
    duration: number;
};
export declare type docFileAudit = {
    _on: number;
    srcFullPath: string;
    action: "created" | "edited" | "deleted";
    version: number;
};
export declare type tBuildAudit = docBuildAudit & {};
export declare type tFileAudit = docFileAudit & {
    buildInfo: tBuildAudit;
};
export declare function initDb(siteName: string): Promise<{}>;
export declare function disposeDb(siteName: string): void;
export declare function fileLastAudit(siteName: string, srcFullPath: string): Promise<tFileAudit>;
export declare function lastBuildInfo(siteName: string): Promise<tBuildAudit>;
