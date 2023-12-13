# BOB Collective: Gas fee payment in WBTC (using ERC-2771)

In this example, we will show how WBTC can be used for gas fee payments using the ERC-2771 standard on BOB. This enables users to transact without the necessity to own ether.

## Local development

### Installing the project

1. Install [pnpm](https://pnpm.io/installation)
2. Run `pnpm install`

### Connecting Metamask

You can either connect directly from the UI, or from Conduit:

1. Go to [Conduit](https://app.conduit.xyz/published/view/puff-bob-jznbxtoq7h)
2. Click the 'Add to wallet button.'

### Funding your account

#### Native token

1. Fund your account with Sepolia ETH from the [Sepolia testnet faucet](https://faucetlink.to/sepolia).
2. Transfer Sepolia ETH to BOB using [Superbridge](https://puff-bob-jznbxtoq7h.testnets.superbridge.app/).

#### Other supported tokens

1. This can be done by using the faucet button in the UI.

### Starting the project

1. Run `pnpm run dev`
2. Open `localhost:5173` in browser.

### Using the dApp

This application contains a simple form that allows you to transfer WBTC between accounts with the gas fee paid in WBTC. Simply enter the WBTC amount and the recipient's EVM address and the transaction will be sent to the Open Gas Network relay and relayed using the WBTC paymaster.

Note: _Before the first relayed transaction is done, the paymaster smart contract has to be approved to spend your WBTC. That is why there will be a transaction request before the first relayed transfer transaction._

- WBTC contract address: `0x2868d708e442A6a940670d26100036d426F1e16b`
- Paymaster contract address: `0x777FA19ea9e771018678161ABf2f1E2879D3cA6C`
- OpenGSN relayer: `https://gsn-relay-fluffy-bob.gobob.xyz`

### Interacting with OpenGSN relay

To allow simple interaction with the relay `ethers.Contract` instance is created using OpenGSN provider:

```typescript
const getRelayedContract = async (contractType: ContractType) => {
  if (!window.ethereum) {
    throw new Error('Injected provider not found!');
  }

  const { address, abi } = contracts[contractType];

  const config = {
    preferredRelays: ['https://gsn-relay-fluffy-bob.gobob.xyz'],
    performDryRunViewRelayCall: false,
    gasPriceSlackPercent: 1000,
    maxPaymasterDataLength: 100,
    paymasterAddress: erc20PaymasterAddress
  };

  const gsnProvider = await RelayProvider.newProvider({
    provider: window.ethereum,
    config,
    overrideDependencies: { asyncPaymasterData: getErc20PaymasterData }
  }).init();

  const ethersProvider = new providers.Web3Provider(gsnProvider);

  const relayedContract = new Contract(address, abi, ethersProvider.getSigner());

  return relayedContract;
};
```

Then the `Contract` instance can be used in a standard way:

```typescript
const transferTx = await relayedContract.transfer(form.address, atomicAmount.toString());

await transferTx.wait();
```
