import { QueueBinding } from '../src/AzureFunctionBindings'
import type { AzureFunctionSchema } from '../src/AzureFunctionSchema'

export const myFantasticHook: AzureFunctionSchema = {
  bindings: [
    {
      name: 'someOutput',
      type: 'queueTrigger',
      direction: 'in',
      queueName: 'some-queue'
    }
  ]
}
