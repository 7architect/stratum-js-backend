import { UploadIntentEntity } from '@upload/domain/entities/upload-intent.entity'
import { createTable, printMessageTable } from '../utils/table'
import { formatDate } from '../utils/format'
import Table from 'cli-table3'

const INTENT_TABLE_HEADERS = ['ID', 'Key', 'Expires At', 'Size Limit', 'MIME Type', 'Used At', 'Status'] as const
const INTENT_TABLE_COL_WIDTHS = [38, 50, 18, 15, 20, 18, 10]

function getIntentStatus(intent: UploadIntentEntity): string {
  if (intent.isUsed) return 'Used'
  if (intent.isExpired) return 'Expired'
  if (intent.isPresignedUrlExpired) return 'URL Expired'
  return 'Active'
}

export function printIntentsTable(intents: UploadIntentEntity[]): void {
  if (!intents.length) {
    printMessageTable('No intents found')
    return
  }

  intents.forEach(intent => {
    const table = createTable(INTENT_TABLE_HEADERS, INTENT_TABLE_COL_WIDTHS)

    table.push([
      intent.id,
      intent.key,
      formatDate(intent.expiresAt),
      intent.sizeLimit ? intent.sizeLimit.toString() : 'N/A',
      intent.mimeType ?? 'N/A',
      formatDate(intent.usedAt),
      getIntentStatus(intent),
    ])

    console.log(table.toString())

    // Print presigned URL in a separate full-width row
    const totalWidth = INTENT_TABLE_COL_WIDTHS.reduce((sum, width) => sum + width, 0) + INTENT_TABLE_COL_WIDTHS.length - 1
    const urlTable = new Table({
      colWidths: [15, totalWidth - 15],
      wordWrap: true,
    })

    urlTable.push(
      ['Presigned URL', intent.presignedUrl],
      ['URL Expires', formatDate(intent.presignedUrlExpiresAt)]
    )

    if (intent.uploadedFileId) {
      urlTable.push(
        ['File ID', intent.uploadedFileId],
        ['File URI', intent.uploadedFileUri ?? 'N/A']
      )
    }

    console.log(urlTable.toString())
    console.log('') // Empty line between intents
  })
}

export function printIntentResult(title: string, intent: UploadIntentEntity | null): void {
  printMessageTable(title)
  if (intent) {
    printIntentsTable([intent])
  } else {
    printMessageTable('Intent not found')
  }
}
