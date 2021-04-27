import { AzureFunctionSchema } from './AzureFunctionSchema'

export type TsFuncRc = TsFuncRcWithOpts & Record<string, TsFuncRcExport>

export type TsFuncRcAsync = () => Promise<AzureFunctionSchema>
export type TsFuncRcSync = () => AzureFunctionSchema
export type TsFuncRcExport = AzureFunctionSchema | TsFuncRcAsync | TsFuncRcSync

export type TsFuncCase = 'none' | 'camel' | 'pascal'

export interface TsFuncRcWithOpts {
  /** The options export for .tsfuncrc */
  default?: TsFuncOptions
}

export interface TsFuncOptions {
  /** Wether or not to translate exported names into camel, pascal, or 'none' case; default is camel. */
  case?: TsFuncCase
  /** The path to a directory in which function app ocnfigs will be emitted. */
  rootDir?: string
}

export interface TsFuncRcHook {
  name: string
  path: string
  config: AzureFunctionSchema
}
