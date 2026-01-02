import { Command } from 'commander'
import { UserServiceFacade } from '@/infrastructure/facade/user-service.facade'
import { printUserResult } from '../renderers/user-renderer'
import type { UserDTO } from '@/users/presentation/dto/user.dto'

type DeleteOptions = {
  id: string
}

export function deleteUserCommand(): Command {
  return new Command('delete')
    .description('Delete user by id')
    .requiredOption('--id <id>', 'User id')
    .action(async (options: DeleteOptions) => {
      const { id } = options
      const userDto: UserDTO = await UserServiceFacade.getInstance().deleteUser(id)
      printUserResult(`User deleted (id: ${userDto.id})`, userDto)
    })
}
