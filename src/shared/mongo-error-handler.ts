export interface MongoError extends Error {
  code?: number
  keyPattern?: Record<string, number>
  keyValue?: Record<string, any>
}

export function isMongoError(error: any): error is MongoError {
  return error && typeof error.code === 'number'
}

export function handleMongoError(error: MongoError): { status: number; message: string } | null {
  if (!isMongoError(error)) {
    return null
  }

  switch (error.code) {
    case 11000: // Duplicate key error
      if (error.keyPattern?.email) {
        return {
          status: 409,
          message: 'User with this email already exists'
        }
      }
      return {
        status: 409,
        message: 'Duplicate entry found'
      }
    
    case 121: // Document validation failure
      return {
        status: 400,
        message: 'Invalid data format'
      }
    
    default:
      return {
        status: 500,
        message: 'Database operation failed'
      }
  }
}
