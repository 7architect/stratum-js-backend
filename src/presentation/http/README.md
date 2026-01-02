# HTTP Presentation Layer

Fastify-based HTTP API server with Clean Architecture.

## Structure

```
http/
├── app.ts                          # Fastify app configuration
├── server.ts                       # Server entry point
├── hooks/                          # Fastify hooks
│   └── authentication.hook.ts      # JWT authentication + AuthorizationContext
├── routes/                         # Route definitions
│   └── auth.routes.ts              # Authentication routes
├── controllers/                    # Request handlers (TODO)
└── middleware/                     # Custom middleware (TODO)
```

## Running the Server

```bash
# Development
bun run src/presentation/http/server.ts

# With hot reload
bun --hot src/presentation/http/server.ts
```

## Authentication

The `authenticationHook` verifies JWT tokens and creates an `AuthorizationContext` for each request:

```typescript
import { authenticationHook } from '../hooks/authentication.hook'

// Protected route
fastify.get('/protected', {
  onRequest: [authenticationHook]
}, async (request, reply) => {
  // Access user and check permissions
  const user = request.authContext.user
  
  const allowance = { code: 'upload:file', isUnlimited: false, quantityRemaining: 5 }
  if (!request.authContext.can(allowance)) {
    return reply.code(403).send({ error: 'Insufficient permissions' })
  }
  
  return { user }
})
```

## API Documentation

Once the server is running:

- **API Root**: http://localhost:3000/api
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## Available Endpoints

### Public Endpoints (No Auth)

- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/refresh` - Refresh access token

### Protected Endpoints (Requires Auth)

- `GET /api/auth/me` - Get current user

## Adding New Routes

1. Create route file in `routes/`:

```typescript
// routes/user.routes.ts
import { type FastifyInstance } from 'fastify'
import { authenticationHook } from '../hooks/authentication.hook'

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users/:id', {
    onRequest: [authenticationHook],
    schema: {
      description: 'Get user by ID',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
    }
  }, async (request, reply) => {
    // Your handler
  })
}
```

2. Register in `app.ts`:

```typescript
import { userRoutes } from './routes/user.routes'

await fastify.register(userRoutes, { prefix: '/api' })
```

## TypeScript Types

The authentication hook extends Fastify request types:

```typescript
declare module 'fastify' {
  interface FastifyRequest {
    authContext: AuthorizationContext
  }
}
```

This provides full type safety when accessing `request.authContext`.
