# Fren Delegation
Collectively stake 32 ETH for a validator by just sharing the BLS public key...  
A node operator that has already registered a BLS public key in the LSD Network by depositing 4 ETH, can invite others to to deposit ETH for this BLS public key. Once the BLS public key has colelcted 32 ETH, the node operator can stake and run a valdiator.  
All the depositors will get LP tokens, in return of ETH, depending on the pro rata share of their deposit.

![](https://i.imgur.com/RhhvBh9.png)

For a given BLS public key, the Fren delegation screen will show the following details:
* Validator Details
    * LSD Network Name: Name of the LSD network the BLS public key is registered in.
    * BLS Key: BLS public key for which the deposit is to be made.
    * Node operator name: A 1-10 character long name set by the node operator.

* Total delgation available:
    * Protected Staking: Amount of ETH that can be deposited in the Protected Staking Pool for the BLS public key.
    * MEV Staking: Amount of ETH that can be deposited in the MEV Staking Pool for the BLS public key.

If the BLS public key accepts deposits for either of the pools, then their respective buttons will be enabled.  
If the Protected Staking button is enabled, following screen appears when the button is clicked:
![](https://i.imgur.com/7RymqKs.png)
* Deposit ETH (input box): Enter the amount of ETH to be deposited (minimum accepted deposit is 0.001 ETH).
* Confirm button: When clicked, it makes a call to the Protected Staking Pool (SavETH Vault smart contract) of the respective LSD network and deposits specified ETH for the BLS public key.

This is how a function call to deposit ETH into the Protected Staking pool looks like:
```javascript
const { Wizard } = require('@blockswaplab/lsd-wizard');
// initialise the Wizard SDK with correct LSD Network addresses
const wizard = new Wizard(
	signer: <USER_SIGNER_INSTANCE>,
	liquidStakingManagerAddress: <LSM_ADDRESS>
	savETHPoolAddress: <SAVETH_POOL_ADDRESS>
	feesAndMevPoolAddress:<FEES_MEV_POOL_ADDRESS>
);

const tx = await wizard.savETHPool.depositETHForStaking(
	blsPublicKey, // BLS public key of the validator
	amount,       // Amount of ETH to be deposited in wei (in string)
	ethValue      // Amount of ETH to be deposited (in Big Numbers)
);
```

![](https://i.imgur.com/BsFzlha.png)
On the top right corner, click on the 3 dots to get various resources. Toggle between mainnet and testnet by enabling or disabling Testnet Mode.
