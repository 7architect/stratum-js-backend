import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Find .env file relative to this file's location (go up 2 levels: config -> src -> root)
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '..', '.env')

config({ path: envPath })

export class Settings {
  private static instance: Settings

  private constructor() {
    this.validateRequiredEnvVars()
  }

  static getInstance(): Settings {
    if (!Settings.instance) {
      Settings.instance = new Settings()
    }
    return Settings.instance
  }

  get mongoUri(): string {
    return process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/soundr?authSource=admin'
  }

  get mongoDatabase(): string {
    return process.env.MONGODB_DATABASE || 'soundr'
  }

  get port(): number {
    return parseInt(process.env.PORT || '3000', 10)
  }

  get host(): string {
    return process.env.HOST || 'localhost'
  }

  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development'
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development'
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production'
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test'
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
  }

  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7d'
  }

  get logLevel(): string {
    return process.env.LOG_LEVEL || 'info'
  }

  get corsOrigin(): string[] {
    const origins = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001'
    return origins.split(',').map(origin => origin.trim())
  }

  get s3Region(): string {
    return process.env.S3_REGION || 'us-east-1'
  }

  get s3Bucket(): string {
    return process.env.S3_BUCKET || 'soundr-uploads'
  }

  get s3AccessKeyId(): string {
    return process.env.S3_ACCESS_KEY_ID || 'local-access-key'
  }

  get s3SecretAccessKey(): string {
    return process.env.S3_SECRET_ACCESS_KEY || 'local-secret-key'
  }

  get s3Endpoint(): string | null {
    return process.env.S3_ENDPOINT ?? null
  }

  get s3ForcePathStyle(): boolean {
    return (process.env.S3_FORCE_PATH_STYLE ?? 'false').toLowerCase() === 'true'
  }

  get s3PublicBaseUrl(): string | null {
    return process.env.S3_PUBLIC_BASE_URL ?? null
  }

  get s3BasePath(): string | null {
    return process.env.S3_BASE_PATH ?? null
  }

  private validateRequiredEnvVars(): void {
    const requiredVars = ['MONGODB_URI', 'MONGODB_DATABASE']
    const missingVars: string[] = []

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName)
      }
    }

    if (missingVars.length > 0 && this.isProduction) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }
  }

  getConnectionString(): string {
    return this.mongoUri
  }

  getDatabaseName(): string {
    return this.mongoDatabase
  }

  getServerConfig() {
    return {
      host: this.host,
      port: this.port
    }
  }

  getJwtConfig() {
    return {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn
    }
  }

  getCorsConfig() {
    return {
      origin: this.corsOrigin,
      credentials: true
    }
  }

  logConfig(): void {
    if (this.isDevelopment) {
      console.log('Application Configuration:')
      console.log(`- Environment: ${this.nodeEnv}`)
      console.log(`- Host: ${this.host}`)
      console.log(`- Port: ${this.port}`)
      console.log(`- Database: ${this.mongoDatabase}`)
      console.log(`- Log Level: ${this.logLevel}`)
      console.log(`- CORS Origins: ${this.corsOrigin.join(', ')}`)
    }
  }
}

export const settings = Settings.getInstance()
