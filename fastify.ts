import Fastify, { type FastifyInstance } from 'fastify'
import { initializeDatabase } from './src/infra/adapters/mongo'
import { createRepositoryFactory } from './src/infra/repository-factory'
import { authRoutes } from './src/presentation/routes/auth.routes'
import { adminRoutes } from './src/presentation/routes/admin.routes'
import { settings } from './src/config/settings'

async function start() {
  const fastify = Fastify({
    logger: true
  })

  try {
    const db = await initializeDatabase()
    createRepositoryFactory(db)

    await fastify.register(import('@fastify/swagger'), {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'Soundr API',
          description: 'API documentation for Soundr backend',
          version: '1.0.0'
        },
        servers: [
          {
            url: `http://${settings.host}:${settings.port}`,
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        }
      }
    })

    await fastify.register(import('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      }
    })

    await fastify.register(authRoutes)
    await fastify.register(adminRoutes)

    fastify.get('/', async function handler (request, reply) {
      return { hello: 'world', status: 'running' }
    })

    await fastify.listen({
      port: settings.port,
      host: settings.host
    })

    console.log(`Server running on http://${settings.host}:${settings.port}`)
    console.log(`Swagger docs available at http://${settings.host}:${settings.port}/docs`)

  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

export default async function() {
  await start()
}
