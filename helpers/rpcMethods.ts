const RcpMethods = {
  EthSendRawTransaction: `eth_sendRawTransaction`,
  EthFeeHistory: `eth_feeHistory`,
  EthGetUncleByBlockHashAndIndex: `eth_getUncleByBlockHashAndIndex`,
  EthGetTransactionReceipt: `eth_getTransactionReceipt`,
  EthGetTransactionCount: `eth_getTransactionCount`,
  EthGetTransactionByHash: `eth_getTransactionByHash`,
  EthGetTransactionByBlockNumberAndIndex: `eth_getTransactionByBlockNumberAndIndex`,
  EthGetTransactionByBlockHashAndIndex: `eth_getTransactionByBlockHashAndIndex`,
  EthGetStorageAt: `eth_getStorageAt`,
  EthGetBlockTransactionCountByNumber: `eth_getBlockTransactionCountByNumber`,
  EthGetBlockTransactionCountByHash: `eth_getBlockTransactionCountByHash`,
  EthBlockNumber: `eth_blockNumber`,
  EthGetBlockReceipts: `eth_getBlockReceipts`,
  EthGetBlockByNumber: `eth_getBlockByNumber`,
  EthGetBalance: `eth_getBalance`,
  EthGasPrice: `eth_gasPrice`,
  EthCall: `eth_call`,
  EthEstimateGas: `eth_estimateGas`,
  EthAccounts: `eth_accounts`,
  EthChainId: `eth_chainId`,
  EthGetCode: `eth_getCode`,
  EthGetBlockByHash: `eth_getBlockByHash`,
  EthGetBlockByNumb: `eth_getBlockByNumber`,
  EthGetLogs: `eth_getLogs`,
  EthSendRawTransac: `eth_sendRawTransaction`,
  EthSyncing: `eth_syncing`,
  EthGetFilterChanges: `eth_getFilterChanges`,
  EthNewBlockFilter: `eth_newBlockFilter`,
  EthUninstallFilter: `eth_uninstallFilter`,
  EthCreateAccessList: `eth_createAccessList`,
}

export const IsTxRequest = (rpcMethod) =>
  rpcMethod === RcpMethods.EthGetTransactionByHash ||
  rpcMethod === RcpMethods.EthGetTransactionByBlockNumberAndIndex ||
  rpcMethod === RcpMethods.EthGetTransactionByBlockHashAndIndex

export const IsTxReceiptRequest = (rpcMethod) => rpcMethod === RcpMethods.EthGetTransactionReceipt

export const IsBlockRequest = (rpcMethod) =>
  rpcMethod === RcpMethods.EthGetBlockByNumber || rpcMethod === RcpMethods.EthGetBlockByHash

export default RcpMethods
