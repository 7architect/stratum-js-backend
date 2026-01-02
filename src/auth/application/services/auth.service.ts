import { type TokenSignerPort } from '@application/ports/token-signer.port'
import { AuthServicePort } from '@application/ports/auth-service.port'
import { AccessToken } from '@domain/value-objects/access-token.value-object'
import { RefreshToken } from '@domain/value-objects/refresh-token.value-object'
import { type PasswordManagerPort } from '@application/ports/password-manager.port'

export class AuthService extends AuthServicePort {
  constructor(
    signer: TokenSignerPort,
    passwordManager: PasswordManagerPort
  ) {
    super(signer, passwordManager)
  }

  verifyToken(token: string) {
    return this.signer.verify(token)
  }

  decodeToken<T extends { sub: string, [key:string]: any }>(token: string): T {
    return this.signer.decode(token)
  }

  issueTokens(sub: string, payloadExtra: Record<string, any>) {
    const access = this.signer.sign(
      { sub, type: 'access', ...payloadExtra },
      15 * 60
    )

    const refresh = this.signer.sign(
      { sub, type: 'refresh' },
      30 * 24 * 60 * 60
    )

    return {
      accessToken: new AccessToken(access.token, access.expiresAt),
      refreshToken: new RefreshToken(refresh.token, refresh.expiresAt),
    }
  }

  refreshTokens(refreshToken: RefreshToken, sub: string, payloadExtra: Record<string, any>) {
    if (refreshToken.isExpired) {
      throw new Error('Refresh token has expired')
    }

    return this.issueTokens(sub, payloadExtra)
  }

  override generatePasswordHash(password: string): Promise<string> {
    return this.passwordManager.hashPassword(password)
  }

  override comparePassword(password: string, hash: string): Promise<boolean> {
    return this.passwordManager.comparePassword(password, hash)
  }
}
