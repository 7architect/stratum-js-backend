export type ServiceAllowance = string

export class Allowance<Code extends ServiceAllowance = string> {
  constructor(
    private code: Code,
    private expiresAt: Date | null,
    private quantity: number = 0, // total
    private quantityUsed: number = 0,
    private unlimited: boolean = false
  ) {}

  get isUnlimited(): boolean {
    return this.unlimited
  }

  get isExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt < new Date()
  }

  get allowanceExpiresAt(): Date | null {
    return this.expiresAt
  }

  get allowanceCode(): Code {
    return this.code
  }

  get totalQuantity(): number {
    return this.quantity
  }

  get remainingQuantity(): number {
    return this.quantity - this.quantityUsed
  }

  consume(quantity: number) {
    if (this.isUnlimited) {
      throw new Error('Cannot consume from unlimited allowance')
    }

    if (quantity <= 0) {
      throw new Error('quantity must be greater than 0')
    }

    if (quantity > this.remainingQuantity) {
      throw new Error('Not enough allowance remaining')
    }

    this.quantityUsed += quantity
  }

  increaseQuantity(addQuantity: number) {
    if (this.isUnlimited) {
      throw new Error('Cannot increase quantity for unlimited allowance')
    }

    this.quantity += addQuantity
  }

  decreaseQuantity(subtractQuantity: number) {
    if (this.isUnlimited) {
      return
    }

    if (subtractQuantity <= 0) {
      throw new Error('subtractQuantity must be greater than 0')
    }

    if (subtractQuantity > this.quantity) {
      throw new Error('Cannot decrease quantity below zero')
    }

    this.quantity -= subtractQuantity
  }

  updateQuantity(newQuantity: number) {
    if (this.isUnlimited) {
      throw new Error('Cannot update quantity for unlimited allowance')
    }

    if (newQuantity < 0) {
      throw new Error('newQuantity cannot be negative')
    }

    this.quantity = newQuantity
  }
}