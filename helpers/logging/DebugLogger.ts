/* eslint-disable indent */
import { Logger } from 'tslog'
import { ILogObj } from 'tslog/dist/types/interfaces'

// Possible values of MIN_LOG_LEVEL environment variable
export enum MinLogLevels {
  silly,
  trace,
  debug,
  info,
  warn,
  error,
  fatal,
}

// Gets current log level from env variable
function getLogLevel(): MinLogLevels {
  const log: Logger<ILogObj> = new Logger()
  let logLevel = MinLogLevels.silly
  if ('MIN_LOG_LEVEL' in process.env) {
    const minLevelEnv = process.env.MIN_LOG_LEVEL
    if (minLevelEnv) {
      const minLevelEnvValue = minLevelEnv.trim()
      if (minLevelEnvValue.length > 0) {
        logLevel = MinLogLevels[minLevelEnvValue]
        if (!logLevel) {
          log.warn(`Invalid value for MIN_LOG_LEVEL env variable: ${minLevelEnvValue}, defaulting to info`)
          logLevel = MinLogLevels.info
        }
      }
    }
  } else {
    logLevel = MinLogLevels.info
  }
  return logLevel
}

// export current log level
const DebugLogLevel: MinLogLevels = getLogLevel()

// Gets a logger with minimum log level set
export function getDebugLogger(): Logger<ILogObj> {
  const log = new Logger<ILogObj>()
  const logSettings = log.settings
  // have to specify exact literals to setSettings
  switch (DebugLogLevel) {
    case MinLogLevels.silly:
      logSettings.minLevel = 0
      break
    case MinLogLevels.trace:
      logSettings.minLevel = 1
      break
    case MinLogLevels.debug:
      logSettings.minLevel = 2
      break
    case MinLogLevels.info:
      logSettings.minLevel = 3
      break
    case MinLogLevels.warn:
      logSettings.minLevel = 4
      break
    case MinLogLevels.error:
      logSettings.minLevel = 5
      break
    case MinLogLevels.fatal:
      logSettings.minLevel = 6
      break
    default:
      logSettings.minLevel = 3
      break
  }
  log.settings = logSettings
  return log
}
