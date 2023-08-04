import Notify, { ConfigOptions as NotifyConfigOptions } from 'bnc-notify'
import { BigNumber, Contract, ethers } from 'ethers'
import Noty from 'noty'
import { chain, useNetwork } from 'wagmi'

export const getLibrary = (provider: any) => {
  return provider
}

export const getBalance = async (tokenContract: Contract, userAddress: string) => {
  try {
    const balance = await tokenContract.balanceOf(userAddress)
    return balance
  } catch (e) {
    return ethers.BigNumber.from('0')
  }
}

export const bigToNum = (balance: ethers.BigNumber) => {
  return Number(ethers.utils.formatEther(balance))
}

export const CURVE_INDEX = 'm_12381_3600_0_0_0'
const BNC_NOTIFY_API_KEY = '7a0a4da1-7c92-46af-a12e-e810c1b39d3e'
export const notifyHash = (
  hash: string,
  chainId: number = chain.goerli.id,
  { desktopPosition = 'topRight' }: NotifyConfigOptions = {}
) => {
  const notify = Notify({
    dappId: BNC_NOTIFY_API_KEY,
    networkId: chainId,
    darkMode: true,
    txApproveReminderTimeout: 20000, // 20 secs
    txStallPendingTimeout: 1800000, // 30 mins
    txStallConfirmedTimeout: 1800000,
    desktopPosition
  })

  notify.hash(hash)
}

export function noty(msg: string, type: Noty.Type = 'alert') {
  const instance = new Noty({
    text: msg,
    theme: 'sunset',
    type,
    timeout: 10000
  })

  instance.on('onClick', async () => {
    await navigator.clipboard.writeText(msg)
    return noty('Error text has been copied to clipboard.', 'info')
  })

  instance.show()
}

export const handleErr = (err: any, defaultErr?: string) => {
  if (typeof err === 'object' && 'message' in err) {
    if (/initials already registered/gi.test(err.message)) {
      return 'This wallet address is already registered with us. Please use a new one'
    } else if (/user rejected transaction/gi.test(err.message)) {
      return 'User rejected transaction'
    } else if (defaultErr) {
      return defaultErr
    } else {
      return err.message
    }
  } else {
    return 'Could not perform this action.'
  }
}

export const humanReadableAddress = (address: string, length: number = 6) =>
  `${address.substring(0, length)}...${address.substring(address.length - 4, address.length)}`

export const bytesForHuman = (bytes: number) => {
  let units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  let i = 0

  for (i; bytes > 1024; i++) {
    bytes /= 1024
  }

  return bytes.toFixed(1) + ' ' + units[i]
}

export const weiToEthNum = (balance: BigNumber) => {
  return Number(ethers.utils.formatEther(balance))
}

export const remove0x = (str: string) => {
  if (str.startsWith('0x')) {
    return str.substring(2, str.length)
  }
  return str
}

export function cutDecimals(value: string | number, maxDecimals: number): string {
  const examinedValue = String(value)

  if (examinedValue.includes('.')) {
    const pointIdx = examinedValue.indexOf('.')

    const units = examinedValue.substring(0, pointIdx)
    const decimals = examinedValue.substring(pointIdx, pointIdx + maxDecimals + 1)

    return `${units}${decimals}`
  }

  return examinedValue
}

export function makeFile<T extends Record<any, any> | undefined>(
  file: T,
  name: string
): File | null {
  if (!file) return null
  return new File([JSON.stringify(file, null, 2)], name)
}

export function makeJsonFile<T extends Record<any, any> | undefined>(file: T, name: string) {
  return makeFile(file, name)
}

export function getUnixTimestamp() {
  return Math.floor(new Date().getTime() / 1000)
}

export function makeDepositObjectFilename() {
  const timestamp = getUnixTimestamp()
  return `deposit_data-${timestamp}.json`
}

export function makeKeystoreFilename() {
  const timestamp = getUnixTimestamp()
  return `keystore-${CURVE_INDEX}-${timestamp}.json`
}

export function makeRecoveryKeyFilename() {
  const timestamp = getUnixTimestamp()
  return `recovery-${timestamp}.json`
}

export async function parseFileAsJson<T>(file: File): Promise<T> {
  const text = await file.text()
  return JSON.parse(text)
}

export const pad0x = (str: string) => `0x${str}`
export const MIN_BALANCE = ethers.utils.parseEther('32.0')

export function isTxRejectedByUser(err: any): boolean {
  const USER_DENIED_CODE = 4001
  return err?.code === USER_DENIED_CODE || err?.code === 'ACTION_REJECTED'
}

export const changeInput = (val: string) => {
  if (val.includes('.')) {
    const belowDotNumbers = val.split('.')[1]
    const fixedBelowDotNumbers = belowDotNumbers.slice(0, 3)
    const fullNumber = `${val.split('.')[0]}.${fixedBelowDotNumbers}`
    return fullNumber
  } else {
    return val
  }
}
