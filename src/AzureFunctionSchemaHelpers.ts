import { existsSync, mkdirSync, writeFileSync } from 'fs'
import {
  quicktype,
  JSONSchemaInput,
  FetchingJSONSchemaStore,
  InputData,
  TypeScriptTargetLanguage,
  TypeScriptRenderer,
  RenderContext,
  getOptionValues,
  tsFlowOptions,
  EnumType,
  Name,
} from 'quicktype-core'
import type { JSONSchema4 } from 'json-schema'
import { RequestIt } from 'request-it-client'
import { utf16StringEscape } from 'quicktype-core/dist/support/Strings'

interface SchemaInput {
  name: string
  schema: Record<string, any>
}

export const AZ_FUNC_BINDINGS_NAME = 'AzureFunctionBindings'
export const AZ_FUNC_SCHEMA_FILE = 'function.schema.json'
export const AZ_FUNC_SCHEMA_NAME = 'AzureFunctionSchema'
export const AZ_FUNC_SCHEMA_URL = 'http://json.schemastore.org/function'
export const TS_FUNC_STORE = '.ts-func'

class ExtendedTypeScriptTargetLanguage extends TypeScriptTargetLanguage {
  protected makeRenderer(renderContext: RenderContext, untypedOptionValues: { [name: string]: any }): ExtendedTypeScriptRenderer {
    return new ExtendedTypeScriptRenderer(this, renderContext, getOptionValues(tsFlowOptions, untypedOptionValues))
  }
}

class ExtendedTypeScriptRenderer extends TypeScriptRenderer {
  protected emitEnum(e: EnumType, enumName: Name): void {
    this.emitDescription(this.descriptionForType(e))
    this.emitItem('export type ')
    this.emitItem(enumName)
    this.emitItem(' = ')
    this.forEachEnumCase(e, "none", (name, jsonName, position) => {
      if (position === 'only') {
        this.emitLine(`'${utf16StringEscape(jsonName)}'`)
      } else {
        if (position === 'first') this.emitLine()

        this.indent(() => this.emitLine(`| '${utf16StringEscape(jsonName)}'`))
      }
    })
  }
}

export async function quicktypeJsonSchema (inputs: SchemaInput[], comments: string[] = []) {
  const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore())
  for (const input of inputs) {
    schemaInput.addSourceSync({
      name: input.name,
      schema: JSON.stringify(input.schema)
    })
  }

  const inputData = new InputData()
  inputData.addInput(schemaInput)

  const outputData = await quicktype({
    inputData,
    lang: new ExtendedTypeScriptTargetLanguage(),
    indentation: '  ',
    leadingComments: comments,
    rendererOptions: {
      'just-types': 'true',
      'explicit-unions': 'false'
    }
  })

  return outputData.lines.join('\n')
}

export async function getFunctionSchema (write: boolean = false): Promise<Record<string, any>> {
  const response = await RequestIt.get(AZ_FUNC_SCHEMA_URL)

  if (response.statusCode === 200) {
    if (write) {
      if (!existsSync(TS_FUNC_STORE)) mkdirSync(TS_FUNC_STORE)

      writeFileSync(`${TS_FUNC_STORE}/${AZ_FUNC_SCHEMA_FILE}`, response.rawBody)
    }

    return response.json()
  }

  return {}
}

export async function compileFunctionSchema (schema: Record<string, any>): Promise<{
  functionSchema: string
  bindingSchema: string
}> {
  const banner = 'This file was automatically generated. DO NOT MODIFY IT BY HAND.'
  const deepCopy: JSONSchema4 = JSON.parse(JSON.stringify(schema))
  const schemas: SchemaInput[] = []

  // #region Generate bindings asa separate file.
  const refs: Record<string, JSONSchema4> = deepCopy.definitions as any
  const bindings: string[] = []
  let bindingSchema = `// ${banner}\n\n`

  for (const key of Object.keys(refs ?? {})) {
    if (['httpTrigger', 'dynamicBinding'].includes(key)) continue

    const interfaceName = (key.charAt(0).toUpperCase() + key.substring(1))
      .replace(/sms/gui, 'SMS')  
      .replace(/http/gui, 'HTTP')
      .replace(/https/gui, 'HTTPS')

    if (interfaceName !== 'BindingBase') bindings.push(interfaceName)

    schemas.push({
      schema: {
        type: 'object',
        required: ['direction', 'type'],
        ...refs[key]
      },
      name: interfaceName
    })
  }

  bindingSchema += await quicktypeJsonSchema(schemas)
  bindingSchema += `\nexport type ${AZ_FUNC_BINDINGS_NAME} = \n  | ${bindings.join('\n  | ')}\n`

  for (const binding of bindings) {
    bindingSchema = bindingSchema.replace(`interface ${binding}`, `interface ${binding} extends BindingBase`)
  }
  // #endregion

  // #region Destroy definitions and cast bindings to type of `any`
  delete deepCopy.definitions

  if (typeof deepCopy.properties === 'object') deepCopy.properties.bindings.items = {}
  // #endregion

  const functionSchema = (await quicktypeJsonSchema([{ schema: deepCopy, name: AZ_FUNC_SCHEMA_NAME }], [banner]))
    .replace(`// ${banner}\n\n`, `//${banner}\n\nimport { ${AZ_FUNC_BINDINGS_NAME} } from './${AZ_FUNC_BINDINGS_NAME}'\n\n`)
    .replace('bindings?: any[]', `bindings?: ${AZ_FUNC_BINDINGS_NAME}[]`)

  return {
    functionSchema,
    bindingSchema
  }
}
