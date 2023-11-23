import { Card, Flex, H1, Input, TokenInput } from '@interlay/ui';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { Layout } from './components';
import { L2_CHAIN_CONFIG, L2_PROJECT_ID, config } from './connectors/wagmi-connectors';

import { useForm } from '@interlay/hooks';
import { useMutation } from '@tanstack/react-query';
import { StyledWrapper } from './App.style';
import { AuthCTA } from './components/AuthCTA';
import { isFormDisabled } from './utils/validation';
import './utils/yup.custom';
import { useAccountAbstraction } from './aa/context';

type TransferForm = {
  amount: string;
  address: string;
};

createWeb3Modal({
  defaultChain: L2_CHAIN_CONFIG,
  wagmiConfig: config,
  projectId: L2_PROJECT_ID,
  chains: config.chains
});

function App() {
  const {client} = useAccountAbstraction();

  console.log(client)
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
          <H1 align='center' size='xl'>
            Transfer
          </H1>
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
                <Input label='Address' placeholder='Enter your bitcoin address' {...form.getFieldProps('address')} />
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
