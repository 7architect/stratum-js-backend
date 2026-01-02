export interface TokenSignerPort {
  sign(payload: object, expiresIn: number): {
    token: string
    expiresAt: Date
  }
  verify(token: string): any
  decode(token: string): any
}
