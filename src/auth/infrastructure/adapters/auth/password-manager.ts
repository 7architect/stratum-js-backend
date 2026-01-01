import { type PasswordManagerPort } from '@application/ports/password-manager.port'
import argon2 from 'argon2'

export class PasswordManagerAdapter implements PasswordManagerPort {
  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password)
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password)
  }
}
