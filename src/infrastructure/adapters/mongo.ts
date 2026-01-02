import mongoose from 'mongoose'

export class MongoConnection {
  private static instance: MongoConnection
  private db: mongoose.Mongoose | null = null

  private constructor() {}

  static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection()
    }
    return MongoConnection.instance
  }

  async connect(uri: string, dbName: string): Promise<void> {
    try {
      this.db = await mongoose.connect(uri)
      console.log(`Connected to MongoDB database: ${dbName}`)
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      await this.db.disconnect()
      this.db = null
      console.log('Disconnected from MongoDB')
    }
  }

  getDb(): mongoose.Mongoose {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.db
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.db || !this.db.connection.db) return false
      await this.db.connection.db.admin().ping()
      return true
    } catch {
      return false
    }
  }
}

export const mongoConnection = MongoConnection.getInstance()

export async function initializeDatabase(): Promise<mongoose.Mongoose> {
  const { settings } = await import('../../config/settings')

  await mongoConnection.connect(settings.mongoUri, settings.mongoDatabase)
  return mongoConnection.getDb()
}

export function getDatabase(): mongoose.Mongoose {
  return mongoConnection.getDb()
}
