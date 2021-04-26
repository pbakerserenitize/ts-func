import { writeFileSync } from 'fs'
import { getFunctionSchema, compileFunctionSchema, AZ_FUNC_SCHEMA_NAME, AZ_FUNC_BINDINGS_NAME } from './src/AzureFunctionSchemaHelpers'

export async function generate () {
  const schema = await getFunctionSchema()
  const ts = await compileFunctionSchema(schema)

  writeFileSync(`src/${AZ_FUNC_SCHEMA_NAME}.ts`, ts.functionSchema)
  writeFileSync(`src/${AZ_FUNC_BINDINGS_NAME}.ts`, ts.bindingSchema)
}
