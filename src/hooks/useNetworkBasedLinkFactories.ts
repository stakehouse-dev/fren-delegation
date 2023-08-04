import { useNetwork } from 'wagmi'

import {
  beaconUrls,
  explorerUrls,
  supportedChains,
  frenDelegationBribeVaultAddresses
} from '@/constants/chains'
import { remove0x } from '@/utils/global'

export function useNetworkBasedLinkFactories() {
  const { activeChain } = useNetwork()

  function makeEtherscanLink(hash: string) {
    const chainId = activeChain?.id || supportedChains[0].id
    const explorerUrl = explorerUrls[chainId]
    return `${explorerUrl}/tx/${hash}`
  }

  function makeFrenDelegationBribeVaultAddress() {
    const chainId = activeChain?.id || supportedChains[0].id
    return frenDelegationBribeVaultAddresses[chainId]
  }

  function makeBeaconLink(account: string) {
    const chainId = activeChain?.id || supportedChains[0].id
    const beaconUrl = beaconUrls[chainId]
    return `${beaconUrl}/validator/${remove0x(account)}`
  }

  return { makeEtherscanLink, makeBeaconLink, makeFrenDelegationBribeVaultAddress }
}
