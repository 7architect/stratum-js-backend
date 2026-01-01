import { type FastifyInstance } from 'fastify'
import { signUpHandler } from '@presentation/controllers/sign-up.controller'
import { refreshTokenHandler } from '@presentation/controllers/refresh-token.controller'

export async function authRoutes(fastify: FastifyInstance) {
  // Sign-up endpoint
  fastify.post('/auth/sign-up', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password (minimum 6 characters)'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                roles: {
                  type: 'array',
                  items: { type: 'string' }
                },
                createdAt: { type: 'string', format: 'date-time' },
                licenseAcceptedAt: { 
                  type: ['string', 'null'], 
                  format: 'date-time' 
                },
                isDeleted: { type: 'boolean' }
              }
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        409: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, signUpHandler)

  // Sign-in endpoint
  fastify.post('/auth/sign-in', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            description: 'User password'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                roles: {
                  type: 'array',
                  items: { type: 'string' }
                },
                createdAt: { type: 'string', format: 'date-time' },
                licenseAcceptedAt: { 
                  type: ['string', 'null'], 
                  format: 'date-time' 
                },
                isDeleted: { type: 'boolean' }
              }
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    // TODO: Implement sign-in handler
    return reply.status(500).send({ error: 'Not Implemented', message: 'Sign-in endpoint not implemented yet' })
  })

  // Refresh token endpoint
  fastify.post('/auth/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            description: 'Valid refresh token'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                roles: {
                  type: 'array',
                  items: { type: 'string' }
                },
                createdAt: { type: 'string', format: 'date-time' },
                licenseAcceptedAt: { 
                  type: ['string', 'null'], 
                  format: 'date-time' 
                },
                isDeleted: { type: 'boolean' }
              }
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, refreshTokenHandler)
}
