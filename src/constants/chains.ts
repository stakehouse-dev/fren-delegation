import { chain } from 'wagmi'

export const supportedChains = [chain.goerli, chain.mainnet]

export const rpcUrls = {
  [chain.mainnet.id]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  [chain.ropsten.id]: `https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  [chain.rinkeby.id]: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  [chain.goerli.id]: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  [chain.kovan.id]: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
}

export const explorerUrls = {
  [chain.mainnet.id]: `https://etherscan.io`,
  [chain.ropsten.id]: `https://ropsten.etherscan.io`,
  [chain.rinkeby.id]: `https://rinkeby.etherscan.io`,
  [chain.goerli.id]: `https://goerli.etherscan.io`,
  [chain.kovan.id]: `https://kovan.etherscan.io`
}

export const beaconUrls = {
  [chain.mainnet.id]: `https://beaconcha.in`,
  [chain.ropsten.id]: `https://ropsten.beaconcha.in`,
  [chain.goerli.id]: `https://prater.beaconcha.in`
}

export const BEACON_NODE_URL = 'https://info-goerli.joinstakehouse.com/'

export const frenDelegationBribeVaultAddresses = {
  [chain.mainnet.id]: [''],
  [chain.goerli.id]: ['0xeC01dfbE79412b078521793df4415AD8b84EDB27']
}
