interface SchemaInput {
    name: string;
    schema: Record<string, any>;
}
export declare function quicktypeJsonSchema(inputs: SchemaInput[], comments?: string[]): Promise<string>;
export declare function getFunctionSchema(write?: boolean): Promise<Record<string, any>>;
export declare function compileFunctionSchema(schema: Record<string, any>): Promise<{
    functionSchema: string;
    bindingSchema: string;
}>;
export {};
