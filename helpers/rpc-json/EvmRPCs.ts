import { GetLogsParams } from '../rpc-model/RpcModel'

export const ethGetLogs = (params: GetLogsParams) =>
  `{ "id": 1337, "jsonrpc": "2.0","method": "eth_getLogs", "params": [ ${JSON.stringify(params)} ]}`
