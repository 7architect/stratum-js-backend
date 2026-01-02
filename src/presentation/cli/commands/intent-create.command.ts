import { Command } from 'commander'
import { UploadIntentServiceFacade } from '@/infrastructure/facade/upload-intent-service.facade'
import { printIntentResult } from '../renderers/intent-renderer'

type CreateIntentOptions = {
  expiresAt?: string
  sizeLimit?: string
  mimeType?: string
}

export function createIntentCommand(): Command {
  return new Command('create')
    .description('Create upload intent')
    .option('--expires-at <date>', 'Intent expiry date (ISO 8601)')
    .option('--size-limit <bytes>', 'Max file size in bytes')
    .option('--mime-type <type>', 'Allowed MIME type')
    .action(async (options: CreateIntentOptions) => {
      const intent = await UploadIntentServiceFacade.getInstance().createIntent({
        expiresAt: options.expiresAt ? new Date(options.expiresAt) : undefined,
        sizeLimit: options.sizeLimit ? Number.parseInt(options.sizeLimit, 10) : undefined,
        mimeType: options.mimeType,
      })
      printIntentResult('Upload intent created', intent)
    })
}
