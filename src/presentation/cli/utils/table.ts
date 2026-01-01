import Table from 'cli-table3'

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
