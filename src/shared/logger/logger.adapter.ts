import { logger } from "./logger";

export class LoggerAdapter {
  static log(level: string, message: string, ...meta: any[]) {
    logger.log(level, message, ...meta)
  }

  static info(message: string, ...meta: any[]) {
    logger.info(message, ...meta)
  }

  static warn(message: string, ...meta: any[]) {
    logger.warn(message, ...meta)
  }

  static error(message: string, ...meta: any[]) {
    logger.error(message, ...meta)
  }
}
