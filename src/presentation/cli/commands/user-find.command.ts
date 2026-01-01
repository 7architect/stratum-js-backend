import { Command } from 'commander'
import { UserServiceFacade } from '@infra/facade/user-service.facade'
import { printUserResult } from '../renderers/user-renderer'

type FindOptions = {
  id: string
}

export function findUserCommand(): Command {
  return new Command('find')
    .description('Find user by id')
    .requiredOption('--id <id>', 'User id')
    .action(async (options: FindOptions) => {
      const { id } = options
      const user = await UserServiceFacade.getInstance().findById(id)
      printUserResult(`User lookup for id: ${id}`, user)
    })
}
