import { JwtTokenSigner } from './jwt-token-signer'

export class AuthFactory {
  static createJwtSigner(secret: string): JwtTokenSigner {
    return new JwtTokenSigner(secret)
  }
}
