import { User } from '@users/domain/entities/user.entity'
import { createTable, printMessageTable } from '../utils/table'
import { formatDate } from '../utils/format'

const USER_TABLE_HEADERS = ['ID', 'Email', 'Created at', 'Deleted at', 'License accepted at'] as const
const USER_TABLE_COL_WIDTHS = [15, 25, 25, 25, 25] as const

export function printUsersTable(users: User[]): void {
  if (!users.length) {
    printMessageTable('No users found')
    return
  }

  const table = createTable(USER_TABLE_HEADERS, USER_TABLE_COL_WIDTHS)

  users.forEach(user => {
    table.push([
      user.id,
      user.email.value,
      formatDate(user.createdAt),
      formatDate(user.deletedAt),
      formatDate(user.licenseAcceptedAt),
    ])
  })

  console.log(table.toString())
}

export function printUserResult(title: string, user: User | null): void {
  printMessageTable(title)
  if (user) {
    printUsersTable([user])
  } else {
    printMessageTable('User not found')
  }
}
