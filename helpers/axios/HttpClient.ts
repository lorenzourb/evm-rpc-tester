import { has } from 'lodash'
import { String } from 'typescript-string-operations'
import { Logger } from 'tslog'
import * as https from 'https'
import axios, { AxiosInstance, AxiosResponse, Method } from 'axios'
// import { stringify } from 'qs'
import { ILogObj } from 'tslog/dist/types/interfaces'
import { getDebugLogger } from '../logging/DebugLogger'
import { WAIT_TIMEOUT_30_SEC } from '../wait'
import { pluginAxiosRetry } from './axiosretry'

const util = require('util')

const log: Logger<ILogObj> = getDebugLogger()

export interface IParams {
  [key: string]: any
}

export interface IHeaders {
  [key: string]: any
}

export interface IRouteConfig {
  // Path / the route itself
  path: string
  // HTTP Request method (get, post, ...)
  method: Method
}

export interface IAxiosConfigurationParams {
  timeout: number
  retry: {
    enable: boolean
    maximum: number
    retryOnlyHttpMethods: ('post' | 'get' | 'put' | 'patch' | 'delete')[]
  }
}
const DEFAULT_AXIOS_CONFIGURATION: IAxiosConfigurationParams = {
  timeout: WAIT_TIMEOUT_30_SEC,
  retry: {
    enable: false,
    maximum: 3,
    retryOnlyHttpMethods: ['get', 'put', 'delete', 'post'],
  },
}

export const HTTPReqHeaders: {
  json: IHeaders
  pdf: IHeaders
  form: IHeaders
  multipart: IHeaders
} = {
  json: { 'Content-Type': 'application/json' },
  pdf: { 'Content-Type': 'application/pdf' },
  form: { 'Content-Type': 'application/x-www-form-urlencoded' },
  multipart: { 'Content-Type': 'multipart/form-data' },
}

export class HttpClient {
  private instance: AxiosInstance

  private baseURL: string

  private baseDomain: string

  constructor(baseUrl: string, config?: IAxiosConfigurationParams) {
    // apply default axios configuration params'
    const conf: IAxiosConfigurationParams = config || DEFAULT_AXIOS_CONFIGURATION
    this.baseURL = baseUrl
    const domain = new URL(baseUrl)
    this.baseDomain = domain.hostname
    this.instance = axios.create({
      baseURL: baseUrl,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: conf.timeout,
    })

    if (conf.retry.enable) {
      pluginAxiosRetry(this.instance, {
        maximum: conf.retry.maximum,
        retryOnlyHttpMethods: conf.retry.retryOnlyHttpMethods,
      })
    }
  }

  async request(
    config: IRouteConfig,
    opts?: {
      urlparams?: string[]
      queryparams?: IParams
      data?: any
      headers?: IHeaders
      omitJsonContentType?: boolean
      omitJsonEncodingType?: boolean
    }
  ): Promise<AxiosResponse> {
    const url = !!opts && !!opts.urlparams ? HttpClient.applyParams(config.path, opts.urlparams) : config.path

    const { method } = config
    const headers = {
      // (1) append application/json header by default
      ...(!!opts && !!opts.omitJsonContentType ? {} : HTTPReqHeaders.json),
      ...(!!opts && !!opts.omitJsonEncodingType ? {} : { 'Accept-Encoding': 'application/json' }),
      // (2) append headers passed to request() method
      ...(!!opts && !!opts.headers ? opts.headers : {}),
    }
    const query = !!opts && !!opts.queryparams ? { params: opts.queryparams } : {}
    const data = !!opts && !!opts.data ? { data: opts.data } : {}

    // this.logRequest({ url, method, headers, data, query })

    const response: AxiosResponse = await this.instance
      .request({
        url,
        method,
        headers,
        ...query,
        ...data,
      })
      .catch((error) => {
        if (has(error, 'response') && !!error.response) {
          // Has response, and non 2xx status
          return error.response as AxiosResponse
        }
        // request made, no response, or issue setting up the request
        const message: string = has(error, 'code')
          ? `Http request error: ${error.code} url = ${this.baseDomain}`
          : `Http request error: ${util.inspect(error)}\n`
        log.error(message)
        throw new Error(message)
      })
    // HttpClient.logResponse(response)
    return response
  }

  private static applyParams(path: string, params: string[]): string {
    return String.format(path, ...params)
  }

  private static logResponse(response: AxiosResponse) {
    log.debug(
      `STATUS: ${response.status} ${response.statusText}\n
       DATA: ${util.inspect(response.data, { showHidden: false, depth: null })} \n
       HEADERS: ${util.inspect(response.headers)}\n`
    )
  }

  private logRequest(config): void {
    log.debug(
      `\t${config.method} ${this.baseURL}${config.url} \n
      HEADERS: ${util.inspect(config.headers)}\n
      QUERYPARMS: ${util.inspect(config.query)}\n
      BODY: ${util.inspect(config.data, { showHidden: false, depth: null })}\n`
    )
  }
}
