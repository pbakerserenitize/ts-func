import del from 'del'
import { writeFileSync } from 'fs'
import { getFunctionSchema, compileFunctionSchema } from './src/AzureFunctionSchemaHelpers'
import { AZ_FUNC_SCHEMA_NAME, AZ_FUNC_BINDINGS_NAME } from './index'

export async function generate () {
  const schema = await getFunctionSchema()
  const ts = await compileFunctionSchema(schema)

  writeFileSync(`src/${AZ_FUNC_SCHEMA_NAME}.ts`, ts.functionSchema)
  writeFileSync(`src/${AZ_FUNC_BINDINGS_NAME}.ts`, ts.bindingSchema)
}

export async function cleanup (): Promise<void> {
  await del([
    '**/*.d.ts',
    '**/*.js',
    '**/*.js.map'
  ], {
    ignore: ['**/node_modules/**']
  })
}
