import { FC, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { useAccount, useBalance } from 'wagmi'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { Button, CompletedTxView, ErrorModal, LoadingModal, ModalDialog } from '@/components/shared'
import { MAX_GAS_FEE } from '@/constants'
import { config } from '@/constants/environment'
import { useBuilderMethods, useNetworkBasedLinkFactories } from '@/hooks'

export default function ProtectedStaking() {
  const [amount, setAmount] = useState<string>('')
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState<string>()
  const [txResult, setTxResult] = useState<any>()

  const { topUp, isLoading, setIsLoading } = useBuilderMethods()
  const navigate = useNavigate()
  const { data: account } = useAccount()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  const { data: { formatted: MAX_AMOUNT } = { formatted: 0 } } = useBalance({
    addressOrName: account?.address,
    formatUnits: 'ether',
    chainId: config.networkId
  })

  const errMessage = useMemo(() => {
    if (!MAX_AMOUNT || amount === '') return ''

    if (Number(MAX_AMOUNT) < 0.001 || Number(amount) > Number(MAX_AMOUNT)) {
      return 'Insufficient Balance'
    }

    return ''
  }, [MAX_AMOUNT, amount])

  const handleSetMaxAmount = async () => {
    setAmount(MAX_AMOUNT ? `${Number(MAX_AMOUNT) - MAX_GAS_FEE}` : '')
  }

  const handleCloseSuccessModal = () => {
    setTxResult(undefined)
    navigate('/')
  }

  const handleClick = async () => {
    // try {
    //   const txResult = await topUp(account?.address || '', amount)
    //   setTimeout(() => {
    //     setTxResult(txResult)
    //   }, 500)
    // } catch (err: any) {
    //   console.log(err, err.message)
    //   setIsLoading(false)
    //   setTimeout(() => {
    //     setError(err.reason[0].toUpperCase() + err.reason.substr(1))
    //     setFailed(true)
    //   }, 500)
    // }
  }
  return (
    <div className="flex justify-center items-center flex-col gap-2">
      <Box>
        <div className="flex items-center mb-4">
          <img src={ArrowLeftSVG} className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <Title>Protected Staking</Title>
        </div>
        <div className="w-full flex flex-col gap-1.5 px-4 mb-4">
          <div className="font-semibold text-white">Deposit ETH</div>
          <InputWrapper>
            <Input
              value={amount}
              placeholder="Amount"
              onChange={(e) => {
                if (!isNaN(Number(e.target.value))) {
                  setAmount(e.target.value)
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
          txLink={makeEtherscanLink(txResult?.hash)}
          onGoToClick={handleCloseSuccessModal}
          message={
            <div className="flex flex-col items-center">
              <span className="text-sm text-grey300">{`Your transaction has processed.`}</span>
            </div>
          }
        />
      </ModalDialog>
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
