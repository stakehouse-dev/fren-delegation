import { parseEther } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { useAccount, useBalance } from 'wagmi'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { Button, CompletedTxView, ErrorModal, LoadingModal, ModalDialog } from '@/components/shared'
import { MAX_GAS_FEE } from '@/constants'
import { useDeposit, useNetworkBasedLinkFactories, useUser } from '@/hooks'
import { changeInput, humanReadableAddress } from '@/utils/global'

import ModalInvalidDeposit from '../Modals/ModalInvalidDeposit'

export default function MEVStaking() {
  const [amount, setAmount] = useState<string>('')
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState<string>()
  const [txResult, setTxResult] = useState<any>()

  const [isInvalidDeposit, setIsInvalidDeposit] = useState<boolean>(false)

  const { mevDeposit: deposit, isLoading, setIsLoading } = useDeposit()
  const { mevMax, blsKey } = useUser()
  const navigate = useNavigate()
  const { data: account } = useAccount()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  useEffect(() => {
    if (!blsKey) navigate('/')
  }, [blsKey])

  const { data: { formatted: MAX_AMOUNT } = { formatted: 0 } } = useBalance({
    addressOrName: account?.address,
    formatUnits: 'ether'
  })

  // 0xa1e15a7369068ad6969a4bbd6751d8c149661b48d602d66a6739b7c235c5d313c73c40e86ef73a451ed1bbc07a3aa2d2

  const errMessage = useMemo(() => {
    if (!MAX_AMOUNT || amount === '') return ''

    if (Number(MAX_AMOUNT) < 0.001 || Number(amount) > Number(MAX_AMOUNT)) {
      return 'Insufficient Balance'
    }

    if (Number(amount) < 0.001) {
      return 'Minimum deposit amount is 0.001 ETH'
    }

    return ''
  }, [MAX_AMOUNT, amount])

  const handleSetMaxAmount = async () => {
    const max = Math.min(Number(MAX_AMOUNT), mevMax)
    setAmount(max == Number(MAX_AMOUNT) ? `${Number(max) - MAX_GAS_FEE}` : `${max}`)
  }

  const handleCloseSuccessModal = () => {
    setTxResult(undefined)
    navigate('/')
  }

  const handleClick = async () => {
    if (Number(amount) > mevMax) {
      setIsInvalidDeposit(true)
      return
    }

    try {
      const txResult = await deposit(blsKey, parseEther(amount).toString(), parseEther(amount))
      setTimeout(() => {
        setTxResult(txResult)
      }, 500)
    } catch (err: any) {
      console.log(err, err.message)
      setIsLoading(false)
      setTimeout(() => {
        setError(err.reason[0].toUpperCase() + err.reason.substr(1))
        setFailed(true)
      }, 500)
    }
  }
  return (
    <div className="flex justify-center items-center flex-col gap-2">
      <Box>
        <div className="flex items-center mb-4">
          <img src={ArrowLeftSVG} className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <Title>MEV Staking</Title>
        </div>
        <div className="w-full flex flex-col gap-1.5 px-4 mb-4">
          <div className="font-semibold text-white">Deposit ETH</div>
          <InputWrapper>
            <Input
              value={amount}
              placeholder="Amount"
              onChange={(e) => {
                const val = parseFloat('0' + e.target.value)
                if (!isNaN(val)) {
                  setAmount(changeInput(e.target.value))
                }
              }}
              className="text-xl text-grey25 bg-black outline-none"
            />
            <MaxButtonWrapper>
              <span>ETH</span>
              {Number(MAX_AMOUNT) !== Number(amount) && (
                <button onClick={handleSetMaxAmount}>
                  <p className="text-xs font-medium text-primary700">MAX</p>
                </button>
              )}
            </MaxButtonWrapper>
          </InputWrapper>
          <div className="w-full text-error text-right">{errMessage}</div>
          <Balance>
            Available: {Number(MAX_AMOUNT).toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
            ETH
          </Balance>
          <Button size="lg" disabled={!amount || errMessage.length > 0} onClick={handleClick}>
            Confirm
          </Button>
        </div>
      </Box>
      <LoadingModal open={isLoading} title="Confirmation Pending" onClose={() => {}} />
      <ErrorModal
        open={failed}
        onClose={() => setFailed(false)}
        title="Deposit Failed"
        message={error}
        actionButtonContent="Try Again"
        onAction={() => setFailed(false)}
      />
      <ModalDialog open={!!txResult} onClose={() => setTxResult(undefined)}>
        <CompletedTxView
          goToContent="Home"
          title="Success"
          txLink={'https://lsd.joinstakehouse.com/'}
          onGoToClick={handleCloseSuccessModal}
          message={
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm text-grey300">
                You&apos;ve successfully deposited ETH into the validator:
                <div className="flex items-center justify-center text-white mt-1 font-semibold">
                  {humanReadableAddress(txResult?.hash ?? '', 13)}{' '}
                  <ArrowTopRightIcon
                    onClick={() =>
                      window.open(
                        makeEtherscanLink(txResult?.hash),
                        '_blank' // <- This is what makes it open in a new window.
                      )
                    }
                    className="ml-1 cursor-pointer"
                  />
                </div>
              </span>
              <span className="text-sm text-grey300">
                To check your staking details and more, go to the Stakehouse LSD dApp.
              </span>
            </div>
          }
        />
      </ModalDialog>
      <ModalInvalidDeposit
        open={isInvalidDeposit}
        onClose={() => setIsInvalidDeposit(false)}
        maxLimit={mevMax}
      />
    </div>
  )
}

const Box = styled.div`
  ${tw`w-full bg-grey850 mt-10 max-w-lg p-4 rounded-2xl flex flex-col gap-8`}
`
const Title = styled.div`
  ${tw`text-white font-semibold text-center w-full`}
  font-size: 32px;
`
const InputWrapper = tw.div`relative flex items-center text-white`
const Input = styled.input`
  ${tw`w-full h-full pl-4 pr-28 text-base py-3 rounded-lg border border-solid border-grey500`}
  &::placeholder {
    color: #888d9b;
  }
`

const MaxButtonWrapper = styled.div`
  ${tw`absolute right-4 flex items-center gap-4`}

  button {
    @apply py-1 px-1.5 rounded-lg;
    background-color: rgba($color: #00ed7b, $alpha: 0.1);
  }
`
const Balance = styled.div`
  ${tw`text-right text-sm px-2`}
  color: #888d9b;
`
