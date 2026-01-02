import { AuthorizationContext } from '@application/services/authorization-context'
import { type UserDTO } from '@users/presentation/dto/user.dto'
import { UserServiceFacade } from '@infrastructure/facade/user-service.facade'

/**
 * Factory for creating AuthorizationContext instances (per-request)
 *
 * Usage in Fastify (Option 1 - with UserDTO):
 *
 * ```typescript
 * fastify.addHook('onRequest', async (request, reply) => {
 *   const token = request.headers.authorization?.replace('Bearer ', '')
 *   if (!token) return reply.code(401).send({ error: 'Unauthorized' })
 *
 *   const decoded = await authService.verifyAccessToken(token)
 *   const userDTO = await userService.findById(decoded.userId)
 *   if (!userDTO) return reply.code(401).send({ error: 'User not found' })
 *
 *   request.authContext = AuthorizationContextFactory.create(userDTO)
 * })
 * ```
 *
 * Usage in Fastify (Option 2 - with userId, simpler):
 *
 * ```typescript
 * fastify.addHook('onRequest', async (request, reply) => {
 *   const token = request.headers.authorization?.replace('Bearer ', '')
 *   if (!token) return reply.code(401).send({ error: 'Unauthorized' })
 *
 *   const decoded = await authService.verifyAccessToken(token)
 *   const authContext = await AuthorizationContextFactory.createFromUserId(decoded.userId)
 *   if (!authContext) return reply.code(401).send({ error: 'User not found' })
 *
 *   request.authContext = authContext
 * })
 * ```
 *
 * Usage in route handler:
 *
 * ```typescript
 * fastify.post('/upload', async (request, reply) => {
 *   const allowance = { code: 'upload:file', isUnlimited: false, quantityRemaining: 5 }
 *   if (!request.authContext.can(allowance)) {
 *     return reply.code(403).send({ error: 'Insufficient allowance' })
 *   }
 *   // ... process upload
 * })
 * ```
 */
export class AuthorizationContextFactory {
  /**
   * Create AuthorizationContext from existing UserDTO
   * Use this when you already have the user loaded
   */
  static create(userDTO: UserDTO): AuthorizationContext {
    return new AuthorizationContext(
      userDTO,
      UserServiceFacade.getInstance()
    )
  }

  /**
   * Create AuthorizationContext by loading user from userId
   * Use this in Fastify hooks for simpler code
   * Returns null if user not found
   */
  static async createFromUserId(userId: string): Promise<AuthorizationContext | null> {
    const userService = UserServiceFacade.getInstance()
    const userDTO = await userService.findById(userId)

    if (!userDTO) {
      return null
    }

    return new AuthorizationContext(userDTO, userService)
  }
}
