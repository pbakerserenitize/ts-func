"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileFunctionSchema = exports.getFunctionSchema = exports.quicktypeJsonSchema = void 0;
const fs_1 = require("fs");
const quicktype_core_1 = require("quicktype-core");
const request_it_client_1 = require("request-it-client");
const Strings_1 = require("quicktype-core/dist/support/Strings");
const Constants_1 = require("./Constants");
class ExtendedTypeScriptTargetLanguage extends quicktype_core_1.TypeScriptTargetLanguage {
    makeRenderer(renderContext, untypedOptionValues) {
        return new ExtendedTypeScriptRenderer(this, renderContext, quicktype_core_1.getOptionValues(quicktype_core_1.tsFlowOptions, untypedOptionValues));
    }
}
class ExtendedTypeScriptRenderer extends quicktype_core_1.TypeScriptRenderer {
    emitEnum(e, enumName) {
        this.emitDescription(this.descriptionForType(e));
        this.emitItem('export type ');
        this.emitItem(enumName);
        this.emitItem(' = ');
        this.forEachEnumCase(e, "none", (name, jsonName, position) => {
            if (position === 'only') {
                this.emitLine(`'${Strings_1.utf16StringEscape(jsonName)}'`);
            }
            else {
                if (position === 'first')
                    this.emitLine();
                this.indent(() => this.emitLine(`| '${Strings_1.utf16StringEscape(jsonName)}'`));
            }
        });
    }
}
async function quicktypeJsonSchema(inputs, comments = []) {
    const schemaInput = new quicktype_core_1.JSONSchemaInput(new quicktype_core_1.FetchingJSONSchemaStore());
    for (const input of inputs) {
        schemaInput.addSourceSync({
            name: input.name,
            schema: JSON.stringify(input.schema)
        });
    }
    const inputData = new quicktype_core_1.InputData();
    inputData.addInput(schemaInput);
    const outputData = await quicktype_core_1.quicktype({
        inputData,
        lang: new ExtendedTypeScriptTargetLanguage(),
        indentation: '  ',
        leadingComments: comments,
        rendererOptions: {
            'just-types': 'true',
            'explicit-unions': 'false'
        }
    });
    return outputData.lines.join('\n');
}
exports.quicktypeJsonSchema = quicktypeJsonSchema;
async function getFunctionSchema(write = false) {
    const response = await request_it_client_1.RequestIt.get(Constants_1.AZ_FUNC_SCHEMA_URL);
    if (response.statusCode === 200) {
        if (write) {
            if (!fs_1.existsSync(Constants_1.TS_FUNC_STORE))
                fs_1.mkdirSync(Constants_1.TS_FUNC_STORE);
            fs_1.writeFileSync(`${Constants_1.TS_FUNC_STORE}/${Constants_1.AZ_FUNC_SCHEMA_FILE}`, response.rawBody);
        }
        return response.json();
    }
    return {};
}
exports.getFunctionSchema = getFunctionSchema;
async function compileFunctionSchema(schema) {
    const banner = 'This file was automatically generated. DO NOT MODIFY IT BY HAND.';
    const deepCopy = JSON.parse(JSON.stringify(schema));
    const schemas = [];
    // #region Generate bindings asa separate file.
    const refs = deepCopy.definitions;
    const bindings = [];
    let bindingSchema = `// ${banner}\n\n`;
    for (const key of Object.keys(refs !== null && refs !== void 0 ? refs : {})) {
        if (['httpTrigger', 'dynamicBinding'].includes(key))
            continue;
        const interfaceName = (key.charAt(0).toUpperCase() + key.substring(1))
            .replace(/sms/gui, 'SMS')
            .replace(/http/gui, 'HTTP')
            .replace(/https/gui, 'HTTPS');
        if (interfaceName !== 'BindingBase')
            bindings.push(interfaceName);
        schemas.push({
            schema: {
                type: 'object',
                required: ['direction', 'type'],
                ...refs[key]
            },
            name: interfaceName
        });
    }
    bindingSchema += await quicktypeJsonSchema(schemas);
    bindingSchema += `\nexport type ${Constants_1.AZ_FUNC_BINDINGS_NAME} = \n  | ${bindings.join('\n  | ')}\n`;
    for (const binding of bindings) {
        bindingSchema = bindingSchema.replace(`interface ${binding}`, `interface ${binding} extends BindingBase`);
    }
    // #endregion
    // #region Destroy definitions and cast bindings to type of `any`
    delete deepCopy.definitions;
    if (typeof deepCopy.properties === 'object')
        deepCopy.properties.bindings.items = {};
    // #endregion
    const functionSchema = (await quicktypeJsonSchema([{ schema: deepCopy, name: Constants_1.AZ_FUNC_SCHEMA_NAME }], [banner]))
        .replace(`// ${banner}\n\n`, `//${banner}\n\nimport { ${Constants_1.AZ_FUNC_BINDINGS_NAME} } from './${Constants_1.AZ_FUNC_BINDINGS_NAME}'\n\n`)
        .replace('bindings?: any[]', `bindings?: ${Constants_1.AZ_FUNC_BINDINGS_NAME}[]`);
    return {
        functionSchema,
        bindingSchema
    };
}
exports.compileFunctionSchema = compileFunctionSchema;
