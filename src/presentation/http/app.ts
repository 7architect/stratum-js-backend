import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { mongoConnection } from '@infrastructure/adapters/mongo'
import { authRoutes } from './routes/auth.routes'
import { settings } from '@config/settings'

/**
 * Create and configure Fastify application
 * This is the main HTTP presentation layer setup
 */
export async function createApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  }).withTypeProvider<ZodTypeProvider>()

  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  // Initialize database connection
  await mongoConnection.connect(settings.mongoUri, settings.mongoDatabase)

  // Register Swagger for API documentation
  await fastify.register(import('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Soundr API',
        description: 'API documentation for Soundr backend',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${settings.host}:${settings.port}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT token in format: Bearer <token>',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  // Register Swagger UI
  await fastify.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) =>
      header
        .replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
        .replace("style-src 'self' https:", "style-src 'self' 'unsafe-inline' https:")
        .replace('upgrade-insecure-requests;', ''),
  })

  // TODO: Install and configure CORS
  // await fastify.register(import('@fastify/cors'), {
  //   origin: true,
  //   credentials: true,
  // })

  // Health check endpoint
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
    }
  })

  // Root endpoint
  fastify.get('/', async () => {
    return {
      name: 'Soundr API',
      version: '1.0.0',
      status: 'running',
      docs: '/docs',
    }
  })

  // Register API routes
  await fastify.register(authRoutes, { prefix: '/api' })
  // TODO: Add more routes here:
  // await fastify.register(userRoutes, { prefix: '/api' })
  // await fastify.register(uploadRoutes, { prefix: '/api' })

  // Release database connection when server shuts down
  fastify.addHook('onClose', async () => {
    await mongoConnection.disconnect()
  })

  // Global error handler
  type FastifyValidationError = FastifyError & { validation?: unknown }

  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ error, url: request.url, method: request.method }, 'Request error')

    // Validation errors
    if ('validation' in error && (error as FastifyValidationError).validation) {
      const validationError = error as FastifyValidationError
      return reply.status(400).send({
        error: 'Validation Error',
        message: validationError.message,
        details: validationError.validation,
      })
    }

    // Default error response
    const statusCode = error.statusCode || 500
    return reply.status(statusCode).send({
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    })
  })

  return fastify
}
