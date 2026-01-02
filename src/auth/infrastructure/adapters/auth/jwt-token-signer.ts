import jwt from 'jsonwebtoken'
import { type TokenSignerPort } from '@application/ports/token-signer.port'

export class JwtTokenSigner implements TokenSignerPort {
  constructor(private secret: string) {}

  sign(payload: Record<string, string>, expiresIn: number) {
    const token = jwt.sign(payload, this.secret, { expiresIn })
    const decoded = jwt.decode(token) as any

    return {
      token,
      expiresAt: new Date(decoded.exp * 1000),
    }
  }

  verify(token: string): any {
    try {
      return jwt.verify(token, this.secret)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  decode(token: string): any {
    return jwt.decode(token)
  }
}
