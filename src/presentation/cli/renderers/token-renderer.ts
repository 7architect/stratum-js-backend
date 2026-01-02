import { AccessToken } from '@auth/domain/value-objects/access-token.value-object'
import { RefreshToken } from '@auth/domain/value-objects/refresh-token.value-object'
import { createTable, printMessageTable } from '../utils/table'
import { formatDate, formatDurationMs } from '../utils/format'

const TOKEN_TABLE_HEADERS = ['Type', 'Token', 'Expires at', 'Expired', 'TTL (minutes)'] as const
const TOKEN_TABLE_COL_WIDTHS = [10, 60, 25, 10, 15] as const

type TokenRow = {
  type: 'access' | 'refresh'
  token: AccessToken | RefreshToken
}

export function printTokens(
  title: string,
  tokens: { accessToken: AccessToken; refreshToken: RefreshToken }
): void {
  printMessageTable(title)

  const tokenRows: TokenRow[] = [
    { type: 'access', token: tokens.accessToken },
    { type: 'refresh', token: tokens.refreshToken },
  ]

  const longestTokenLength = tokenRows.reduce(
    (max, { token }) => Math.max(max, token.value.length),
    0,
  )

  const tokenColumnWidth = Math.min(
    Math.max(longestTokenLength + 2, TOKEN_TABLE_COL_WIDTHS[1]),
    200,
  )

  const table = createTable(
    TOKEN_TABLE_HEADERS,
    [
      TOKEN_TABLE_COL_WIDTHS[0],
      tokenColumnWidth,
      TOKEN_TABLE_COL_WIDTHS[2],
      TOKEN_TABLE_COL_WIDTHS[3],
      TOKEN_TABLE_COL_WIDTHS[4],
    ],
    { wrapOnWordBoundary: false }
  )

  tokenRows.forEach(({ type, token }) => {
    table.push([
      type,
      token.value,
      formatDate(token.expiresAt),
      token.isExpired ? 'yes' : 'no',
      formatDurationMs(token.timeUntilExpiry),
    ])
  })

  console.log(table.toString())
}
