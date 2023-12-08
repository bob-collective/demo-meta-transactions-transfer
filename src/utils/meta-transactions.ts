import { RelayProvider } from '@opengsn/provider';
import { providers, Contract } from 'ethers';
import { contracts, ContractType } from '../constants';
import { ExternalProvider } from '@ethersproject/providers';

const erc20PaymasterAddress = contracts[ContractType.ERC20_PAYMASTER].address;

async function getErc20PaymasterData() {
  return (
    '0x0000000000000000000000002868d708e442A6a940670d26100036d426F1e16b' +
    '0000000000000000000000000000000000000000000000fffffffff3a7640000'
  );
}

const getRelayedContract = async (contractType: ContractType) => {
  if (!window.ethereum) {
    throw new Error('Injected provider not found!');
  }
  console.log(window.ethereum);
  const { address, abi } = contracts[contractType];

  const config = {
    preferredRelays: ['https://gsn-relay-sepolia.gobob.xyz/'],
    performDryRunViewRelayCall: false,
    gasPriceSlackPercent: 1000,
    maxPaymasterDataLength: 100,
    paymasterAddress: erc20PaymasterAddress
  };

  const gsnProvider = await RelayProvider.newProvider({
    provider: window.ethereum as unknown as ExternalProvider,
    config,
    overrideDependencies: { asyncPaymasterData: getErc20PaymasterData }
  }).init();

  const ethersProvider = new providers.Web3Provider(gsnProvider as unknown as providers.ExternalProvider);

  const relayedContract = new Contract(address, abi, ethersProvider.getSigner());

  return relayedContract;
};

export { getRelayedContract };
