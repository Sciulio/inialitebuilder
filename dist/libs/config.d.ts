export declare type tSiteConfig = {
    siteName: string;
    locale: string[];
};
export declare type tConfig = {
    target: {
        root: string;
        sites: tSiteConfig[];
    };
    output: {
        root: string;
    };
    phases: {
        [phase: string]: {
            root: string;
            username?: string;
            password?: string;
        };
    };
};
export declare function loadConfiguration(): tConfig;
