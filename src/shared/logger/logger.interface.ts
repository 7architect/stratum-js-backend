export abstract class LoggerPort {
    abstract log(level: string, message: string, ...meta: any[]): void
    abstract warn(message: string, ...meta: any[]): void
    abstract error(message: string, ...meta: any[]): void
}
