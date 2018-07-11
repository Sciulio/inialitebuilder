export declare type tFileInfo = {
    name: string;
    path: string;
    fullName: string;
    fullPath: string;
    ext: string;
    relPath: string;
    outPath: string;
    outFullPath: string;
};
export declare type tDictionary = {
    [path: string]: string | tDictionary;
};
export declare function getFilesRecusively(recursive: boolean, ...paths: string[]): Promise<string[]>;
export declare function getFilesRecusively(...paths: string[]): Promise<string[]>;
