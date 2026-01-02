export class PresignedUrl {
  constructor(
    public readonly url: string,
    public readonly expiresAt: Date
  ) {
    if (!url || url.trim().length === 0) {
      throw new Error('Presigned URL cannot be empty')
    }

    if (expiresAt <= new Date()) {
      throw new Error('Presigned URL expiration date must be in the future')
    }
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  getRemainingTime(): number {
    const now = new Date().getTime()
    const expires = this.expiresAt.getTime()
    return Math.max(0, expires - now)
  }

  getRemainingTimeInSeconds(): number {
    return Math.floor(this.getRemainingTime() / 1000)
  }
}
