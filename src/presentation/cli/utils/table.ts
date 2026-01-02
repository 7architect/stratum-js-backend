import Table from 'cli-table3'
import { getTerminalWidth } from './terminal'

export function printMessageTable(message: string): void {
  const table = new Table({
    head: ['Message'],
    colWidths: [80],
    wordWrap: true,
  })
  table.push([message])
  console.log(table.toString())
}

export function printErrorTable(title: string, error: unknown): void {
  const rows: [string, string][] = []

  if (error instanceof Error) {
    rows.push(['Message', error.message])
    if (error.stack) {
      rows.push(['Stack', error.stack])
    }
  } else {
    rows.push(['Error', JSON.stringify(error, null, 2)])
  }

  const table = new Table({
    head: [title, 'Details'],
    colWidths: [20, 60],
    wordWrap: true,
  })

  rows.forEach(([label, value]) => table.push([label, value]))
  console.log(table.toString())
}

export function createTable<T extends readonly string[]>(
  headers: T,
  colWidths: number[],
  options?: Table.TableConstructorOptions,
): Table.Table {
  return new Table({
    head: [...headers],
    colWidths,
    wordWrap: true,
    ...options,
  })
}

/**
 * Creates a table with column widths adapted to terminal width
 */
export function createAdaptiveTable<T extends readonly string[]>(
  headers: T,
  options?: Table.TableConstructorOptions,
): Table.Table {
  const terminalWidth = getTerminalWidth()
  const colCount = headers.length

  // Reserve space for table borders and padding
  // cli-table3 uses: | col1 | col2 | col3 |
  // That's: (colCount + 1) pipes + (colCount * 2) spaces for padding
  const borderOverhead = (colCount + 1) + (colCount * 2)
  const availableWidth = terminalWidth - borderOverhead

  // Calculate column widths based on header content and available space
  const colWidths = calculateColumnWidths(headers, availableWidth)

  return new Table({
    head: [...headers],
    colWidths,
    wordWrap: true,
    wrapOnWordBoundary: false, // Allow breaking anywhere for long paths
    truncate: '…',
    ...options,
  })
}

/**
 * Calculate optimal column widths based on headers and available space
 */
function calculateColumnWidths(headers: readonly string[], availableWidth: number): number[] {
  // Define minimum widths for specific column types
  const minWidths: Record<string, number> = {
    ID: 38, // UUID length
    'Size (bytes)': 12,
    Created: 18,
    Uploaded: 18,
    Deleted: 18,
    URI: 25, // Minimum for URLs
    'Storage Key': 30, // Minimum for storage paths
    'MIME Type': 20, // Minimum for mime types
  }

  // Start with minimum widths or header lengths
  const widths = headers.map((header) => {
    const minWidth = minWidths[header]
    if (minWidth) return minWidth
    return Math.max(header.length + 2, 15) // At least header + padding
  })

  const totalMinWidth = widths.reduce((sum, w) => sum + w, 0)

  // If we have extra space, distribute it proportionally
  if (totalMinWidth < availableWidth) {
    const extraSpace = availableWidth - totalMinWidth

    // Prioritize giving extra space to likely long columns
    const flexibleColumns = headers
      .map((h, i) => ({ index: i, header: h }))
      .filter(({ header }) => ['URI', 'Storage Key', 'MIME Type'].includes(header))

    if (flexibleColumns.length > 0) {
      const spacePerFlexCol = Math.floor(extraSpace / flexibleColumns.length)
      flexibleColumns.forEach(({ index }) => {
        const currentWidth = widths[index]
        if (currentWidth !== undefined) {
          widths[index] = currentWidth + spacePerFlexCol
        }
      })
    }
  }

  return widths
}
