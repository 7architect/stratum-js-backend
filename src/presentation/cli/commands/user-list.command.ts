import { Command } from 'commander'
import { UserServiceFacade } from '@infra/facade/user-service.facade'
import { parseNumberOption } from '../utils/format'
import { printMessageTable } from '../utils/table'
import { printUsersTable } from '../renderers/user-renderer'

type ListOptions = {
  page: string
  perPage?: string
}

export function listUsersCommand(): Command {
  return new Command('list')
    .description('List users with pagination')
    .requiredOption('--page <page>', 'Page number')
    .option('--perPage <perPage>', 'Number of users per page')
    .action(async (options: ListOptions) => {
      const { page, perPage } = options

      const pageNumber = parseNumberOption(page, 1)
      const perPageNumber = parseNumberOption(perPage, 10)

      const result = await UserServiceFacade.getInstance().findAll(pageNumber, perPageNumber)

      printMessageTable(`Users list (page ${pageNumber}, perPage ${perPageNumber}, total ${result.total})`)
      printUsersTable(result.users)
    })
}
