import { Command } from 'commander'
import { printErrorTable } from './table'

export type CliConfig = {
  name: string
  description: string
  version: string
  setup?: () => Promise<void>
}

export async function runCli(config: CliConfig, programBuilder: (program: Command) => Command): Promise<void> {
  try {
    if (config.setup) {
      await config.setup()
    }

    const program = new Command()
    program
      .name(config.name)
      .description(config.description)
      .version(config.version)

    const configuredProgram = programBuilder(program)
    await configuredProgram.parseAsync(process.argv)

    process.exit(0)
  } catch (error) {
    printErrorTable(`${config.name} error`, error)
    process.exit(1)
  }
}
