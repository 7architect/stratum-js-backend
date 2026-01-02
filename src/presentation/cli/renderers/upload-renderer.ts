import { UploadDto } from '@upload/presentation/upload.dto'
import { UploadFileEntity } from '@upload/domain/entities/upload-file.entity'
import { printMessageTable, createAdaptiveTable } from '../utils/table'
import { formatDate } from '../utils/format'
import { makeClickable } from '../utils/terminal'

const UPLOAD_TABLE_HEADERS = ['ID', 'Size (bytes)', 'MIME Type', 'Storage Key', 'Created', 'Deleted'] as const

type UploadRecord = UploadDto | UploadFileEntity

export function printUploadsTable(files: UploadRecord[]): void {
  if (!files.length) {
    printMessageTable('No uploads found')
    return
  }

  const table = createAdaptiveTable(UPLOAD_TABLE_HEADERS)

  files.forEach(file => {
    table.push([
      file.id,
      file.size.toString(),
      file.mimeType,
      makeClickable(file.storageKey),
      formatDate(file.createdAt),
      formatDate(file.deletedAt),
    ])
  })

  console.log(table.toString())
}

export function printUploadResult(title: string, file: UploadRecord | null): void {
  printMessageTable(title)
  if (file) {
    printUploadsTable([file])
  } else {
    printMessageTable('Upload not found')
  }
}
