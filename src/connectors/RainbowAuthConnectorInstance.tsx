import { Wallet } from '@rainbow-me/rainbowkit';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { Web3Auth } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector';
import { Chain } from 'viem';

const name = 'My App Name';
const iconUrl = 'https://web3auth.io/docs/contents/logo-ethereum.png';

export const rainbowWeb3AuthConnector = ({ chains }: { chains: Chain[] }): Wallet => {
  // Create Web3Auth Instance
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x' + chains[0].id.toString(16),
    rpcTarget: chains[0].rpcUrls.default.http[0], // This is the public RPC we have added, please pass on your own endpoint while creating an app
    displayName: chains[0].name,
    tickerName: chains[0].nativeCurrency?.name,
    ticker: chains[0].nativeCurrency?.symbol,
    blockExplorer: chains[0].blockExplorers?.default.url[0] as string
  };

  const web3AuthInstance = new Web3Auth({
    clientId: 'BNb7d5td0513e3XyZ3PLzk-jE6YtISkFLLXRKLqMrPzPZXiV9SxqWvn7w0MCDBFsth6w9Fgx9JWW2jcfKR56mUc', // Get your Client ID from the Web3Auth Dashboard
    web3AuthNetwork: 'sapphire_devnet',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chainConfig: chainConfig as any,
    uiConfig: {
      appName: name,
      loginMethodsOrder: ['github', 'google'],
      defaultLanguage: 'en',
      modalZIndex: '2147483647'
    },
    enableLogging: true
  });

  // Add openlogin adapter for customisations
  const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
  const openloginAdapterInstance = new OpenloginAdapter({
    privateKeyProvider,
    adapterSettings: {
      network: 'cyan',
      uxMode: 'popup',
      whiteLabel: {
        logoLight: iconUrl,
        logoDark: iconUrl,
        defaultLanguage: 'en'
      }
    }
  });
  web3AuthInstance.configureAdapter(openloginAdapterInstance);

  return {
    id: 'web3auth',
    name,
    iconUrl,
    iconBackground: '#fff',
    createConnector: () => {
      const connector = new Web3AuthConnector({
        chains: chains,
        options: {
          web3AuthInstance,

          modalConfig: {
            [WALLET_ADAPTERS.OPENLOGIN]: {
              loginMethods: {
                google: {
                  name: 'google login',
                  logoDark: 'url to your custom logo which will shown in dark mode'
                },
                facebook: {
                  // it will hide the facebook option from the Web3Auth modal.
                  name: 'facebook login',
                  showOnModal: false
                }
              },
              label: 'Wallet Connect'
            },
            [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
              showOnModal: false,
              label: 'Wallet Connect'
            },
            [WALLET_ADAPTERS.METAMASK]: {
              showOnModal: false,
              label: 'Wallet Connect'
            },
            [WALLET_ADAPTERS.COINBASE]: {
              showOnModal: false,
              label: 'Wallet Connect'
            }
          }
        }
      });
      return {
        connector
      };
    }
  };
};
