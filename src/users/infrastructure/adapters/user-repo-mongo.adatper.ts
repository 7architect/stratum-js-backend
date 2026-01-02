import { UserRepoPort } from '@application/ports/user-repository.port'
import { Mongoose, Model, Schema, Document } from 'mongoose'
import { User } from '@domain/entities/user.entity'
import { Email } from '@domain/value-objects/email.value-object'
import { Allowance } from '@domain/value-objects/allowance.value-object'

interface AllowanceDocument extends Document {
  code: string
  quantity: number
  isUnlimited: boolean
  expiresAt?: Date
  quantityUsed: number
}

interface UserDocument extends Document {
  id: string
  licenseAcceptedAt?: Date
  email: string
  password: string
  deletedAt?: Date
  createdAt: Date
  allowances: AllowanceDocument[]
}

const AllowanceDoc = new Schema<AllowanceDocument>({
  code: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  isUnlimited: { type: Boolean, default: false },
  expiresAt: { type: Date },
  quantityUsed: { type: Number, default: 0 },
})

const UserSchema = new Schema<UserDocument>({
  id: { type: String, required: true, unique: true },
  licenseAcceptedAt: { type: Date },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  deletedAt: { type: Date },
  createdAt: { type: Date, required: true },
  allowances: { type: [AllowanceDoc], default: [] },
})

export class UserRepoMongoAdapter extends UserRepoPort {
  private UserModel: Model<UserDocument>

  constructor(mongoClient: Mongoose) {
    super(mongoClient)
    this.UserModel = mongoClient.model<UserDocument>('User', UserSchema)
  }

  async save(user: User): Promise<User> {
    const result = await this.UserModel.findOneAndUpdate(
      { id: user.id },
      {
        id: user.id,
        email: user.email.value,
        password: user.password,
        licenseAcceptedAt: user.licenseAcceptedAt,
        deletedAt: user.deletedAt,
        createdAt: user.createdAt,
        allowances: user.allowances.map(allowance => ({
          code: allowance.allowanceCode,
          quantity: allowance.totalQuantity,
          isUnlimited: allowance.isUnlimited,
          expiresAt: allowance.allowanceExpiresAt,
          quantityUsed: allowance.totalQuantity - allowance.remainingQuantity
        }))
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    )

    if (!result) {
      throw new Error('Failed to save user')
    }

    return user
  }

  private mapDocumentToUser(doc: UserDocument): User {
    const allowances = doc.allowances.map((allowanceDoc: any) =>
      new Allowance(
        allowanceDoc.code,
        allowanceDoc.expiresAt,
        allowanceDoc.quantity,
        allowanceDoc.quantityUsed,
        allowanceDoc.isUnlimited
      )
    )

    return User.fromPersistence({
      id: doc.id,
      email: new Email(doc.email),
      password: doc.password,
      allowances,
      createdAt: doc.createdAt,
      deletedAt: doc.deletedAt ?? null,
      licenseAcceptedAt: doc.licenseAcceptedAt ?? null
    })
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.UserModel.findOne({ id }).exec()
    return doc ? this.mapDocumentToUser(doc) : null
  }

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await this.UserModel.findOne({ email: email.value }).exec()
    return doc ? this.mapDocumentToUser(doc) : null
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const updateData: any = {}

    if (userData.email) updateData.email = userData.email.value
    if (userData.password) updateData.password = userData.password
    if (userData.licenseAcceptedAt !== undefined) updateData.licenseAcceptedAt = userData.licenseAcceptedAt
    if (userData.deletedAt !== undefined) updateData.deletedAt = userData.deletedAt
    if (userData.allowances) {
      updateData.allowances = userData.allowances.map(allowance => ({
        code: allowance.allowanceCode,
        quantity: allowance.totalQuantity,
        isUnlimited: allowance.isUnlimited,
        expiresAt: allowance.allowanceExpiresAt,
        quantityUsed: allowance.totalQuantity - allowance.remainingQuantity
      }))
    }

    const doc = await this.UserModel.findOneAndUpdate(
      { id },
      updateData,
      { new: true, runValidators: true }
    ).exec()

    if (!doc) {
      throw new Error(`User with id ${id} not found`)
    }

    return this.mapDocumentToUser(doc)
  }

  async delete(id: string): Promise<User> {
    const user = await this.UserModel.findById(id)
    if (!user) {
      throw new Error(`User with id ${id} not found`)
    }

    const originalEntity = this.mapDocumentToUser(user)

    user.deletedAt = new Date()
    await user.save()

    return originalEntity
  }

  async findAll(page: number, perPage: number): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * perPage

    const [docs, total] = await Promise.all([
      this.UserModel.find({}).skip(skip).limit(perPage).exec(),
      this.UserModel.countDocuments({}).exec()
    ])

    const users = docs.map(doc => this.mapDocumentToUser(doc))
    return { users, total }
  }
}
