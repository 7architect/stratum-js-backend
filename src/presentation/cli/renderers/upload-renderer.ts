import { UploadFileEntity } from '@upload/domain/entities/upload-file.entity'
import { createTable, printMessageTable } from '../utils/table'
import { formatDate } from '../utils/format'

const UPLOAD_TABLE_HEADERS = ['ID', 'URI', 'Size (bytes)', 'MIME Type', 'Storage Key', 'Created', 'Uploaded', 'Deleted'] as const
const UPLOAD_TABLE_COL_WIDTHS = [38, 50, 15, 20, 40, 18, 18, 18] as const

export function printUploadsTable(files: UploadFileEntity[]): void {
  if (!files.length) {
    printMessageTable('No uploads found')
    return
  }

  const table = createTable(UPLOAD_TABLE_HEADERS, UPLOAD_TABLE_COL_WIDTHS)

  files.forEach(file => {
    table.push([
      file.id,
      file.uri,
      file.size.toString(),
      file.mimeType,
      file.storageKey,
      formatDate(file.createdAt),
      formatDate(file.uploadedAt),
      formatDate(file.deletedAt),
    ])
  })

  console.log(table.toString())
}

export function printUploadResult(title: string, file: UploadFileEntity | null): void {
  printMessageTable(title)
  if (file) {
    printUploadsTable([file])
  } else {
    printMessageTable('Upload not found')
  }
}
