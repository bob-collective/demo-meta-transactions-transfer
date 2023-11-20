import { Card, Flex, Input, TokenInput } from '@interlay/ui';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { createConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { Layout } from './components';
import { L2_CHAIN_CONFIG, L2_METADATA, L2_PROJECT_ID, config, publicClient } from './connectors/wagmi-connectors';

import { useForm } from '@interlay/hooks';
import { useMutation } from '@tanstack/react-query';
import { AuthCTA } from './components/AuthCTA';
import { isFormDisabled } from './utils/validation';
import './utils/yup.custom';
import { StyledWrapper } from './App.style';

type TransferForm = {
  amount: string;
  address: string;
};

const chains = [L2_CHAIN_CONFIG];

const wagmiConfig = createConfig({
  autoConnect: true,

  connectors: [
    new WalletConnectConnector({
      chains,
      options: { projectId: L2_PROJECT_ID, showQrModal: false, metadata: L2_METADATA }
    }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }) // new InjectedConnector({ chains, options: { shimDisconnect: true } })
  ],
  publicClient
});

// const wagmiConfig = createConfig({ chains: [, projectId: L2_PROJECT_ID, metadata: L2_METADATA });

createWeb3Modal({
  defaultChain: L2_CHAIN_CONFIG,
  wagmiConfig: wagmiConfig,
  projectId: L2_PROJECT_ID,
  chains: config.chains
});

function App() {
  const mutation = useMutation({
    mutationFn: async (form: TransferForm) => {
      console.log(form);

      return;
    }
  });

  const handleSubmit = (values: TransferForm) => {
    mutation.mutate(values);
  };

  const form = useForm<TransferForm>({
    initialValues: {
      amount: '',
      address: ''
    },
    onSubmit: handleSubmit,
    hideErrors: 'untouched'
  });

  const isSubmitDisabled = isFormDisabled(form);

  return (
    <Layout>
      <StyledWrapper direction='column' gap='spacing4'>
        <Card>
          <form onSubmit={form.handleSubmit}>
            <Flex marginTop='spacing4' direction='column' gap='spacing8'>
              <Flex direction='column' gap='spacing4'>
                <TokenInput
                  type='fixed'
                  label='Amount'
                  ticker='BTC'
                  valueUSD={0}
                  {...form.getTokenFieldProps('amount')}
                />
                <Input
                  label='Bitcoin Address'
                  placeholder='Enter your bitcoin address'
                  {...form.getFieldProps('address')}
                />
              </Flex>
              <AuthCTA loading={mutation.isLoading} disabled={isSubmitDisabled} size='large' type='submit' fullWidth>
                Transfer
              </AuthCTA>
            </Flex>
          </form>
        </Card>
      </StyledWrapper>
    </Layout>
  );
}

export default App;
