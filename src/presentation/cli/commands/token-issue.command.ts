import { Command } from 'commander'
import { AuthServiceFacade } from '@/infrastructure/facade/auth-service.facade'
import { printTokens } from '../renderers/token-renderer'

type IssueOptions = {
  sub: string
}

export function issueTokenCommand(): Command {
  return new Command('issue')
    .description('Issue access and refresh tokens for subject')
    .requiredOption('--sub <subject>', 'Subject identifier (e.g. user id)')
    .action((options: IssueOptions) => {
      const { sub } = options
      const tokens = AuthServiceFacade.getInstance().issueTokens(sub)
      printTokens(`Tokens issued for subject ${sub}`, tokens)
    })
}
