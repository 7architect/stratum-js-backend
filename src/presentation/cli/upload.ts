#!/usr/bin/env bun
import { Command } from 'commander'
import { initializeDatabase } from '@/infrastructure/adapters/mongo'
import { runCli } from './utils/runner'
import { uploadFromUrlCommand } from './commands/upload-from-url.command'
import { uploadFromFileCommand } from './commands/upload-from-file.command'
import { getUploadCommand } from './commands/upload-get.command'
import { deleteUploadCommand } from './commands/upload-delete.command'
import { listUploadsCommand } from './commands/upload-list.command'
import { listUploadsFromDbCommand } from './commands/upload-list-db.command'
import { createIntentCommand } from './commands/intent-create.command'
import { getIntentCommand } from './commands/intent-get.command'
import { validateIntentCommand } from './commands/intent-validate.command'
import { confirmIntentCommand } from './commands/intent-confirm.command'

runCli(
  {
    name: 'upload-cli',
    description: 'CLI for working with file uploads and upload intents',
    version: '1.0.0',
    setup: async () => {
      await initializeDatabase()
    },
  },
  (program: Command) => {
    // Upload commands
    program.addCommand(uploadFromUrlCommand())
    program.addCommand(uploadFromFileCommand())
    program.addCommand(listUploadsCommand())
    program.addCommand(listUploadsFromDbCommand())
    program.addCommand(getUploadCommand())
    program.addCommand(deleteUploadCommand())

    // Intent commands
    const intentCommand = new Command('intent')
      .description('Manage upload intents')
      .addCommand(createIntentCommand())
      .addCommand(getIntentCommand())
      .addCommand(validateIntentCommand())
      .addCommand(confirmIntentCommand())

    program.addCommand(intentCommand)

    return program
  }
)
