import { Card, Flex, H1, Input, TokenInput } from '@interlay/ui';
import { Layout } from './components';

import { useForm } from '@interlay/hooks';
import { mergeProps } from '@react-aria/utils';
import { useMutation } from '@tanstack/react-query';
import { Key, useEffect, useState } from 'react';
import { StyledWrapper } from './App.style';
import { AuthCTA } from './components/AuthCTA';
import { CurrencyTicker, Erc20CurrencyTicker } from './constants';
import { useBalances } from './hooks/useBalances';
import { isFormDisabled } from './utils/validation';
import './utils/yup.custom';
import { useAccountAbstraction } from './aa/context';

type TransferForm = {
  amount: string;
  ticker: string;
  address: string;
};

function App() {
  const {client} = useAccountAbstraction();

  console.log(client)
  const [ticker, setTicker] = useState<CurrencyTicker>(Erc20CurrencyTicker.WBTC);
  const { balances, getBalance } = useBalances();
  const mutation = useMutation({
    mutationFn: async (form: TransferForm) => {
      console.log(form);

      return;
    }
  });

  const handleSubmit = (values: TransferForm) => {
    mutation.mutate(values);
  };

  const balance = getBalance(ticker);

  const form = useForm<TransferForm>({
    initialValues: {
      amount: '',
      ticker: 'WBTC',
      address: ''
    },
    onSubmit: handleSubmit,
    hideErrors: 'untouched'
  });

  useEffect(() => {
    if (!balances) return;

    form.validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances]);

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
                  type='selectable'
                  label='Offer'
                  balance={balance?.toBig().toString()}
                  valueUSD={0}
                  selectProps={mergeProps(
                    {
                      items: [
                        {
                          value: 'WBTC',
                          balance: getBalance(Erc20CurrencyTicker.WBTC).toBig().toNumber(),
                          balanceUSD: 0
                        },
                        {
                          value: 'ETH',
                          balance: getBalance(Erc20CurrencyTicker.WBTC).toBig().toNumber(),
                          balanceUSD: 0
                        },
                        {
                          value: 'USDT',
                          balance: getBalance(Erc20CurrencyTicker.USDT).toBig().toNumber(),
                          balanceUSD: 0
                        }
                      ],
                      onSelectionChange: (key: Key) => setTicker(key as Erc20CurrencyTicker)
                    },
                    form.getSelectFieldProps('ticker')
                  )}
                  {...form.getTokenFieldProps('amount')}
                />
                <Input label='Address' placeholder='Enter address' {...form.getFieldProps('address')} />
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
