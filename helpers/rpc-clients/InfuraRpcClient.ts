import { AxiosResponse } from 'axios'
import { matchersWithOptions } from 'jest-json-schema'
import { isEthereumNetwork } from 'globals'
import { ethGetLogs } from '../rpc-json/EvmRPCs'
import { HttpClient, IHeaders } from '../axios/HttpClient'
import { GetLogsParams } from '../rpc-model/RpcModel'
import EFExecutionSpecBuilder from '../EFExecutionSpecBuilder'
import RcpMethods, { IsBlockRequest } from '../rpcMethods'

export default class InfuraRpcClient {
  protected httpClient: HttpClient

  constructor(inputUrl?: string) {
    this.httpClient = new HttpClient(inputUrl)
  }

  public eth_getLogs = async (params: GetLogsParams) =>
    this.doAxiosPost(ethGetLogs(params), undefined, RcpMethods.EthGetLogs)

  // Wraps the Axios post request and records the request body and response
  private async doAxiosPost(
    body: string,
    headers?: IHeaders,
    ethMethod?: string,
    checkSchema = true
  ): Promise<AxiosResponse> {
    expect.extend(
      matchersWithOptions({
        verbose: true,
      })
    )

    let response
    if (!headers) {
      response = await this.httpClient.request(
        {
          path: '',
          method: 'post',
        },
        {
          data: body,
        }
      )
    } else {
      response = await this.httpClient.request(
        {
          path: '',
          method: 'post',
        },
        {
          data: body,
          headers,
        }
      )
    }
    // Response Json Schema Validation
    if (ethMethod && response.data && response.data.result && checkSchema) {
      // skip schema validation for empty arrays, problematic with the eth_getFilterChanges request
      if (Array.isArray(response.data.result) && response.data.result.length === 0) return response
      const responseSchema = await new EFExecutionSpecBuilder().getRpcSchema(ethMethod)
      if (!isEthereumNetwork && IsBlockRequest(ethMethod)) delete response.data.result.l1BlockNumber
      expect(response.data.result).toMatchSchema(responseSchema)
    }

    return response
  }
}
