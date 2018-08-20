import 'async-extensions';
import { tSiteConfig } from './libs/config';
export declare function doPhase(phaseName: string, siteName: string): void;
export declare function build(outputPhase: string): Promise<void>;
export declare function currentBuildingContext(): {
    siteConfig: tSiteConfig;
    data: {
        [key: string]: any;
    };
};
