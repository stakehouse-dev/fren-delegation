import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'
import { useConnect, useSigner } from 'wagmi'
import { Wizard } from '@blockswaplab/lsd-wizard'
import { ReactComponent as CloseIcon } from '@/assets/images/close-icon.svg'
import { ModalWalletConnect } from '@/components/app'
import ValidatorDetails from '@/components/app/ValidatorDetails'
import { Button } from '@/components/shared'
import { useSDK, useUser, useNetworkBasedLinkFactories } from '@/hooks'

export default function Stake() {
  const { isConnected } = useConnect()
  const navigate = useNavigate()

  const { data: signer } = useSigner()
  const { makeFrenDelegationBribeVaultAddress } = useNetworkBasedLinkFactories()

  const [openWalletModal, setOpenWalletModal] = useState(false)

  const { mevMax, protectedMax, setProtectedMax, setMevMax, setBlsKey, blsKey } = useUser()

  const [key, setKey] = useState<string>(blsKey)
  let bribe = false
  const { setWizard, wizard } = useSDK()

  const handleOpenWalletModal = () => {
    setOpenWalletModal(true)
  }
  const handleCloseWalletModal = () => {
    setOpenWalletModal(false)
  }

  const handleChange = async (value: string) => {
    setKey(value)
    setProtectedMax(0)
    setMevMax(0)
    setBlsKey('')
    setWizard(null)
    bribe = await isValidatorIncentivized(value)
  }

  const isValidatorIncentivized = async (value: string) => {
    try {
      const bribeVaultAddresses = makeFrenDelegationBribeVaultAddress()
      const bribeVaultAddress = bribeVaultAddresses[0] // TO-DO: iterate each BribeVault and show rewards from each?
      const bribeWizard = new Wizard({
        signerOrProvider: signer,
        liquidStakingManagerAddress: '0x0000000000000000000000000000000000000000', // If we do not do this, the utils package will not be initialised
        frenDelegationBribeVaultAddress: bribeVaultAddress
      })
      const data = await bribeWizard.utils.getFrenDelegationBribesByBLS(value)
      console.log('data', data)
      return data
    } catch (err: any) {
      console.log('Bribe error', err)
      return false
    }
  }

  return (
    <div className="text-white flex flex-col gap-8 mt-14">
      <div className="w-full text-center text-4xl font-semibold">Stake ETH with your Fren</div>
      <Box>
        <div className="text-3xl font-semibold text-white">Fren Delegation</div>
        {!isConnected && (
          <>
            <div className="font-medium mb-4">Stake your ETH with frens or frens of frens</div>

            <Button size="lg" className="w-full" onClick={handleOpenWalletModal}>
              Connect Wallet
            </Button>
          </>
        )}
        {isConnected && (
          <>
            <div className="font-medium mb-4">Delegate your ETH to your Fren&apos;s Validator</div>
            <div className="w-full relative">
              <input
                value={key}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Enter a validator public key"
                className="w-full text-grey25 bg-black outline-none py-3 pl-4 pr-10 rounded-lg border border-grey500"
              />
              {key.length > 0 && (
                <div
                  className="cursor-pointer absolute right-3 top-3"
                  onClick={() => handleChange('')}>
                  <CloseIcon />
                </div>
              )}
            </div>
            <ValidatorDetails blsKey={key} bribeData={bribe} />
            <div className="w-full flex gap-3 mt-2">
              <Button
                size="lg"
                className="w-full"
                disabled={!protectedMax}
                onClick={() => navigate('/protected-staking')}>
                Protected Staking
              </Button>
              <Button
                size="lg"
                className="w-full"
                style={!mevMax ? {} : { background: '#D1ADFF' }}
                disabled={!mevMax}
                onClick={() => navigate('/mev-staking')}>
                MEV Staking
              </Button>
            </div>
          </>
        )}
      </Box>
      <ModalWalletConnect open={openWalletModal} onClose={handleCloseWalletModal} />
    </div>
  )
}

const Box = tw.div`bg-[#2D2E35] max-w-[529px] text-[#D0D5DD] w-full mx-auto flex flex-col gap-4 items-center rounded-2xl pt-6 px-12 pb-8`
