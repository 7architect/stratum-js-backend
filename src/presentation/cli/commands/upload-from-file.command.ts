import { Command } from 'commander'
import { UploadServiceFacade } from '@/infrastructure/facade/upload-service.facade'
import { printUploadResult } from '../renderers/upload-renderer'
import * as fs from 'fs'
import * as path from 'path'

type UploadFromFileOptions = {
  file: string
  mimeType?: string
}

export function uploadFromFileCommand(): Command {
  return new Command('upload-file')
    .description('Upload file from local filesystem')
    .requiredOption('--file <path>', 'Path to local file')
    .option('--mime-type <mimeType>', 'MIME type (auto-detected if not provided)')
    .action(async (options: UploadFromFileOptions) => {
      try {
        const filePath = path.resolve(options.file)

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`)
          process.exit(1)
        }

        // Read file as buffer
        const buffer = fs.readFileSync(filePath)
        const fileName = path.basename(filePath)

        // Determine MIME type
        let mimeType = options.mimeType
        if (!mimeType) {
          mimeType = inferMimeType(fileName)
        }

        // Create File object from buffer
        const file = new File([buffer], fileName, { type: mimeType })

        console.log(`Uploading file: ${fileName} (${buffer.length} bytes, ${mimeType})`)

        const uploadedFile = await UploadServiceFacade.getInstance().uploadFile(file)
        printUploadResult('File uploaded from local filesystem', uploadedFile)
      } catch (error) {
        console.error('Failed to upload file:', error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

/**
 * Infer MIME type from file extension
 */
function inferMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()

  const mimeTypes: Record<string, string> = {
    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',

    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',

    // Video
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',

    // Documents
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ts': 'application/typescript',

    // Archives
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
  }

  return mimeTypes[ext] || 'application/octet-stream'
}
