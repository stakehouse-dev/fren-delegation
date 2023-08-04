import { useQuery } from '@apollo/client'
import { Wizard } from '@blockswaplab/lsd-wizard'
import { formatEther } from 'ethers/lib/utils'
import { useEffect, useMemo } from 'react'
import tw from 'twin.macro'
import { useSigner } from 'wagmi'

import { ReactComponent as EthIcon } from '@/assets/images/icon-eth.svg'
import { ClipboardCopy, Spinner, Tooltip } from '@/components/shared'
import { ValidatorQuery } from '@/graphql/queries/ValidatorQuery'
import { useSDK, useUser } from '@/hooks'
import { humanReadableAddress } from '@/utils/global'

export default function ValidatorDetails({ blsKey, bribeData }: { blsKey: string, bribeData: any }) {
  const { protectedMax, mevMax, setProtectedMax, setMevMax, setBlsKey } = useUser()
  const { setWizard } = useSDK()
  const { data: signer } = useSigner()

  const { loading, data } = useQuery(ValidatorQuery, {
    variables: { blsKey },
    fetchPolicy: 'cache-and-network',
    skip: blsKey.length != 98 || !blsKey.startsWith('0x')
  })

  useEffect(() => {
    if (signer && data && data.lsdvalidator) {
      const protectedStakingLPs = data.lptokens.filter(
        (token: any) => token.tokenType === 'PROTECTED_STAKING_LP'
      )
      const MEVStakingLPs = data.lptokens.filter(
        (token: any) => token.tokenType === 'FEES_AND_MEV_LP'
      )

      const protectedStakingLP =
        protectedStakingLPs.length > 0 ? protectedStakingLPs[0] : { minted: 0 }

      const MEVStakingLP = MEVStakingLPs.length > 0 ? MEVStakingLPs[0] : { minted: 0 }

      setProtectedMax(24 - Number(formatEther(protectedStakingLP.minted)))
      setMevMax(4 - Number(formatEther(MEVStakingLP.minted)))

      setBlsKey(data.lsdvalidator.id)

      const wizard = new Wizard({
        signerOrProvider: signer,
        liquidStakingManagerAddress: data.lsdvalidator.liquidStakingManager,
        savETHPoolAddress: data.lsdvalidator.smartWallet.liquidStakingNetwork.savETHPool,
        feesAndMevPoolAddress: data.lsdvalidator.smartWallet.liquidStakingNetwork.feesAndMevPool
      })

      setWizard(wizard)
    }
  }, [data, signer])

  return (
    <>
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Spinner size={32} />
        </div>
      )}
      {data && !loading && !data.lsdvalidator && <div>Invalid validator address.</div>}
      {data && data.lsdvalidator && !loading && (
        <div className="flex flex-col gap-2 w-full">
          <Box>
            <div className="text-grey700">Validator&apos;s Details</div>
            <Stat>
              <Label>
                LSD Network Name{' '}
                <Tooltip message="This is the LSD Network that the selected validator is a part of." />
              </Label>
              <span className="font-semibold">
                {data.lsdvalidator.smartWallet.liquidStakingNetwork.ticker}
              </span>
            </Stat>
            <Stat>
              <Label>
                BLS Key <Tooltip message="The selected validator address." />
              </Label>
              <span className="flex items-center gap-2">
                {humanReadableAddress(blsKey)} <ClipboardCopy copyText={blsKey} />
              </span>
            </Stat>
            <Stat>
              <Label>
                Node operator name <Tooltip message="The name of your node operator." />
              </Label>
              <span className="flex items-center gap-2">
                {data.lsdvalidator.smartWallet.nodeRunner.name.length > 0 ? (
                  data.lsdvalidator.smartWallet.nodeRunner.name
                ) : (
                  <>
                    {humanReadableAddress(data.lsdvalidator.smartWallet.nodeRunner.id)}
                    <ClipboardCopy copyText={blsKey} />
                  </>
                )}
              </span>
            </Stat>
          </Box>
          <Box>
            <div className="text-grey700">Total delegation available</div>
            <Stat>
              <Label>
                <EthIcon />
                Protected Staking <Tooltip message="Receive dETH and rewards in dETH." />
              </Label>
              <span className="text-grey700">
                <span className={`${protectedMax > 0 ? 'text-primary' : ''}`}>
                  {protectedMax.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                </span>{' '}
                / 24 ETH
              </span>
            </Stat>
            <Stat>
              <Label>
                <EthIcon /> MEV Staking{' '}
                <Tooltip message="Receive free floating SLOT tokens and rewards in ETH." />
              </Label>
              <span className="text-grey700">
                <span className={`${mevMax > 0 ? 'text-secondary' : ''}`}>
                  {mevMax.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                </span>{' '}
                / 4 ETH
              </span>
            </Stat>
          </Box>
          {data && data.lsdvalidator && !loading && bribeData && (
            <Box>
              <div className="text-grey700">Incentives available</div>
              <Stat>
                <Label>
                  Earn up to <Tooltip message="Receive ERC-20 tokens for funding specific validators" />
                </Label>
                <span className="text-grey700">
                  <span className="text-primary">
                    {(bribeData.tokenToEthRatio / (10**bribeData.tokenDecimals)).toLocaleString(undefined, { maximumFractionDigits: 3 })} {' '} {bribeData.tokenName}
                  </span>
				 {' '} per 1 ETH
                </span>
              </Stat>
            </Box>
		  )}
        </div>
      )}
    </>
  )
}

const Box = tw.div`bg-grey900 w-full rounded-2xl py-4 px-8 text-sm text-white font-medium flex flex-col gap-2`
const Label = tw.span`flex gap-1 items-center`
const Stat = tw.div`flex justify-between`
