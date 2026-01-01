export class AccessToken {
  constructor(
    readonly value: string,
    readonly expiresAt: Date
  ) {}

  get isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  get timeUntilExpiry(): number {
    return this.expiresAt.getTime() - Date.now()
  }

  equals(other: AccessToken): boolean {
    return this.value === other.value && this.expiresAt.getTime() === other.expiresAt.getTime()
  }
}
