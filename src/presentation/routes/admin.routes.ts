import { type FastifyInstance } from 'fastify'
import { getUsersHandler, deleteUserHandler, adminDashboardHandler } from '@presentation/controllers/admin.controller'

export async function adminRoutes(fastify: FastifyInstance) {
  // Admin dashboard UI
  fastify.get('/admin', adminDashboardHandler)
  
  // Admin API routes
  fastify.get('/admin/api/users', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
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
              }
            },
            total: { type: 'number' }
          }
        }
      }
    }
  }, getUsersHandler)

  fastify.delete('/admin/api/users/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, deleteUserHandler)
}
