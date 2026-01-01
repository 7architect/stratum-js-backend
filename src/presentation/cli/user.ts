#!/usr/bin/env bun
import { Command } from 'commander'
import { initializeDatabase } from '@infra/adapters/mongo'
import { runCli } from './utils/runner'
import { createUserCommand } from './commands/user-create.command'
import { findUserCommand } from './commands/user-find.command'
import { deleteUserCommand } from './commands/user-delete.command'
import { listUsersCommand } from './commands/user-list.command'

runCli(
  {
    name: 'user-cli',
    description: 'CLI for working with users',
    version: '1.0.0',
    setup: async () => {
      await initializeDatabase()
    },
  },
  (program: Command) => {
    program.addCommand(createUserCommand())
    program.addCommand(findUserCommand())
    program.addCommand(deleteUserCommand())
    program.addCommand(listUsersCommand())
    return program
  }
)
