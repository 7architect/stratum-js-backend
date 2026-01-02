import { type TokenSignerPort } from '@application/ports/token-signer.port'
import { AuthService } from '@application/services/auth.service'
import { JwtTokenSigner } from '@infrastructure/adapters/auth/jwt-token-signer'
import { PasswordManagerAdapter } from '@infrastructure/adapters/auth/password-manager'

export class AuthServiceFactory {
  static create(args: { secret: string }) {
    const signer = new JwtTokenSigner(args.secret)
    const passwordManager = new PasswordManagerAdapter()
    return new AuthService(signer, passwordManager)
  }

  static withSigner(signer: TokenSignerPort) {
    return new AuthService(signer, new PasswordManagerAdapter())
  }
}
