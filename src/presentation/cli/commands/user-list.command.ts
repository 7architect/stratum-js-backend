import { Command } from 'commander'
import { UserServiceFacade } from '@/infrastructure/facade/user-service.facade'
import { parseNumberOption } from '../utils/format'
import { printMessageTable } from '../utils/table'
import { printUsersTable } from '../renderers/user-renderer'
import type { UserDTO } from '@/users/presentation/dto/user.dto'

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

      const result: { users: UserDTO[], total: number } = await UserServiceFacade.getInstance().findAll(pageNumber, perPageNumber)

      printMessageTable(`Users list (page ${pageNumber}, perPage ${perPageNumber}, total ${result.total})`)
      printUsersTable(result.users)
    })
}
