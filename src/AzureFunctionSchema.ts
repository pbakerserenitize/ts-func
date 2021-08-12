//This file was automatically generated. DO NOT MODIFY IT BY HAND.

import { AzureFunctionBindings } from './AzureFunctionBindings'

export interface AzureFunctionSchema {
  /**
   * A list of function bindings.
   */
  bindings?: AzureFunctionBindings[];
  /**
   * For C# precompiled functions only. If set to 'attributes', use WebJobs attributes to
   * specify bindings. Otherwise, use the 'bindings' property of this function.json.
   */
  configurationSource?: ConfigurationSource;
  /**
   * If set to true, marks the function as disabled (it cannot be triggered).
   */
  disabled?: boolean;
  /**
   * Optional named entry point.
   */
  entryPoint?: string;
  /**
   * If set to true, the function will not be loaded, compiled, or triggered.
   */
  excluded?: boolean;
  /**
   * Retry policy of function execution failures.
   */
  retry?: Retry;
  /**
   * Optional path to function script file.
   */
  scriptFile: string;
}

/**
 * For C# precompiled functions only. If set to 'attributes', use WebJobs attributes to
 * specify bindings. Otherwise, use the 'bindings' property of this function.json.
 */
export type ConfigurationSource = 
  | 'attributes'
  | 'config'

/**
 * Retry policy of function execution failures.
 */
export interface Retry {
  /**
   * Value indicating the delayInterval for function execution retries when using FixedDelay
   * strategy.
   */
  delayInterval?: null | string;
  /**
   * Value indicating the maximumInterval for function execution retries when using
   * ExponentialBackoff strategy.
   */
  maximumInterval?: null | string;
  /**
   * The maximum number of retries allowed per function execution. -1 means to retry
   * indefinitely.
   */
  maxRetryCount?: number;
  /**
   * Value indicating the minimumInterval for function execution retries when using
   * ExponentialBackoff strategy.
   */
  minimumInterval?: null | string;
  /**
   * Retry strategy to use for retrying function executions
   */
  strategy?: Strategy;
}

/**
 * Retry strategy to use for retrying function executions
 */
export type Strategy = 
  | 'exponentialBackoff'
  | 'fixedDelay'
