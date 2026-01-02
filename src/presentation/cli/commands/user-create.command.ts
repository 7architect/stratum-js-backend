import { Command } from 'commander'
import { UserServiceFacade } from '@/infrastructure/facade/user-service.facade'
import { AuthServiceFacade } from '@/infrastructure/facade/auth-service.facade'
import { printUserResult } from '../renderers/user-renderer'
import type { UserDTO } from '@/users/presentation/dto/user.dto'

type CreateOptions = {
  email: string
  password: string
}

export function createUserCommand(): Command {
  return new Command('create')
    .description('Create new user')
    .requiredOption('--email <email>', 'User email')
    .requiredOption('--password <password>', 'User password')
    .action(async (options: CreateOptions) => {
      const { email, password } = options
      const authService = AuthServiceFacade.getInstance()
      const passwordHash = await authService.generatePasswordHash(password)
      const userDto: UserDTO = await UserServiceFacade.getInstance().create(email, passwordHash)
      printUserResult('User created', userDto)
    })
}
