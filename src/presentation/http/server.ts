import Table from 'cli-table3'
import { createApp } from './app'
import { settings } from '@config/settings'

function formatServerBanner(host: string, port: number): string {
  const table = new Table({
    colWidths: [12, 40],
    wordWrap: true,
    style: {
      head: [],
      border: [],
      compact: false,
    },
  })

  table.push([{ colSpan: 2, content: 'Soundr API Server', hAlign: 'center' }])
  table.push(
    ['Status', '✓ Running'],
    ['Port', port.toString()],
    ['Host', host],
    ['API', `http://${host}:${port}/api`],
    ['Docs', `http://${host}:${port}/docs`],
    ['Health', `http://${host}:${port}/health`],
  )

  return `\n${table.toString()}`
}

/**
 * Start HTTP server
 * Main entry point for the API server
 */
async function startServer() {
  try {
    const app = await createApp()

    await app.listen({
      port: settings.port,
      host: settings.host,
    })

    console.log(formatServerBanner(settings.host, settings.port))

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM']
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n${signal} received, shutting down gracefully...`)
        await app.close()
        process.exit(0)
      })
    })

  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start server if this file is run directly
if (import.meta.main) {
  startServer()
}

export { startServer }
