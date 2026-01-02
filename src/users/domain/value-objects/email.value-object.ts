export class Email {
  private readonly emailValue: string

  constructor(email: string) {
    if (!Email.isValid(email)) {
      throw new Error(`Invalid email: ${email}`);
    }
    this.emailValue = email.toLowerCase()
  }

  get value () {
    return this.emailValue
  }

  equals(other: Email) {
    return this.emailValue === other.emailValue
  }

  private static isValid(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}