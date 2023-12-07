import { ERC20Abi } from '../contracts/abi/ERC20.abi';
import { FaucetAbi } from '../contracts/abi/Faucet.abi';
import { HexString } from '../types';
import { Erc20Currencies, Erc20CurrencyTicker } from './currencies';

// TODO: Figure out how we can reuse the ERC20Currency enum
//       here without need to re-define currencies again.
enum ContractType {
  WBTC = 'WBTC',
  USDC = 'USDC',
  // ERC20_MARKETPLACE = 'ERC20_MARKETPLACE',
  // BTC_MARKETPLACE = 'BTC_MARKETPLACE',
  FAUCET = 'FAUCET',
  ERC20_PAYMASTER = 'ERC20_PAYMASTER'
}

// Contracts config with contract address and ABI
// that is used in useContract hook to automatically infer smart contract types.
const contracts = {
  // Automatically adds all ERC20 currencies contracts here.
  ...Object.entries(Erc20Currencies).reduce(
    (result, [key, value]) => ({ ...result, [key as ContractType]: { ...value, abi: ERC20Abi } }),
    {} as { [ticker in Erc20CurrencyTicker]: { abi: typeof ERC20Abi; address: HexString } }
  ),
  [ContractType.FAUCET]: {
    // TODO: switch to deployed contract address
    address: '0x7884560F14c62E0a83420F17832988cC1a775df1',
    abi: FaucetAbi
  },
  [ContractType.ERC20_PAYMASTER]: {
    address: '0x25Aa86d188E37A47dd2011535534E53Cf994559d',
    abi: []
  }
} as const;

export { ContractType, contracts };
