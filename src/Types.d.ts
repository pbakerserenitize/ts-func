import { AzureFunctionSchema } from './AzureFunctionSchema';
export declare type TsFuncRc = TsFuncRcWithOpts & Record<string, TsFuncRcExport>;
export declare type TsFuncRcAsync = () => Promise<AzureFunctionSchema>;
export declare type TsFuncRcSync = () => AzureFunctionSchema;
export declare type TsFuncRcExport = AzureFunctionSchema | TsFuncRcAsync | TsFuncRcSync;
export declare type TsFuncCase = 'none' | 'camel' | 'pascal';
export interface TsFuncRcWithOpts {
    /** The options export for .tsfuncrc */
    default?: TsFuncOptions;
}
export interface TsFuncOptions {
    /** Wether or not to translate exported names into camel, pascal, or 'none' case; default is camel. */
    case?: TsFuncCase;
    /** The path to a directory in which function app ocnfigs will be emitted. */
    rootDir?: string;
    /** Persist all function configurations even if cleanup is called. Default is false. */
    persist?: boolean;
}
export interface TsFuncRcHook {
    name: string;
    path: string;
    config: AzureFunctionSchema;
}
