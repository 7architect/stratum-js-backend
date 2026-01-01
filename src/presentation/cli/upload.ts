#!/usr/bin/env bun
import { Command } from 'commander'
import { runCli } from './utils/runner'
import { uploadFromUrlCommand } from './commands/upload-from-url.command'
import { deleteUploadCommand } from './commands/upload-delete.command'
import { createIntentCommand } from './commands/intent-create.command'
import { getIntentCommand } from './commands/intent-get.command'
import { uploadWithIntentFromUrlCommand } from './commands/intent-upload-url.command'

runCli(
  {
    name: 'upload-cli',
    description: 'CLI for working with file uploads and upload intents',
    version: '1.0.0',
  },
  (program: Command) => {
    // Upload commands
    program.addCommand(uploadFromUrlCommand())
    program.addCommand(deleteUploadCommand())

    // Intent commands
    const intentCommand = new Command('intent')
      .description('Manage upload intents')
      .addCommand(createIntentCommand())
      .addCommand(getIntentCommand())
      .addCommand(uploadWithIntentFromUrlCommand())

    program.addCommand(intentCommand)

    return program
  }
)
