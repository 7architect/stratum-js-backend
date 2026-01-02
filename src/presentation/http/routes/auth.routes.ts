import { type FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticationHook } from '../hooks/authentication.hook'
import { createUserCommand } from '@application/use-cases/user/create-user.command'
import { authorizeUser } from '@/application/use-cases/user/authorize-user.command'
import { refreshSession } from '@/application/use-cases/user/refresh-session.command'

const AuthAllowanceSchema = z.object({
  code: z.string(),
  unlimited: z.boolean(),
  quantityTotal: z.number(),
  quantityRemaining: z.number(),
  expiresAt: z.number().nullable(),
})

const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.number(),
  licenseAcceptedAt: z.number().nullable(),
  deletedAt: z.number().nullable(),
  allowances: z.array(AuthAllowanceSchema).optional(),
})

const AuthTokenResponseSchema = z.object({
  user: AuthUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

const SignUpBodySchema = z.object({
  email: z.string().email().describe('User email address'),
  password: z
    .string()
    .min(6)
    .describe('User password (minimum 6 characters)'),
})

const SignInBodySchema = z.object({
  email: z.string().email().describe('User email address'),
  password: z.string().describe('User password'),
})

const RefreshBodySchema = z.object({
  refreshToken: z.string().describe('Valid refresh token'),
})

const CurrentUserResponseSchema = AuthUserSchema.extend({
  allowances: z.array(AuthAllowanceSchema),
})

const NotImplementedSchema = z.object({
  error: z.literal('Not Implemented'),
  message: z.string(),
})

const BadRequestSchema = z.object({
  error: z.literal('Bad Request'),
  message: z.string(),
})

const UnauthorizedResponseSchema = z.object({
  error: z.literal('Unauthorized'),
  message: z.string(),
})

export async function authRoutes(fastify: FastifyInstance) {
  // Sign-up endpoint (public)
  fastify.post<{ Body: z.infer<typeof SignUpBodySchema> }>('/auth/sign-up', {
    schema: {
      description: 'Register a new user account',
      tags: ['Authentication'],
      body: SignUpBodySchema,
      response: {
        200: AuthTokenResponseSchema,
        400: BadRequestSchema,
      },
    },
  }, async (request, reply) => {
    if (!request.body) {
      reply.code(400).send({ error: 'Bad Request', message: 'Missing request body' })
    }
    const result = await createUserCommand(request.body.email, request.body.password)

    if (!result) {
      return reply.code(400).send({ error: 'Bad Request', message: 'User could not be created' })
    }

    return reply.code(200).send({
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken
    })
  })

  // Sign-in endpoint (public)
  fastify.post<{ Body: z.infer<typeof SignInBodySchema> }> ('/auth/sign-in', {
    schema: {
      description: 'Authenticate user and get tokens',
      tags: ['Authentication'],
      body: SignInBodySchema,
      response: {
        200: AuthTokenResponseSchema,
        400: BadRequestSchema,
        401: UnauthorizedResponseSchema,
      },
    },
  }, async (request, reply) => {
    if (!request.body) {
      reply.code(400).send({ error: 'Bad Request', message: 'Missing request body' })
    }
    const result = await authorizeUser(request.body.email, request.body.password)

    if (!result) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid credentials' })
    }

    return reply.code(200).send({
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken
    })
  })

  // Refresh token endpoint (public)
  fastify.post<{ Body: z.infer<typeof RefreshBodySchema> }>('/auth/refresh', {
    schema: {
      description: 'Refresh access token using refresh token',
      tags: ['Authentication'],
      body: RefreshBodySchema,
      response: {
        200: AuthTokenResponseSchema,
        400: BadRequestSchema,
        401: UnauthorizedResponseSchema,
      },
    },
  }, async (request, reply) => {
    if (!request.body) {
      reply.code(400).send({ error: 'Bad Request', message: 'Missing request body' })
    }

    const result = await refreshSession(request.body.refreshToken)

    if (!result) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid refresh token' })
    }

    return reply.code(200).send({
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken
    })
  })

  // Get current user (protected - requires authentication)
  fastify.get('/auth/me', {
    onRequest: [authenticationHook],
    schema: {
      description: 'Get current authenticated user',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: CurrentUserResponseSchema,
        401: UnauthorizedResponseSchema,
      },
    },
  }, async (request, reply) => {
    reply.code(200).send(request.authContext.user)
  })
}
