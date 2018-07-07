export declare type tConfig = {
    target: {
        root: string;
        sites: string[];
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
