import { Command } from 'commander'
import { UserServiceFacade } from '@/infrastructure/facade/user-service.facade'
import { printUserResult } from '../renderers/user-renderer'
import type { UserDTO } from '@/users/presentation/dto/user.dto'

type FindOptions = {
  id: string
}

export function findUserCommand(): Command {
  return new Command('find')
    .description('Find user by id')
    .requiredOption('--id <id>', 'User id')
    .action(async (options: FindOptions) => {
      const { id } = options
      const userDto: UserDTO | null = await UserServiceFacade.getInstance().findById(id)
      printUserResult(`User lookup for id: ${id}`, userDto)
    })
}
