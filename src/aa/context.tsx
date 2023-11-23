import { BaseAccountAPI, HttpRpcClient } from '@account-abstraction/sdk';
import { createContext, useContext, useEffect, useState } from 'react';
import { providers } from 'ethers';
import { wrapProvider } from './utils';
import { HexString } from '../types';
import { Web3Provider } from '@ethersproject/providers';

const ENTRY_POINT_ADDRESS = '0x8B2e6AA2451a49d2cb124f69896Bc927333c7f33';

type accountAbstractionContextValue = {
  client?: AaClient;
};

const initialState = {
  client: undefined
};

const accountAbstractionContext = createContext<accountAbstractionContextValue>(initialState);

const useAccountAbstraction = () => {
  const context = useContext(accountAbstractionContext);

  if (!context) {
    throw new Error('useAccountAbstraction should be used within an AccountAbstraction Provider');
  }

  return context;
};

interface AaClientConstructorOpts {
  bundlerUrl?: string;
}

class AaClient {
  public isInitialized = false;
  public accountApi: BaseAccountAPI | null = null;
  public smartAccountAddress: HexString | null = null;
  public rpcClient: HttpRpcClient | null = null;

  private _signer: providers.JsonRpcSigner | null = null;
  private _injectedProvider: Web3Provider;

  constructor(opts: AaClientConstructorOpts = {}) {
    if (!window.ethereum) {
      throw new Error('Injected wallet not found.');
    }
    this._injectedProvider = new providers.Web3Provider(window.ethereum);

    this._initialize(opts);
  }

  /**
   * Initializes connection to bundler and prepares class members.
   * @param opts Initialization params.
   */
  private async _initialize(opts: AaClientConstructorOpts) {
    const config = {
      chainId: await this._injectedProvider.getNetwork().then((network) => network.chainId),
      entryPointAddress: ENTRY_POINT_ADDRESS,
      bundlerUrl: opts.bundlerUrl || 'http://localhost:3000/rpc'
    };

    this._signer = this._injectedProvider.getSigner();

    const wrappedProvider = await wrapProvider(this._injectedProvider, config, this._signer);

    this.smartAccountAddress = (await wrappedProvider.smartAccountAPI.getAccountAddress()) as HexString;
    this.accountApi = wrappedProvider.smartAccountAPI;
    this.rpcClient = wrappedProvider.httpRpcClient;

    this.isInitialized = true;
  }

  private _checkInitialized() {
    if (!this.isInitialized) {
      throw new Error('AA client is not initialized yet.');
    }
  }

  protected async _preUserOp() {
    this._checkInitialized();
    // TODO: check if the account has funded entrypoint yet.
    // If not, then:
    // Fund the account.
    const hexStrippedSmartAccount = this.smartAccountAddress!.slice(2);
    await this._signer!.sendTransaction({
      to: ENTRY_POINT_ADDRESS,
      value: 1000000000000000,
      data: `0xb760faf9000000000000000000000000${hexStrippedSmartAccount}`,
      gasLimit: 100000
    }).then(async (tx) => await tx.wait());
  }

  public async sendUserOp() {
    await this._preUserOp();
    // TODO: should this accept already created userOp only?
  }
}

const AccountAbstractionProvider = ({ children }: { children: JSX.Element }) => {
  // const [accountAPI, setAccountAPI] = useState<BaseAccountAPI>();
  // const [bundlerClient, setBundlerClient] = useState<HttpRpcClient>();
  // const [address, setAddress] = useState<`0x${string}`>();
  const [client, setClient] = useState<AaClient>();

  useEffect(() => {
    const aaClient = new AaClient();
    setClient(aaClient);
  }, []);

  // const { address: ownerAddress } = useAccount({
  //   onConnect: async ({ address, connector }) => {
  //     // if (!address || !connector || !window.ethereum) return;
  //     const aaClient = new AaClient();
  //     setClient(aaClient);
  //     // const signerProvider = new providers.Web3Provider(window.ethereum);

  //     // const config = {
  //     //   chainId: await signerProvider.getNetwork().then((net) => net.chainId),
  //     //   entryPointAddress: ENTRY_POINT_ADDRESS,
  //     //   bundlerUrl: 'http://localhost:3000/rpc'
  //     // };

  //     // const owner = signerProvider.getSigner();

  //     // const wrappedProvider = await wrapProvider(signerProvider, config, owner);

  //     // const smartAccountAddress = await wrappedProvider.smartAccountAPI.getAccountAddress();

  //     // // TODO: check if the account has funded entrypoint yet.
  //     // // If not, then:
  //     // // Fund the account.
  //     // await signerProvider
  //     //   .getSigner()
  //     //   .sendTransaction({
  //     //     to: ENTRY_POINT_ADDRESS,
  //     //     value: 1000000000000000,
  //     //     data: `0xb760faf9000000000000000000000000${smartAccountAddress.slice(2)}`,
  //     //     gasLimit: 100000
  //     //   })
  //     //   .then(async (tx) => await tx.wait());

  //     // setAddress(smartAccountAddress as `0x${string}`);
  //     // setAccountAPI(wrappedProvider.smartAccountAPI);
  //     // setBundlerClient(wrappedProvider.httpRpcClient);
  //   }
  // });

  const state = {
    client
  };

  return <accountAbstractionContext.Provider value={state}>{children}</accountAbstractionContext.Provider>;
};

export { AccountAbstractionProvider, useAccountAbstraction };
