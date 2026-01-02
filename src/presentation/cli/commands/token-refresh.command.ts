import { Command } from 'commander'
import { AuthServiceFacade } from '@/infrastructure/facade/auth-service.facade'
import { RefreshToken } from '@auth/domain/value-objects/refresh-token.value-object'
import { ensureDate } from '../utils/format'
import { printTokens } from '../renderers/token-renderer'

type RefreshOptions = {
  sub: string
  refreshToken: string
  expiresAt: string
}

export function refreshTokenCommand(): Command {
  return new Command('refresh')
    .description('Refresh token pair using an existing refresh token')
    .requiredOption('--sub <subject>', 'Subject identifier (e.g. user id)')
    .requiredOption('--refresh-token <token>', 'Refresh token value')
    .requiredOption('--expires-at <date>', 'Refresh token expiry date in ISO 8601 format')
    .action((options: RefreshOptions) => {
      const { sub, refreshToken, expiresAt } = options

      const refreshTokenVO = new RefreshToken(refreshToken, ensureDate(expiresAt, 'expires-at'))
      const tokens = AuthServiceFacade.getInstance().refreshTokens(refreshTokenVO, sub)
      printTokens(`Tokens refreshed for subject ${sub}`, tokens)
    })
}
