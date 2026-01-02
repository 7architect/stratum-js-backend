import { Command } from 'commander'
import { UploadIntentServiceFacade } from '@/infrastructure/facade/upload-intent-service.facade'
import { printIntentResult } from '../renderers/intent-renderer'

type GetIntentOptions = {
  id: string
}

export function getIntentCommand(): Command {
  return new Command('get')
    .description('Get upload intent by ID')
    .requiredOption('--id <id>', 'Intent ID')
    .action(async (options: GetIntentOptions) => {
      const { id } = options
      const intent = await UploadIntentServiceFacade.getInstance().getIntent(id)
      printIntentResult(`Intent lookup for id: ${id}`, intent)
    })
}
