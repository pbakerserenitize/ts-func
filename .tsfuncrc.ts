import { HTTPBinding } from './src/AzureFunctionBindings'
import type { TsFuncOptions } from './src/Types'
import type { AzureFunctionSchema } from './src/AzureFunctionSchema'

const options: TsFuncOptions = {
  case: 'pascal'
}

export default options

export const myFantasticHook: AzureFunctionSchema = {
  bindings: [
    {
      name: 'someOutput',
      type: 'queueTrigger',
      direction: 'in',
      queueName: 'some-queue'
    }
  ],
  scriptFile: 'd.gkjndf.gnjde'
}

export function httpServiceExample (): AzureFunctionSchema {
  const http: HTTPBinding = {
    name: 'someHttp',
    type: 'httpTrigger',
    direction: 'in',
    methods: ['get']
  }

  return {
    bindings: [http],
    disabled: process.env.TEST_MODE === 'true'
  }
}
