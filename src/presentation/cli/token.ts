#!/usr/bin/env bun
import { Command } from 'commander'
import { runCli } from './utils/runner'
import { issueTokenCommand } from './commands/token-issue.command'
import { refreshTokenCommand } from './commands/token-refresh.command'

runCli(
  {
    name: 'token-cli',
    description: 'CLI for working with auth tokens',
    version: '1.0.0',
  },
  (program: Command) => {
    program.addCommand(issueTokenCommand())
    program.addCommand(refreshTokenCommand())
    return program
  }
)
