import { type FastifyRequest, type FastifyReply } from 'fastify'
import { AuthServiceFacade } from '@infrastructure/facade/auth-service.facade'
import { AuthorizationContextFactory } from '@infrastructure/factory/auth/authorization-context.factory'
import type { AuthorizationContext } from '@application/services/authorization-context'

// Extend Fastify types to include authContext
declare module 'fastify' {
  interface FastifyRequest {
    authContext: AuthorizationContext
  }
}

/**
 * Authentication hook that verifies JWT token and creates AuthorizationContext
 *
 * Usage:
 * ```typescript
 * // In routes that require authentication:
 * fastify.get('/protected', { onRequest: [authenticationHook] }, async (request, reply) => {
 *   const user = request.authContext.user
 *   return { user }
 * })
 * ```
 */
export async function authenticationHook(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header'
    })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const authService = AuthServiceFacade.getInstance()
    const decoded = authService.verifyToken(token)

    // Create AuthorizationContext using factory
    const authContext = await AuthorizationContextFactory.createFromUserId(decoded.sub)

    if (!authContext) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not found'
      })
    }

    // Attach AuthorizationContext to request
    request.authContext = authContext

  } catch (error) {
    request.log.error({ error }, 'Authentication failed')
    return reply.code(401).send({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Invalid token'
    })
  }
}
