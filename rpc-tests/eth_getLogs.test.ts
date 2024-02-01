import RpcClient from '../helpers/rpc-clients/InfuraRpcClient'
import { NetworkNames, evmRpcUrl, getNetworkName } from '../helpers/globals'

const dataFixture = [
  {
    network: NetworkNames.BlastTestnet,
    values: {
      body0: {
        fromBlock: '0x1016d2',
        toBlock: '0x101715',
        address: ['0xF4475Af85a484aA9A87705CF3a2F02F5BCBCdef5'],
        topics: ['0x879b0d7fc5ab2044f5760066c1bded84507ae1ffc3f3224017c512e378f7f63d'],
      },
      body1: {
        fromBlock: '0x1016d2',
        toBlock: '0x101715',
        topics: [
          '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
          '0x000000000000000000000000a0035a76078dbd1c025de1030b9da7dbb36d4880',
        ],
      },
      body2: {
        fromBlock: '0x1016d2',
        toBlock: '0x101715',
        address: ['0x5fdcf79bdad3a7515fa075a5292259f9ac504046'],
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          '0x000000000000000000000000a0035a76078dbd1c025de1030b9da7dbb36d4880',
          '0x000000000000000000000000f4475af85a484aa9a87705cf3a2f02f5bcbcdef5',
        ],
      },
      body3: {
        fromBlock: '0x1016d2',
        toBlock: '0x101715',
        address: ['0xD9aEBA16Bf9c50Aba84fb6F934fEfdA99835DA60'],
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          '0',
          '0x000000000000000000000000a0035a76078dbd1c025de1030b9da7dbb36d4880',
          '3110',
        ],
      },
      sameBlockBody: {
        fromBlock: '0x1016d2',
        toBlock: '0x101715',
      },
      differentBlockBodyWithTopicsAndAddresses: {
        fromBlock: '0x1016d2',
        toBlock: '0x101715',
        address: ['0xD9aEBA16Bf9c50Aba84fb6F934fEfdA99835DA60'],
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
      },
      multipleAddressesBody: {
        fromBlock: '0x1016d2',
        toBlock: '0x101715',
        address: ['0x5fdcf79bdad3a7515fa075a5292259f9ac504046', '0xD9aEBA16Bf9c50Aba84fb6F934fEfdA99835DA60'],
      },
      blockHash: {
        blockHash: '0x48c4dea5ec56971ad298836cf2fdf865d7b4a35625dbce0c742f317cecc3f59e',
      },
    },
  },
]

test(`Check L2 EVM logs for ${getNetworkName()} with 1 topic`, async () => {
  const data = dataFixture.filter((k) => getNetworkName() === k.network)[0].values
  const rpcClient = await new RpcClient(evmRpcUrl)
  await rpcClient.eth_getLogs(data.body0)
})

test(`Check L2 EVM logs for ${getNetworkName()} with 2 topics`, async () => {
  const data = dataFixture.filter((k) => getNetworkName() === k.network)[0].values
  const rpcClient = await new RpcClient(evmRpcUrl)
  await rpcClient.eth_getLogs(data.body1)
})
test(`Check L2 EVM logs for ${getNetworkName()} with 3 topics`, async () => {
  const data = dataFixture.filter((k) => getNetworkName() === k.network)[0].values
  const rpcClient = await new RpcClient(evmRpcUrl)
  await rpcClient.eth_getLogs(data.body2)
})
test(`Check L2 EVM logs for ${getNetworkName()} with 4 topics`, async () => {
  const data = dataFixture.filter((k) => getNetworkName() === k.network)[0].values
  const rpcClient = await new RpcClient(evmRpcUrl)
  await rpcClient.eth_getLogs(data.body3)
})
test(`Check L2 EVM logs for ${getNetworkName()} with multiple addresses`, async () => {
  const data = dataFixture.filter((k) => getNetworkName() === k.network)[0].values
  const rpcClient = await new RpcClient(evmRpcUrl)
  await rpcClient.eth_getLogs(data.multipleAddressesBody)
})
test(`Check L2 EVM logs for ${getNetworkName()} with blockHash`, async () => {
  const data = dataFixture.filter((k) => getNetworkName() === k.network)[0].values
  const rpcClient = await new RpcClient(evmRpcUrl)
  rpcClient.eth_getLogs(data.blockHash)
})
test(`Check L2 EVM logs for ${getNetworkName()} from same block with topic and address`, async () => {
  const data = dataFixture.filter((k) => getNetworkName() === k.network)[0].values
  const rpcClient = await new RpcClient(evmRpcUrl)
  await rpcClient.eth_getLogs(data.differentBlockBodyWithTopicsAndAddresses)
})

test(`Check L2 EVM logs for  from same block`, async () => {
  const data = dataFixture.filter((k) => getNetworkName() === k.network)[0].values
  const rpcClient = await new RpcClient(evmRpcUrl)
  await rpcClient.eth_getLogs(data.sameBlockBody)
})
