import { RelayProvider } from '@opengsn/provider';
import { providers, Contract } from 'ethers';
import { contracts, ContractType } from '../constants';

const erc20PaymasterAddress = contracts[ContractType.ERC20_PAYMASTER].address;

async function getErc20PaymasterData() {
  return (
    '0x000000000000000000000000833d9398A3DBa68994AdE7Db42Ff597831933aeD' +
    '0000000000000000000000000000000000000000000000fffffffff3a7640000'
  );
}

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

  const ethersProvider = new providers.Web3Provider(gsnProvider as unknown as providers.ExternalProvider);

  const relayedContract = new Contract(address, abi, ethersProvider.getSigner());

  return relayedContract;
};

export { getRelayedContract };
