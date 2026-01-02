import type { UserDTO } from '@/users/presentation/dto/user.dto'
import { createTable, printMessageTable } from '../utils/table'
import { formatDate } from '../utils/format'

const USER_TABLE_HEADERS = ['ID', 'Email', 'Created at', 'Deleted at', 'License accepted at'] as const
const USER_TABLE_COL_WIDTHS = [15, 25, 25, 25, 25] as const

export function printUsersTable(users: UserDTO[]): void {
  if (!users.length) {
    printMessageTable('No users found')
    return
  }

  const table = createTable(USER_TABLE_HEADERS, USER_TABLE_COL_WIDTHS)

  users.forEach(user => {
    table.push([
      user.id,
      user.email,  // DTO contains string, not Value Object
      formatDate(user.createdAt),  // DTO contains timestamp number
      formatDate(user.deletedAt),  // DTO contains timestamp number or null
      formatDate(user.licenseAcceptedAt),  // DTO contains timestamp number or null
    ])
  })

  console.log(table.toString())
}

export function printUserResult(title: string, user: UserDTO | null): void {
  printMessageTable(title)
  if (user) {
    printUsersTable([user])
  } else {
    printMessageTable('User not found')
  }
}
