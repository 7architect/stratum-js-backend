import { Command } from 'commander'
import { UserServiceFacade } from '@infra/facade/user-service.facade'
import { printUserResult } from '../renderers/user-renderer'

type DeleteOptions = {
  id: string
}

export function deleteUserCommand(): Command {
  return new Command('delete')
    .description('Delete user by id')
    .requiredOption('--id <id>', 'User id')
    .action(async (options: DeleteOptions) => {
      const { id } = options
      const user = await UserServiceFacade.getInstance().deleteUser(id)
      printUserResult(`User deleted (id: ${user.id})`, user)
    })
}
