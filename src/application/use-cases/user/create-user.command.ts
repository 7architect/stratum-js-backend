import { AuthServiceFacade } from '@/infrastructure/facade/auth-service.facade'
import { UserServiceFacade } from '@/infrastructure/facade/user-service.facade'
import { type UserDTO } from '@/users/presentation/dto/user.dto'

export async function createUserCommand(email: string, password: string): Promise<null | { user: Omit<UserDTO, 'password'>, tokens: { accessToken: string, refreshToken: string } }> {
  const authService = AuthServiceFacade.getInstance()
  const userService = UserServiceFacade.getInstance()

  const hashed = await authService.generatePasswordHash(password)

  const user = await userService.create(email, hashed)

  if (!user) {
    return null
  }

  const tokens = authService.issueTokens(user.id, {
    allowances: user.allowances,
    email: user.email,
    licenseAcceptedAt: user.licenseAcceptedAt,
  })

  // Exclude password from response
  const { password: _, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword,
    tokens: {
      accessToken: tokens.accessToken.value,
      refreshToken: tokens.refreshToken.value,
    },
  }
}
