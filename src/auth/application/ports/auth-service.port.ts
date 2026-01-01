import { type TokenSignerPort } from "@application/ports/token-signer.port"
import { AccessToken } from "@domain/value-objects/access-token.value-object"
import { RefreshToken } from "@domain/value-objects/refresh-token.value-object"
import { type PasswordManagerPort } from "@application/ports/password-manager.port"

export abstract class AuthServicePort {
   constructor(
     protected signer: TokenSignerPort,
     protected passwordManager: PasswordManagerPort
   ) {}

   abstract issueTokens(sub: string): {
    accessToken: AccessToken
    refreshToken: RefreshToken
   }

   abstract refreshTokens(refreshToken: RefreshToken, sub: string): {
    accessToken: AccessToken
    refreshToken: RefreshToken
   }

   abstract generatePasswordHash(password: string): Promise<string>
   abstract comparePassword(password: string, hash: string): Promise<boolean>
}
