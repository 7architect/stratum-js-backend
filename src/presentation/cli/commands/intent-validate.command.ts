import { Command } from 'commander'
import { UploadIntentServiceFacade } from '@/infrastructure/facade/upload-intent-service.facade'
import chalk from 'chalk'

type ValidateIntentOptions = {
  id: string
}

export function validateIntentCommand(): Command {
  return new Command('validate')
    .description('Validate upload intent by ID')
    .requiredOption('--id <id>', 'Intent ID')
    .action(async (options: ValidateIntentOptions) => {
      const { id } = options
      try {
        await UploadIntentServiceFacade.getInstance().validateIntent(id)
        console.log(chalk.green(`✓ Intent ${id} is valid and active`))
      } catch (error) {
        console.error(chalk.red(`✗ Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
        process.exit(1)
      }
    })
}
