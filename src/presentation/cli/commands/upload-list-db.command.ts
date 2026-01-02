import { Command } from 'commander'
import { UploadRepoFactory } from '@upload/infrastructure/factory/upload-repo.factory'
import { mongoConnection } from '@/infrastructure/adapters/mongo'
import { printUploadsTable } from '../renderers/upload-renderer'

export function listUploadsFromDbCommand(): Command {
  return new Command('list-db')
    .description('List all uploaded files from MongoDB repository')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --limit <number>', 'Items per page', '20')
    .action(async (options) => {
      try {
        const page = parseInt(options.page, 10)
        const limit = parseInt(options.limit, 10)

        const repo = UploadRepoFactory.create(mongoConnection.getDb())
        const result = await repo.findAll(page, limit)

        console.log(`\nTotal uploads in MongoDB: ${result.total}`)
        console.log(`Showing page ${page} (${result.uploads.length} items)\n`)

        printUploadsTable(result.uploads)
      } catch (error) {
        console.error('Failed to list files from DB:', error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}
