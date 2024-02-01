import { getDebugLogger } from './logging/DebugLogger'

export enum NetworkNames {
  BlastTestnet = '://blast-testnet',
  Sepolia = '://sepolia',
  Goerli = '://goerli',
  Ropsten = '://ropsten',
  Ethereum = '://mainnet',
  AuroraTestnet = '://aurora-testnet',
  AuroraMain = '://aurora-mainnet',
  Polygon = 'polygon-mainnet',
  PolygonMumbai = 'polygon-mumbai',
  ArbitrumMain = 'arbitrum-mainnet',
  ArbitrumGoerli = 'arbitrum-goerli',
  ArbitrumSepolia = 'arbitrum-sepolia',
  Optimism = 'optimism-mainnet',
  OptimismGoerli = 'optimism-goerli',
  OptimismSepolia = 'optimism-sepolia',
  Palm = 'palm-mainnet',
  PalmTestnet = 'palm-testnet',
  AvalancheMain = 'avalanche-mainnet',
  AvalancheFuji = 'avalanche-fuji',
  StarknetMain = 'starknet-mainnet',
  StarknetGoerli = 'starknet-goerli',
  StarknetSepolia = 'starknet-sepolia',
  CeloMain = 'celo-mainnet',
  CeloAlfajores = 'celo-alfajores',
  BinanceSmartChainMain = 'bnbsmartchain-mainnet',
  BinanceSmartChainTest = 'bnbsmartchain-testnet',
  CoinbaseGoerli = 'base-goerli',
  CoinbaseSepolia = 'base-sepolia',
  CoinbaseMainnet = 'base-mainnet',
  LineaGoerli = 'linea-goerli',
  LineaMainnet = 'linea-mainnet',
  GasApi = 'gas.api',
}

const log = getDebugLogger()

export const getNetworkName = (): NetworkNames => {
  let networkName
  const networkNames = Object.values(NetworkNames)
  const networkUrl = process.env.EVM_RPC_URL

  log.debug(`Network name not defined, setting it up...`)
  for (let i = 0; i < networkNames.length; i += 1) {
    if (networkUrl && networkUrl.includes(networkNames[i])) {
      const foundNetwork = Object.keys(NetworkNames).find((k) => NetworkNames[k] === networkNames[i])
      networkName = NetworkNames[foundNetwork as keyof typeof NetworkNames] // Add type assertion
      log.debug(`Parsed network name from url = ${networkName}`)
      break
    }
  }

  if (!networkName) {
    log.error(`Unable to parse network name from url ${networkUrl}`)
    throw new Error(`Unable to parse network name from url ${networkUrl}`)
  }

  return networkName
}

export const networkName = getNetworkName()

export const evmRpcUrl = process.env.EVM_RPC_URL

export const isEthereumNetwork =
  networkName === NetworkNames.Ethereum || networkName === NetworkNames.Goerli || networkName === NetworkNames.Sepolia

export const isArbitrumNetwork =
  networkName === NetworkNames.ArbitrumMain ||
  networkName === NetworkNames.ArbitrumGoerli ||
  networkName === NetworkNames.ArbitrumSepolia

export const isAvalancheNetwork =
  networkName === NetworkNames.AvalancheMain || networkName === NetworkNames.AvalancheFuji

export const isPalmNetwork = networkName === NetworkNames.Palm || networkName === NetworkNames.PalmTestnet
export const isPolygonNetwork = networkName === NetworkNames.Polygon || networkName === NetworkNames.PolygonMumbai
export const isCeloNetwork = networkName === NetworkNames.CeloMain || networkName === NetworkNames.CeloAlfajores
export const isCeloAlfajores = networkName === NetworkNames.CeloAlfajores
