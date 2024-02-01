/* eslint-disable indent */
/* eslint-disable prettier/prettier */
import { has, some } from 'lodash'
import { AxiosInstance, AxiosError } from 'axios'
import { Logger } from 'tslog'
import { ILogObj } from 'tslog/dist/types/interfaces'
import { getDebugLogger } from '../logging/DebugLogger'

const axiosRetry = require('axios-retry')
const util = require('util')

const log: Logger<ILogObj> = getDebugLogger()

// safe method (get) + put + delete
export const IDEMPOTENT_HTTP_METHODS: ('get' | 'put' | 'delete' | 'post' | 'patch')[] = ['get', 'put', 'delete']

const shouldIRetry = (
  error: AxiosError,
  retryOnlyHttpMethods: ('get' | 'put' | 'delete' | 'post' | 'patch')[]
): boolean => {
  const isNetworkError: boolean = axiosRetry.isNetworkError(error)
  // (0) we do retry -> network error occurred
  if (isNetworkError) {
    const info0msg = `AXIOS RETRYING http request ${error.config.method} ${error.config.url}. Retrying on network error ${error.code}.`
    // note: retring cancelled request is not gonna happen, prevented here
    log.debug(info0msg)
    return true
  }

  const isOneOfAllowedMethods: boolean = some(
    retryOnlyHttpMethods.map((meth: 'get' | 'post' | 'put' | 'patch' | 'delete') => error.config.method === meth)
  )
  // (1) no retry -> retry on this method is not allowed
  if (!isOneOfAllowedMethods) {
    // tslint:disable-next-line: max-line-length
    const error1msg = `AXIOS RETRY http request FAILED: axios instance is configured NOT to RETRY if http method is ${
      error.config.method
    }. Allowed http methods ${util.inspect(retryOnlyHttpMethods)}.`
    log.debug(error1msg)
    return false
  }

  const isIdempotentMethod: boolean =
    IDEMPOTENT_HTTP_METHODS.indexOf(
      error.config.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'
    ) !== -1
  const isTimeout: boolean = error.code === 'ECONNABORTED'
  const isNon20x: boolean =
    has(error, 'response') && !!error.response ? /20*/.test(`${error.response.status}`) === false : false
  const is50x: boolean =
    has(error, 'response') && !!error.response ? /50*/.test(`${error.response.status}`) === true : false

  // (2) we do retry -> method is safe and request failed becuase of (1) timeout or (2) non-20x status code
  if (isIdempotentMethod && (isTimeout || isNon20x)) {
    const info1msg = `AXIOS RETRYING http request ${error.config.method} ${error.config.url}. Retrying on: ${
      isTimeout ? 'axios timeout (code=ECONNABORTED)' : `${error.response.status} ${error.response.statusText}`
    }`
    log.debug(info1msg)
    return true
  }

  // (3) we do retry -> method is not idempotent but axios instance is configured to retry anyways (post or patch)
  if (!isIdempotentMethod && (isTimeout || is50x)) {
    const info1msg = `AXIOS RETRYING http request ${error.config.method} ${error.config.url}. Retrying on ${
      isTimeout ? 'axios timeout (code=ECONNABORTED)' : `${error.response.status} ${error.response.statusText}`
    }`
    log.debug(info1msg)
    return true
  }

  // tslint:disable-next-line: max-line-length
  const error2msg = `AXIOS RETRY http request FAILED: axios instance is configured NOT to RETRY in this case. AxiosError: ${
    // eslint-disable-next-line no-nested-ternary
    has(error, 'response')
      ? `${error.response.status} ${error.response.statusText}`
      : has(error, 'code')
      ? error.code
      : ' / '
  }`
  log.debug(error2msg)
  return false
}

export function pluginAxiosRetry(
  instance: AxiosInstance,
  opts: {
    maximum: number
    retryOnlyHttpMethods: ('get' | 'post' | 'put' | 'patch' | 'delete')[]
  }
): void {
  axiosRetry(instance, {
    retries: opts.maximum,
    retryCondition: (error) => shouldIRetry(error, opts.retryOnlyHttpMethods),
    shouldResetTimeout: true,
    retryDelay: axiosRetry.exponentialDelay,
  })
}
